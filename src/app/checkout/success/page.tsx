"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { PENDING_PURCHASE_KEY, trackPurchase } from "@/lib/meta/pixel";

const FIRED_KEY = "xsf-purchases-tracked";

/**
 * Browser Purchase event. event_id is the Stripe Checkout Session id from the URL,
 * the same id the Stripe webhook sends to the Conversions API, so Meta keeps one.
 * Value comes from the checkout response saved just before the Stripe redirect.
 * Fires at most once per session id, even if the page is reloaded.
 */
function firePurchaseOnce() {
  try {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    const raw = window.sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!sessionId || !raw) return;
    const pending = JSON.parse(raw) as {
      id?: string;
      value?: number;
      content_ids?: string[];
      contents?: { id: string; quantity: number }[];
      num_items?: number;
    };
    if (pending.id !== sessionId) return;
    const fired: string[] = JSON.parse(window.localStorage.getItem(FIRED_KEY) ?? "[]");
    if (fired.includes(sessionId)) return;
    trackPurchase(sessionId, {
      value: pending.value,
      content_ids: pending.content_ids,
      contents: pending.contents,
      num_items: pending.num_items,
    });
    window.localStorage.setItem(FIRED_KEY, JSON.stringify([...fired, sessionId].slice(-20)));
    window.sessionStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    // Tracking must never affect the confirmation page.
  }
}

export default function CheckoutSuccessPage() {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
    firePurchaseOnce();
  }, [clear]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center bg-ink px-6 py-32 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-accent">Order Confirmed</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase">You&rsquo;re a warrior</h1>
      <p className="mt-4 text-sm text-white/70">
        Thank you for your order. A confirmation has been sent to your email, and we&rsquo;ll ship
        within 24-48 hours.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
