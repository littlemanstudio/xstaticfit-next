"use client";

// Which ad sent the buyer. Meta fills the UTM tags from the ad's URL parameters
// (utm_source=meta&utm_campaign={{campaign.name}}&utm_content={{ad.name}} ...). We keep them
// for the visit and attach them to the Stripe order, so every sale can be traced to an
// ad without relying on the pixel (which only runs after the visitor accepts cookies).
// Campaign tags are not personal data. No click ids are stored here.

export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey | "landing", string>>;

const SESSION_KEY = "xsf-attr";

function clean(v: string | null): string | undefined {
  if (!v) return undefined;
  const s = v.replace(/[^\w\s.:+|/@-]/g, "").trim().slice(0, 100);
  return s || undefined;
}

/** Call on every page load. Stores the tags when the URL carries any (last touch wins). */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = clean(params.get(k));
      if (v) found[k] = v;
    }
    if (!Object.keys(found).length) return;
    found.landing = window.location.pathname.slice(0, 100);
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(found));
  } catch {
    // Attribution must never affect the page.
  }
}

export function readAttribution(): Attribution | undefined {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Attribution;
    const out: Attribution = {};
    for (const k of [...ATTRIBUTION_KEYS, "landing"] as const) {
      const v = parsed[k];
      if (typeof v === "string") out[k] = v.slice(0, 100);
    }
    return Object.keys(out).length ? out : undefined;
  } catch {
    return undefined;
  }
}
