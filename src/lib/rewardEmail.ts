// One-time and post-purchase "your 10%" email: same look as the order emails. The offer is the
// /rewards program (video + honest review of ANY rating earns 10% off one item on the next order).
// Never ask for 5 stars or tie the code to a positive rating (FTC consumer review rule, platform
// policies), and always say the discount is an incentive.

const PAGE = "#000000";
const CARD = "#0d0d0d";
const PANEL = "#1a1a1a";
const ACCENT = "#7ccf00";
const TEXT = "#ffffff";
const MUTED = "#8a8a8a";
const LINE = "#2a2a2a";
const HEADING_FONT = "'Oswald Stencil', Impact, 'Arial Narrow Bold', 'Arial Narrow', sans-serif";
const BODY_FONT = "Cabin, Helvetica, Arial, sans-serif";
const solid = (c: string) => `background:${c};`;
const SITE = "https://www.xstaticfit.com";
const UTM = "utm_source=reward_email&utm_medium=email&utm_campaign=welcome_warrior_10";

export const REWARD_COPY = {
  en: {
    subject: "Welcome Warrior: your 10% off your next order",
    eyebrow: "Welcome Warrior",
    title: "Your 10% is waiting.",
    lead: "Thank you for choosing Xstatic Fit. You just started this journey, and we want to see how it goes.",
    stepsTitle: "How it works",
    steps: [
      ["1", "Use your gear.", "Train with it like you normally do."],
      ["2", "Send us a short video and your honest review.", "Any rating. We want the truth, good or bad."],
      ["3", "We email you a 10% code.", "Good for any single item on your next order."],
    ],
    send: "Send us your video",
    sendHow: "The button opens a chat with @xstaticfit on Instagram, where long videos send easily. Mention your order. Prefer email? Write to contact@xstaticfit.com.",
    shop: "See the rest of the gear",
    fine: [
      "Your review is voluntary and never has to be positive. The 10% is a thank-you for sharing your experience, not for a rating.",
      "The code works on any single item. It does not combine with the kit discount for taking all three products.",
    ],
    why: "You are receiving this email because you bought from Xstatic Fit. If you prefer not to get emails like this, reply with \"no\" and we will take you off the list.",
  },
  es: {
    subject: "Welcome Warrior: tu 10% en el próximo pedido",
    eyebrow: "Welcome Warrior",
    title: "Tu 10% te está esperando.",
    lead: "Gracias por elegir Xstatic Fit. Acabas de empezar este camino y queremos ver cómo te va.",
    stepsTitle: "Así funciona",
    steps: [
      ["1", "Usa tu equipo.", "Entrena con él como lo haces normalmente."],
      ["2", "Mándanos un video corto y tu reseña honesta.", "Cualquier calificación. Queremos la verdad, buena o mala."],
      ["3", "Te enviamos por email un código de 10%.", "Sirve para cualquier producto de tu próximo pedido."],
    ],
    send: "Mándanos tu video",
    sendHow: "El botón abre un chat con @xstaticfit en Instagram, donde los videos largos se envían sin problema. Menciona tu pedido. ¿Prefieres correo? Escribe a contact@xstaticfit.com.",
    shop: "Ver el resto del equipo",
    fine: [
      "Tu reseña es voluntaria y no tiene que ser positiva. El 10% es un agradecimiento por compartir tu experiencia, no por una calificación.",
      "El código sirve para un solo producto. No se combina con el descuento del kit por llevar los tres.",
    ],
    why: "Recibes este correo porque compraste en Xstatic Fit. Si prefieres no recibir correos como este, responde \"no\" y te sacamos de la lista.",
  },
} as const;

function esc(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderRewardHtml(lang: "en" | "es", postalAddress: string, unsubscribeUrl?: string) {
  const c = REWARD_COPY[lang];
  const steps = c.steps
    .map(
      ([n, head, sub]) => `<tr>
        <td width="44" valign="top" style="padding:14px 0;border-bottom:1px solid ${LINE};"><div style="width:32px;height:32px;line-height:32px;text-align:center;background:${ACCENT};color:#0d0d0d;font-family:${HEADING_FONT};font-size:16px;">${n}</div></td>
        <td valign="top" style="padding:14px 0;border-bottom:1px solid ${LINE};">
          <div style="font-family:${BODY_FONT};font-size:16px;font-weight:700;line-height:1.4;color:${TEXT};">${esc(head)}</div>
          <div style="font-family:${BODY_FONT};font-size:14px;line-height:1.5;color:${MUTED};margin-top:2px;">${esc(sub)}</div>
        </td></tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>
:root { color-scheme: dark; supported-color-schemes: dark; }
@font-face { font-family: 'Oswald Stencil'; src: url('${SITE}/fonts/Oswald-Stencil.ttf') format('truetype'); font-weight: normal; font-style: normal; }
</style>
</head>
<body style="margin:0;padding:0;${solid(PAGE)}" bgcolor="${PAGE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE}" style="${solid(PAGE)}padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${CARD}" style="max-width:560px;${solid(CARD)}">
    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:28px 28px 22px;border-bottom:4px solid ${ACCENT};">
      <div style="font-family:${HEADING_FONT};font-size:30px;letter-spacing:4px;color:${TEXT};text-transform:uppercase;">Xstatic Fit</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:36px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:4px;text-transform:uppercase;color:${ACCENT};">${esc(c.eyebrow)}</div>
      <div style="font-family:${HEADING_FONT};font-size:46px;line-height:1.08;color:${TEXT};text-transform:uppercase;margin-top:8px;">${esc(c.title)}</div>
      <div style="font-family:${BODY_FONT};font-size:16px;line-height:1.6;color:${TEXT};margin-top:14px;">${esc(c.lead)}</div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:22px 28px 8px;">
      <div style="font-family:${HEADING_FONT};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${MUTED};margin:0 0 6px;">${esc(c.stepsTitle)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${LINE};">${steps}</table>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:22px 28px 8px;">
      <div style="${solid(PANEL)}border-left:4px solid ${ACCENT};padding:18px 20px;">
        <a href="https://ig.me/m/xstaticfit" style="display:inline-block;background:${ACCENT};color:#0d0d0d;font-family:${HEADING_FONT};font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">${esc(c.send)}</a>
        <div style="font-family:${BODY_FONT};font-size:14px;line-height:1.6;color:${MUTED};margin-top:12px;">${esc(c.sendHow)}</div>
      </div>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:18px 28px 8px;">
      <a href="${SITE}/shop?${UTM}" style="font-family:${HEADING_FONT};font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};text-decoration:none;border-bottom:2px solid ${ACCENT};padding-bottom:3px;">${esc(c.shop)} &rarr;</a>
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}padding:26px 28px 24px;">
      ${c.fine.map((f) => `<div style="font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${MUTED};margin-bottom:8px;">${esc(f)}</div>`).join("")}
    </td></tr>

    <tr><td bgcolor="${CARD}" style="${solid(CARD)}border-top:1px solid ${LINE};padding:16px 28px;font-family:${BODY_FONT};font-size:11px;line-height:1.6;color:${MUTED};">
      ${esc(c.why)}${unsubscribeUrl ? ` <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">${lang === "es" ? "Cancelar suscripción" : "Unsubscribe"}</a>.` : ""}<br><br>Xstatic Fit &middot; xstaticfit.com<br>${esc(postalAddress)}
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}
