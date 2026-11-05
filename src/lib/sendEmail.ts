import type { OutgoingEmail } from "./shipOrder";

export const ORDERS_FROM = "Xstatic Fit <orders@xstaticfit.com>";
export const OWNER_EMAIL = process.env.CONTACT_TO_EMAIL ?? "xstaticfit@gmail.com";

/** Sends through Resend using the same sender and key as the order emails. */
export async function sendViaResend(msg: OutgoingEmail): Promise<{ ok: boolean; detail?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { ok: false, detail: "RESEND_API_KEY is not set" };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${resendKey}`,
    "Content-Type": "application/json",
  };
  if (msg.idempotencyKey) headers["Idempotency-Key"] = msg.idempotencyKey;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: ORDERS_FROM,
      to: msg.to,
      bcc: msg.bcc,
      reply_to: msg.replyTo,
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
  });
  if (!res.ok) return { ok: false, detail: `Resend ${res.status}: ${await res.text()}` };
  return { ok: true };
}
