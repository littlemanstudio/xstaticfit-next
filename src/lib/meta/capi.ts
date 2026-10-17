// Meta Conversions API (server only). Never import this from a client component:
// it reads META_CAPI_ACCESS_TOKEN.
//
// Payload format and endpoint verified against Meta's official docs (fetched 2026-10-17):
//   https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api
//     POST https://graph.facebook.com/{API_VERSION}/{PIXEL_ID}/events?access_token=TOKEN
//     body: { data: [event, ...], test_event_code?: "TEST123" }  (doc example uses v25.0)
//   https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
//     em: trim + lowercase, then SHA-256. ph: digits only with country code, then SHA-256.
//     ct/st/zp/country: normalized then SHA-256. client_ip_address, client_user_agent,
//     fbc, fbp: never hashed. client_user_agent is required for website events.
//   Deduplication: the browser pixel eventID and the server event_id must match for the
//   same event_name.

import { createHash } from "node:crypto";
import { META_PIXEL_ID, META_ENABLED, META_CURRENCY } from "./config";

export const GRAPH_API_VERSION = "v25.0";

export type CapiUserInput = {
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type CapiEventInput = {
  eventName: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  eventId: string;
  eventSourceUrl?: string | null;
  eventTime?: number;
  user: CapiUserInput;
  custom?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
    contents?: { id: string; quantity: number }[];
    num_items?: number;
    order_id?: string;
  };
};

function sha256(v: string) {
  return createHash("sha256").update(v, "utf8").digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Digits only. Stripe returns E.164 (+17875551234), which already includes the country code. */
export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0+/, "");
}

function normalizeLoose(v: string) {
  return v.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

function hashed(v: string | null | undefined, normalize: (s: string) => string) {
  if (!v) return undefined;
  const n = normalize(v);
  return n ? sha256(n) : undefined;
}

export function buildUserData(u: CapiUserInput) {
  const data: Record<string, string> = {};
  const em = hashed(u.email, normalizeEmail);
  const ph = hashed(u.phone, normalizePhone);
  const ct = hashed(u.city, normalizeLoose);
  const st = hashed(u.state, normalizeLoose);
  // US zips: first 5 digits; other countries: lowercase, no spaces.
  const zp = hashed(u.zip, (z) => {
    const s = z.toLowerCase().replace(/\s/g, "");
    return /^\d{5}-?\d{4}$/.test(s) ? s.slice(0, 5) : s;
  });
  const country = hashed(u.country, (c) => c.trim().toLowerCase().slice(0, 2));
  if (em) data.em = em;
  if (ph) data.ph = ph;
  if (ct) data.ct = ct;
  if (st) data.st = st;
  if (zp) data.zp = zp;
  if (country) data.country = country;
  if (u.clientIp) data.client_ip_address = u.clientIp;
  if (u.userAgent) data.client_user_agent = u.userAgent;
  if (u.fbp) data.fbp = u.fbp;
  if (u.fbc) data.fbc = u.fbc;
  return data;
}

export function buildEvent(e: CapiEventInput) {
  const custom = e.custom
    ? { currency: META_CURRENCY, content_type: "product", ...e.custom }
    : undefined;
  return {
    event_name: e.eventName,
    event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: e.eventId,
    action_source: "website" as const,
    ...(e.eventSourceUrl ? { event_source_url: e.eventSourceUrl } : {}),
    user_data: buildUserData(e.user),
    ...(custom ? { custom_data: custom } : {}),
  };
}

export function capiConfigured() {
  return META_ENABLED && Boolean(process.env.META_CAPI_ACCESS_TOKEN);
}

/**
 * Sends one event. Never throws: failures are logged and swallowed so checkout,
 * the webhook and page loads are never affected by Meta being slow or down.
 * Returns true when Meta accepted the event.
 */
export async function sendCapiEvent(e: CapiEventInput): Promise<boolean> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!META_ENABLED || !token) return false;

  const event = buildEvent(e);
  if (!event.user_data.client_user_agent) {
    // Meta requires client_user_agent for website events.
    console.warn(`[meta-capi] ${e.eventName} ${e.eventId} skipped: no user agent`);
    return false;
  }

  const body: Record<string, unknown> = { data: [event] };
  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testCode) body.test_event_code = testCode;

  const debug = process.env.META_CAPI_DEBUG;
  if (debug === "1" || debug === "dry") {
    console.log("[meta-capi] payload", JSON.stringify(body));
  }
  // "dry" logs the payload without calling Meta (local verification).
  if (debug === "dry") return true;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[meta-capi] ${e.eventName} ${e.eventId} failed: ${res.status} ${await res.text()}`);
      return false;
    }
    if (debug === "1") {
      console.log(`[meta-capi] ${e.eventName} ${e.eventId} ok: ${await res.text()}`);
    }
    return true;
  } catch (err) {
    console.error(`[meta-capi] ${e.eventName} ${e.eventId} error:`, err instanceof Error ? err.message : err);
    return false;
  }
}

/** First public IP from the proxy headers (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIpFrom(headers: Headers): string | null {
  const raw = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim();
  if (!raw) return null;
  if (/^[\d.]+$/.test(raw) || /^[0-9a-f:]+$/i.test(raw)) return raw;
  return null;
}

/**
 * fbc from the _fbc cookie, or built from ?fbclid= on the page URL when the cookie
 * is not set yet. Format per Meta: fb.{subdomain_index}.{creation_time_ms}.{fbclid}
 */
export function fbcFrom(cookieFbc: string | undefined | null, pageUrl: string | null | undefined): string | null {
  if (cookieFbc) return cookieFbc;
  if (!pageUrl) return null;
  try {
    const fbclid = new URL(pageUrl).searchParams.get("fbclid");
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
  } catch {
    return null;
  }
}
