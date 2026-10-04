import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

type Address = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

type ShippingDetails = { name?: string | null; address?: Address | null };

const INK = "#0d0d0d";
const ACCENT = "#7ccf00";
const MIST = "#f6f6f7";
const LINE = "#e6e6e6";
const HEADING_FONT = "Oswald, 'Arial Narrow', Impact, Arial, sans-serif";
const BODY_FONT = "Cabin, Helvetica, Arial, sans-serif";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type OrderEmail = {
  name: string;
  addressLines: string[];
  email: string;
  phone: string;
  items: { qty: number; label: string }[];
  total: string;
  currency: string;
  stripeUrl: string;
};

function renderOrderHtml(o: OrderEmail) {
  const label = (t: string) =>
    `<div style="font-family:${HEADING_FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#777;margin:0 0 8px;">${t}</div>`;

  const addressHtml = o.addressLines.map((l) => esc(l)).join("<br>");

  const itemRows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${BODY_FONT};font-size:15px;color:${INK};">${esc(i.label)}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${HEADING_FONT};font-size:15px;color:${INK};white-space:nowrap;">x ${i.qty}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${MIST};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${MIST};padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
    <tr><td style="background:${INK};padding:20px 28px;border-bottom:4px solid ${ACCENT};">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td><img src="https://www.xstaticfit.com/images/logo-white.png" width="44" height="44" alt="" style="display:block;border:0;"></td>
        <td style="padding-left:14px;font-family:${HEADING_FONT};font-size:22px;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">Xstatic Fit</td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:32px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};">New order</div>
      <div style="font-family:${HEADING_FONT};font-size:44px;line-height:1.1;color:${INK};margin-top:6px;">$${esc(o.total)}</div>
      <div style="font-family:${BODY_FONT};font-size:14px;color:#777;margin-top:2px;">${esc(o.currency)}</div>
    </td></tr>

    <tr><td style="padding:20px 28px 8px;">
      <div style="background:${MIST};border-left:4px solid ${ACCENT};padding:18px 20px;">
        ${label("Ship to")}
        <div style="font-family:${HEADING_FONT};font-size:22px;color:${INK};margin-bottom:6px;">${esc(o.name)}</div>
        <div style="font-family:${BODY_FONT};font-size:16px;line-height:1.5;color:${INK};">${addressHtml}</div>
      </div>
    </td></tr>

    <tr><td style="padding:16px 28px 8px;">
      ${label("Contact")}
      <div style="font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:${INK};">
        ${esc(o.email)}${o.phone === "none" ? "" : `<br>${esc(o.phone)}`}
      </div>
    </td></tr>

    <tr><td style="padding:16px 28px 8px;">
      ${label("Items")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">${itemRows}</table>
    </td></tr>

    <tr><td style="padding:24px 28px 32px;">
      <a href="${esc(o.stripeUrl)}" style="display:inline-block;background:${ACCENT};color:${INK};font-family:${HEADING_FONT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">View in Stripe</a>
    </td></tr>

    <tr><td style="background:${INK};padding:16px 28px;font-family:${BODY_FONT};font-size:12px;color:#9a9a9a;">
      Sent automatically when an order is paid on xstaticfit.com
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

async function sendOrderEmail(subject: string, text: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("Order email skipped (RESEND_API_KEY not set):", subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Xstatic Fit Orders <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? "xstaticfit@gmail.com",
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) console.error("Order email failed:", res.status, await res.text());
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

    const items = (session.line_items?.data ?? []).map((li) => ({
      qty: li.quantity ?? 1,
      label: li.description ?? "Item",
    }));

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

    await sendOrderEmail(`New order $${total} - ${name}`, text, renderOrderHtml(order));
  }

  return NextResponse.json({ received: true });
}
