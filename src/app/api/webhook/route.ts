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

async function sendOrderEmail(subject: string, text: string) {
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

    const items = (session.line_items?.data ?? [])
      .map((li) => `${li.quantity} x ${li.description}`)
      .join("\n");

    const addressBlock = addr
      ? [
          addr.line1,
          addr.line2,
          [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", "),
          addr.country,
        ]
          .filter(Boolean)
          .join("\n")
      : "No shipping address on this order";

    const text = [
      "NEW ORDER",
      "",
      `Name: ${name}`,
      "",
      "Ship to:",
      addressBlock,
      "",
      `Email: ${email}`,
      `Phone: ${phone}`,
      "",
      "Items:",
      items || "(none)",
      "",
      `Total: $${total} ${(session.currency ?? "usd").toUpperCase()}`,
      `Stripe: https://dashboard.stripe.com/payments/${session.payment_intent}`,
    ].join("\n");

    await sendOrderEmail(`New order $${total} - ${name}`, text);
  }

  return NextResponse.json({ received: true });
}
