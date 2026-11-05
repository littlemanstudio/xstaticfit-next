import { createHash } from "node:crypto";
import { parseTrackingInput, pickLanguage, type Lang } from "./shipping";
import { renderShippedEmail } from "./shippedEmail";

export type SessionLite = {
  id: string;
  paid: boolean;
  name: string;
  email: string | null;
  country: string | null;
  metadata: Record<string, string>;
};

export type OutgoingEmail = {
  to: string;
  bcc: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
};

export type ShipDeps = {
  getSession: (id: string) => Promise<SessionLite | null>;
  sendEmail: (msg: OutgoingEmail) => Promise<{ ok: boolean; detail?: string }>;
  saveShipped: (id: string, metadata: Record<string, string>) => Promise<void>;
  now: () => Date;
  ownerEmail: string;
};

export type ShipRequest = {
  sessionId: string;
  trackingInput: string;
  lang?: Lang | "auto";
  force?: boolean;
};

export type ShipResult =
  | { ok: true; lang: Lang; packages: number; emailedTo: string; warning?: string }
  | { ok: false; status: number; error: string; detail?: string };

export async function shipOrder(req: ShipRequest, deps: ShipDeps): Promise<ShipResult> {
  const { entries, invalid } = parseTrackingInput(req.trackingInput);
  if (invalid.length) {
    return { ok: false, status: 400, error: "invalid_tracking", detail: invalid.join(", ") };
  }
  if (!entries.length) {
    return { ok: false, status: 400, error: "no_tracking" };
  }
  if (entries.length > 10) {
    return { ok: false, status: 400, error: "too_many_packages" };
  }

  const session = await deps.getSession(req.sessionId);
  if (!session) return { ok: false, status: 404, error: "order_not_found" };
  if (!session.paid) return { ok: false, status: 409, error: "order_not_paid" };
  if (!session.email) return { ok: false, status: 422, error: "no_customer_email" };

  if (session.metadata.shipped_at && !req.force) {
    return {
      ok: false,
      status: 409,
      error: "already_shipped",
      detail: session.metadata.shipped_at,
    };
  }

  const lang: Lang = req.lang && req.lang !== "auto" ? req.lang : pickLanguage(session.country);
  const email = renderShippedEmail({ name: session.name, tracking: entries, lang });

  const idempotencyKey = req.force
    ? undefined
    : "ship-" +
      createHash("sha256")
        .update(`${session.id}:${entries.map((e) => e.number).join(",")}`)
        .digest("hex")
        .slice(0, 48);

  const sent = await deps.sendEmail({
    to: session.email,
    bcc: deps.ownerEmail,
    replyTo: deps.ownerEmail,
    subject: email.subject,
    text: email.text,
    html: email.html,
    idempotencyKey,
  });
  if (!sent.ok) {
    return { ok: false, status: 502, error: "email_failed", detail: sent.detail };
  }

  try {
    await deps.saveShipped(session.id, {
      shipped_at: deps.now().toISOString(),
      tracking: entries.map((e) => e.number).join(" | ").slice(0, 480),
      ship_lang: lang,
    });
  } catch {
    return {
      ok: true,
      lang,
      packages: entries.length,
      emailedTo: session.email,
      warning: "Email sent, but saving the shipped status to Stripe failed.",
    };
  }

  return { ok: true, lang, packages: entries.length, emailedTo: session.email };
}
