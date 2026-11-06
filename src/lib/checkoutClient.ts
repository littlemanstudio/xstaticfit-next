"use client";

import { cartTotals } from "@/lib/bundle";
import { readAttribution } from "@/lib/attribution";
import type { Lang } from "@/lib/lang";
import { PENDING_PURCHASE_KEY, trackEvent } from "@/lib/meta/pixel";
import { trackingAllowed } from "@/lib/meta/consent";

type Line = { slug: string; qty: number };

/**
 * One path to Stripe Checkout for the cart drawer and the ad landing pages.
 * Fires InitiateCheckout, creates the Stripe session, saves the purchase details for the
 * thank-you page and redirects. Returns an error message, or null when the redirect started.
 */
export async function startCheckout(opts: {
  items: Line[];
  lang: Lang;
  email?: string;
  marketingConsent?: boolean;
}): Promise<string | null> {
  const failed = opts.lang === "es" ? "No pudimos abrir el pago. Intenta de nuevo." : "Checkout failed. Try again.";
  const totals = cartTotals(opts.items);
  const lines = opts.items.map((i) => ({ id: i.slug, quantity: i.qty }));
  trackEvent(
    "InitiateCheckout",
    {
      value: totals.total,
      content_ids: lines.map((l) => l.id),
      contents: lines,
      num_items: lines.reduce((s, l) => s + l.quantity, 0),
    },
    lines
  );
  try {
    const allowed = trackingAllowed();
    const email = opts.email?.trim();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: opts.items,
        lang: opts.lang,
        attribution: readAttribution(),
        ...(email ? { email, marketingConsent: opts.marketingConsent === true } : {}),
        browserLang: typeof navigator !== "undefined" ? navigator.language : undefined,
        ...(allowed ? { tracking: { consent: "granted", pageUrl: window.location.href } } : {}),
      }),
    });
    const data = await res.json();
    if (data.url) {
      if (allowed && data.purchase) {
        try {
          window.sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(data.purchase));
        } catch {}
      }
      window.location.assign(data.url);
      return null;
    }
    return typeof data.error === "string" && opts.lang === "en" ? data.error : failed;
  } catch {
    return failed;
  }
}
