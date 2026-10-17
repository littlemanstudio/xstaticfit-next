// Shared Meta (Facebook/Instagram) tracking config. Safe to import from client code.

/**
 * Public Meta Pixel (dataset) id. Inlined at build time by Next.js.
 * When it is empty, every tracking path is a no-op: no script, no banner,
 * no network calls, no console output.
 */
export const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").trim();

export const META_ENABLED = /^\d{5,20}$/.test(META_PIXEL_ID);

/**
 * How consent works for visitors (store sells to Puerto Rico, the US and Canada).
 *  - "opt-out": tracking runs unless the visitor clicks Decline in the banner or their
 *    browser sends Global Privacy Control. The banner stays visible until they choose.
 *  - "opt-in": nothing fires until the visitor clicks Accept.
 * Switch to "opt-in" if the owner or a lawyer prefers the stricter model.
 */
export const META_CONSENT_MODE: "opt-out" | "opt-in" = "opt-out";

export const META_CURRENCY = "USD";

/** Events the browser may forward to our CAPI relay route. Purchase is server-only (Stripe webhook). */
export const RELAY_EVENTS = ["ViewContent", "AddToCart", "InitiateCheckout"] as const;
export type RelayEventName = (typeof RELAY_EVENTS)[number];
