import { CARRIER_NAME, type Lang, type TrackingEntry } from "./shipping";

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

const COPY = {
  en: {
    subject: "Your Xstatic Fit order is on the way",
    eyebrow: "Order shipped",
    headline: "Your order is on the way",
    hello: (first: string) => `Hi ${first},`,
    introOne: "your order has shipped. Here is your tracking number.",
    introMany: (n: number) => `your order is shipping in ${n} packages. Here are your tracking numbers.`,
    package: (i: number, of: number) => (of > 1 ? `Package ${i}` : "Tracking number"),
    track: (i: number, of: number, carrier: string) =>
      of > 1 ? `Track package ${i}` : carrier ? `Track with ${carrier}` : "Track package",
    closing: "Thank you for your order. If you have any questions, just reply to this email.",
    signoff: "Raising warriors",
  },
  es: {
    subject: "Tu pedido de Xstatic Fit va en camino",
    eyebrow: "Pedido enviado",
    headline: "Tu pedido ya salió",
    hello: (first: string) => `Hola ${first},`,
    introOne: "tu pedido ya está en camino. Aquí tienes tu número de rastreo.",
    introMany: (n: number) => `tu pedido va en ${n} paquetes. Aquí tienes los números de rastreo.`,
    package: (i: number, of: number) => (of > 1 ? `Paquete ${i}` : "Número de rastreo"),
    track: (i: number, of: number, carrier: string) =>
      of > 1 ? `Rastrear paquete ${i}` : carrier ? `Rastrear con ${carrier}` : "Rastrear paquete",
    closing: "Gracias por tu pedido. Si tienes cualquier pregunta, responde este correo.",
    signoff: "Raising warriors",
  },
} as const;

export type ShippedEmailInput = {
  name: string;
  tracking: TrackingEntry[];
  lang: Lang;
};

export type ShippedEmail = { subject: string; html: string; text: string };

function firstName(name: string) {
  const first = name.trim().split(/\s+/)[0];
  return first && first.toLowerCase() !== "unknown" ? first : "";
}

export function renderShippedEmail({ name, tracking, lang }: ShippedEmailInput): ShippedEmail {
  const c = COPY[lang];
  const n = tracking.length;
  const first = firstName(name);
  const greeting = first ? c.hello(first) : lang === "es" ? "Hola," : "Hi,";
  const intro = n > 1 ? c.introMany(n) : c.introOne;
  // "Hi Maria, your order..." / "Hola Maria, tu pedido..."
  const lead = first ? `${greeting} ${intro}` : `${greeting} ${intro.charAt(0).toUpperCase()}${intro.slice(1)}`;

  const label = (t: string) =>
    `<div style="font-family:${HEADING_FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin:0 0 8px;">${esc(t)}</div>`;

  const panels = tracking
    .map((t, i) => {
      const carrierName = CARRIER_NAME[t.carrier];
      const button = t.url
        ? `<a href="${esc(t.url)}" style="display:inline-block;background:${ACCENT};color:#0d0d0d;font-family:${HEADING_FONT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">${esc(c.track(i + 1, n, carrierName))}</a>`
        : "";
      return `<tr><td bgcolor="${CARD}" style="background:${CARD};padding:${i === 0 ? 20 : 14}px 28px 8px;">
      <div style="background:${PANEL};border-left:4px solid ${ACCENT};padding:18px 20px;">
        ${label(c.package(i + 1, n))}
        <div style="font-family:${HEADING_FONT};font-size:20px;letter-spacing:1px;color:${TEXT};margin-bottom:${t.url ? 14 : 0}px;">${esc(t.display)}</div>
        ${button}
      </div>
    </td></tr>`;
    })
    .join("\n");

  const html = `<!doctype html>
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
<body style="margin:0;padding:0;background:${PAGE};" bgcolor="${PAGE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="background:${PAGE};padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="max-width:560px;background:${CARD};">
    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:28px 28px 22px;border-bottom:4px solid ${ACCENT};">
      <div style="font-family:${HEADING_FONT};font-size:30px;letter-spacing:4px;color:${TEXT};text-transform:uppercase;">Xstatic Fit</div>
    </td></tr>
    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:32px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};">${esc(c.eyebrow)}</div>
      <div style="font-family:${HEADING_FONT};font-size:44px;line-height:1.1;color:${TEXT};margin-top:6px;">${esc(c.headline)}</div>
      <div style="font-family:${BODY_FONT};font-size:16px;line-height:1.6;color:${TEXT};margin-top:14px;">${esc(lead)}</div>
    </td></tr>
    ${panels}
    <tr><td bgcolor="${CARD}" style="background:${CARD};padding:24px 28px 32px;">
      <div style="font-family:${BODY_FONT};font-size:15px;line-height:1.7;color:${TEXT};">${esc(c.closing)}</div>
      <div style="font-family:${HEADING_FONT};font-size:14px;letter-spacing:3px;text-transform:uppercase;color:${ACCENT};margin-top:18px;">${esc(c.signoff)}</div>
    </td></tr>
    <tr><td bgcolor="${CARD}" style="background:${CARD};border-top:1px solid ${LINE};padding:16px 28px;font-family:${BODY_FONT};font-size:12px;color:${MUTED};">
      Xstatic Fit &middot; xstaticfit.com
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const textLines = [lead, ""];
  tracking.forEach((t, i) => {
    textLines.push(`${c.package(i + 1, n)}: ${t.display}`);
    if (t.url) textLines.push(t.url);
    textLines.push("");
  });
  textLines.push(c.closing, "", c.signoff, "Xstatic Fit");

  return { subject: c.subject, html, text: textLines.join("\n") };
}
