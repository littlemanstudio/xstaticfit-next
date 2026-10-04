const PAGE = "#000000";
const CARD = "#0d0d0d";
const PANEL = "#1a1a1a";
const ACCENT = "#7ccf00";
const solid = (c: string) => `background:${c};`;
const TEXT = "#ffffff";
const MUTED = "#8a8a8a";
const LINE = "#2a2a2a";
const HEADING_FONT = "'Oswald Stencil', Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif";
const BODY_FONT = "Cabin, Helvetica, Arial, sans-serif";
const BG_PAGE = solid(PAGE);
const BG_CARD = solid(CARD);
const BG_PANEL = solid(PANEL);

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type OrderEmail = {
  name: string;
  addressLines: string[];
  email: string;
  phone: string;
  items: { qty: number; label: string }[];
  total: string;
  currency: string;
  stripeUrl: string;
};

export function renderOrderHtml(o: OrderEmail, kind: "owner" | "customer") {
  const isOwner = kind === "owner";
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
:root { color-scheme: dark; supported-color-schemes: dark; }
@font-face { font-family: 'Oswald Stencil'; src: url('https://www.xstaticfit.com/fonts/Oswald-Stencil.ttf') format('truetype'); font-weight: normal; font-style: normal; }
</style>
</head>
<body style="margin:0;padding:0;${BG_PAGE}" bgcolor="${PAGE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="${BG_PAGE}padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="max-width:560px;${BG_CARD}">
    <tr><td bgcolor="${CARD}" style="${BG_CARD}padding:28px 28px 22px;border-bottom:4px solid ${ACCENT};">
      <div style="font-family:${HEADING_FONT};font-size:30px;letter-spacing:4px;color:${TEXT};text-transform:uppercase;">Xstatic Fit</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${BG_CARD}padding:32px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};">${isOwner ? "New order" : "Order confirmed"}</div>
      <div style="font-family:${HEADING_FONT};font-size:48px;line-height:1.1;color:${TEXT};margin-top:6px;">$${esc(o.total)}</div>
      <div style="font-family:${BODY_FONT};font-size:14px;color:${MUTED};margin-top:2px;">${esc(o.currency)}</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${BG_CARD}padding:20px 28px 8px;">
      <div style="${BG_PANEL}border-left:4px solid ${ACCENT};padding:18px 20px;">
        ${label(isOwner ? "Ship to" : "Shipping to")}
        <div style="font-family:${HEADING_FONT};font-size:24px;letter-spacing:1px;color:${TEXT};margin-bottom:6px;">${esc(o.name)}</div>
        <div style="font-family:${BODY_FONT};font-size:16px;line-height:1.5;color:${TEXT};">${addressHtml}</div>
      </div>
    </td></tr>

    ${
      isOwner
        ? `<tr><td bgcolor="${CARD}" style="${BG_CARD}padding:16px 28px 8px;">
      ${label("Contact")}
      <div style="font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:${TEXT};">
        ${esc(o.email)}${o.phone === "none" ? "" : `<br>${esc(o.phone)}`}
      </div>
    </td></tr>`
        : ""
    }

    <tr><td bgcolor="${CARD}" style="${BG_CARD}padding:16px 28px 8px;">
      ${label("Items")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">${itemRows}</table>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${BG_CARD}padding:24px 28px 32px;">
      ${
        isOwner
          ? `<a href="${esc(o.stripeUrl)}" style="display:inline-block;background:${ACCENT};color:#0d0d0d;font-family:${HEADING_FONT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">View in Stripe</a>`
          : `<div style="font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${TEXT};">Thank you for your order. If anything looks off, just reply to this email and we will sort it out.</div>`
      }
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${BG_CARD}border-top:1px solid ${LINE};padding:16px 28px;font-family:${BODY_FONT};font-size:12px;color:${MUTED};">
      ${isOwner ? "Sent automatically when an order is paid on xstaticfit.com" : "Xstatic Fit &middot; xstaticfit.com"}
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

