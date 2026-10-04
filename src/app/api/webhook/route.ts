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

const PAGE = "#000000";
const CARD = "#0d0d0d";
const PANEL = "#1a1a1a";
const ACCENT = "#7ccf00";
const TEXT = "#ffffff";
const MUTED = "#8a8a8a";
const LINE = "#2a2a2a";
const HEADING_FONT = "'Oswald Stencil', Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif";
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
    `<div style="font-family:${HEADING_FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;">${t}</div>`;

  const addressHtml = o.addressLines.map((l) => esc(l)).join("<br>");

  const itemRows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${BODY_FONT};font-size:15px;color:${TEXT};">${esc(i.label)}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid ${LINE};font-family:${HEADING_FONT};font-size:15px;color:${TEXT};white-space:nowrap;">x ${i.qty}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
@font-face { font-family: 'Oswald Stencil'; src: url('https://www.xstaticfit.com/fonts/Oswald-Stencil.ttf') format('truetype'); font-weight: normal; font-style: normal; }
</style>
</head>
<body style="margin:0;padding:0;background:${PAGE};" bgcolor="${PAGE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="background:${PAGE};padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="max-width:560px;background:${CARD};">
    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:28px 28px 22px;border-bottom:4px solid ${ACCENT};">
      <div style="font-family:${HEADING_FONT};font-size:30px;letter-spacing:4px;color:${TEXT};text-transform:uppercase;">Xstatic Fit</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:32px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};">New order</div>
      <div style="font-family:${HEADING_FONT};font-size:48px;line-height:1.1;color:${TEXT};margin-top:6px;">$${esc(o.total)}</div>
      <div style="font-family:${BODY_FONT};font-size:14px;color:${MUTED};margin-top:2px;">${esc(o.currency)}</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:20px 28px 8px;">
      <div style="background:${PANEL};border-left:4px solid ${ACCENT};padding:18px 20px;">
        ${label("Ship to")}
        <div style="font-family:${HEADING_FONT};font-size:24px;letter-spacing:1px;color:${TEXT};margin-bottom:6px;">${esc(o.name)}</div>
        <div style="font-family:${BODY_FONT};font-size:16px;line-height:1.5;color:${TEXT};">${addressHtml}</div>
      </div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:16px 28px 8px;">
      ${label("Contact")}
      <div style="font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:${TEXT};">
        ${esc(o.email)}${o.phone === "none" ? "" : `<br>${esc(o.phone)}`}
      </div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:16px 28px 8px;">
      ${label("Items")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">${itemRows}</table>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:24px 28px 32px;">
      <a href="${esc(o.stripeUrl)}" style="display:inline-block;background:${ACCENT};color:#0d0d0d;font-family:${HEADING_FONT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">View in Stripe</a>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="background:${CARD};border-top:1px solid ${LINE};padding:16px 28px;font-family:${BODY_FONT};font-size:12px;color:${MUTED};">
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
