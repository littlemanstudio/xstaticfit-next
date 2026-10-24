import { NextRequest, NextResponse, after } from "next/server";
import { getStripe } from "@/lib/stripe";
import { renderOrderHtml, type OrderEmail } from "@/lib/orderEmail";
import { sendCapiEvent } from "@/lib/meta/capi";
import { languageFor, subscribeEmail, trackEvent } from "@/lib/klaviyo";

type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type ShippingDetails = { name?: string | null; address?: Address | null };

const ORDERS_FROM = "Xstatic Fit <orders@xstaticfit.com>";
const OWNER_EMAIL = process.env.CONTACT_TO_EMAIL ?? "xstaticfit@gmail.com";

async function sendOrderEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  bcc?: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("Order email skipped (RESEND_API_KEY not set):", opts.subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: ORDERS_FROM,
      to: opts.to,
      reply_to: opts.replyTo,
      bcc: opts.bcc,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });
  if (!res.ok) console.error("Order email failed:", opts.to, res.status, await res.text());
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["line_items"],
    });

    const loose = session as unknown as {
      collected_information?: { shipping_details?: ShippingDetails | null } | null;
      shipping_details?: ShippingDetails | null;
    };
    const shipping = loose.collected_information?.shipping_details ?? loose.shipping_details;
    const addr = shipping?.address;

    const name = shipping?.name ?? session.customer_details?.name ?? "Unknown";
    const email = session.customer_details?.email ?? "none";
    const phone = session.customer_details?.phone ?? "none";
    const total = ((session.amount_total ?? 0) / 100).toFixed(2);

    // Meta Conversions API Purchase. event_id = Stripe Checkout Session id, the same id the
    // success page uses for the browser pixel Purchase, so Meta deduplicates the pair.
    // Runs after the response and never throws, so a Meta outage cannot fail the webhook.
    // Only sent when checkout stored meta_consent=granted (pixel configured, visitor did not decline).
    const meta = session.metadata ?? {};
    if (meta.meta_consent === "granted") {
      const purchaseUser = {
        email: session.customer_details?.email,
        phone: session.customer_details?.phone,
        city: addr?.city,
        state: addr?.state,
        zip: addr?.postal_code,
        country: addr?.country,
        clientIp: meta.meta_ip || null,
        userAgent: meta.meta_ua || null,
        fbp: meta.meta_fbp || null,
        fbc: meta.meta_fbc || null,
      };
      const contentIds = (meta.content_ids ?? "").split(",").filter(Boolean);
      after(() =>
        sendCapiEvent({
          eventName: "Purchase",
          eventId: session.id,
          eventSourceUrl: meta.meta_source_url || null,
          user: purchaseUser,
          custom: {
            value: (session.amount_total ?? 0) / 100,
            currency: (session.currency ?? "usd").toUpperCase(),
            content_ids: contentIds,
            num_items: Number(meta.num_items) || undefined,
            order_id: session.id,
          },
        })
      );
    }

    const items = (session.line_items?.data ?? []).map((li) => ({
      qty: li.quantity ?? 1,
      label: li.description ?? "Item",
    }));

    // Klaviyo: tell the marketing flows this person bought (stops welcome and cart emails, starts
    // post-purchase). Order and shipping emails still go out through Resend below.
    // Runs after the response and never throws.
    if (email !== "none") {
      const lang = languageFor(addr?.country);
      const consent = (session as unknown as { consent?: { promotions?: string | null } | null }).consent;
      after(async () => {
        if (consent?.promotions === "opt_in") {
          await subscribeEmail({ email, language: lang, source: "checkout" });
        }
        await trackEvent({
          email,
          metric: "Placed Order",
          language: lang,
          uniqueId: session.id,
          value: (session.amount_total ?? 0) / 100,
          properties: {
            order_id: session.id,
            items: items.map((i) => ({ name: i.label, quantity: i.qty })),
            product_names: items.map((i) => i.label),
            country: addr?.country ?? null,
          },
        });
      });
    }

    const addressLines = addr
      ? [
          addr.line1,
          addr.line2,
          [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
          addr.country,
        ].filter((l): l is string => Boolean(l))
      : ["No shipping address on this order"];

    const order: OrderEmail = {
      name,
      addressLines,
      email,
      phone,
      items,
      total,
      currency: (session.currency ?? "usd").toUpperCase(),
      stripeUrl: `https://dashboard.stripe.com/payments/${session.payment_intent}`,
    };

    const text = [
      "NEW ORDER",
      "",
      `Name: ${name}`,
      "",
      "Ship to:",
      addressLines.join("\n"),
      "",
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Items:",
      items.map((i) => `${i.qty} x ${i.label}`).join("\n") || "(none)",
      "",
      `Total: $${total} ${order.currency}`,
      `Stripe: ${order.stripeUrl}`,
    ].join("\n");

    await sendOrderEmail({
      to: OWNER_EMAIL,
      subject: `New order $${total} - ${name}`,
      text,
      html: renderOrderHtml(order, "owner"),
      replyTo: email === "none" ? undefined : email,
    });

    if (email !== "none") {
      const customerText = [
        "Your Xstatic Fit order is confirmed.",
        "",
        "Shipping to:",
        name,
        addressLines.join("\n"),
        "",
        "Items:",
        items.map((i) => `${i.qty} x ${i.label}`).join("\n") || "(none)",
        "",
        `Total: $${total} ${order.currency}`,
        "",
        "If anything looks off, just reply to this email.",
      ].join("\n");

      await sendOrderEmail({
        to: email,
        subject: "Your Xstatic Fit order is confirmed",
        text: customerText,
        html: renderOrderHtml(order, "customer"),
        replyTo: OWNER_EMAIL,
        bcc: OWNER_EMAIL,
      });
    }
  }

  // Abandoned checkout: only people who typed their email and ticked the marketing opt-in
  // on the Stripe page are sent to Klaviyo, with the link that reopens their cart.
  if (event.type === "checkout.session.expired") {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, {
      expand: ["line_items"],
    });
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const consent = (session as unknown as { consent?: { promotions?: string | null } | null }).consent;
    const recoveryUrl = session.after_expiration?.recovery?.url ?? null;
    if (email && recoveryUrl && consent?.promotions === "opt_in") {
      const items = (session.line_items?.data ?? []).map((li) => ({
        name: li.description ?? "Item",
        quantity: li.quantity ?? 1,
      }));
      const country = session.customer_details?.address?.country ?? null;
      const lang = languageFor(country);
      after(async () => {
        await subscribeEmail({ email, language: lang, source: "checkout" });
        await trackEvent({
          email,
          metric: "Checkout Abandoned",
          language: lang,
          uniqueId: session.id,
          value: (session.amount_total ?? 0) / 100,
          properties: {
            cart_url: recoveryUrl,
            items,
            cart_items_html: items.map((i) => `${i.name} x ${i.quantity}`).join("<br>"),
          },
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}
