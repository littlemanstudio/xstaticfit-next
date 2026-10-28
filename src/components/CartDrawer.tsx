"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart, useHasHydrated } from "@/store/cart";
import { BUNDLE_PERCENT_OFF, cartTotals } from "@/lib/bundle";
import { PENDING_PURCHASE_KEY, trackEvent } from "@/lib/meta/pixel";
import { trackingAllowed } from "@/lib/meta/consent";

export default function CartDrawer() {
  const cart = useCart();
  const hydrated = useHasHydrated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  if (!hydrated || !cart.isOpen) return null;

  const totals = cartTotals(cart.items);

  async function checkout() {
    setLoading(true);
    setError(null);
    const lines = cart.items.map((i) => ({ id: i.slug, quantity: i.qty }));
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((i) => ({ slug: i.slug, qty: i.qty })),
          ...(email.trim() ? { email: email.trim(), marketingConsent: consent } : {}),
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
        return;
      }
      setError(data.error || "Checkout failed. Try again.");
    } catch {
      setError("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart overlay"
        onClick={cart.close}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-ink text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-stencil text-xl uppercase">Your Cart</h2>
          <button onClick={cart.close} className="text-xs font-semibold uppercase tracking-widest hover:text-accent">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">No items found.</p>
          ) : (
            <ul className="flex flex-col gap-5">
              {cart.items.map((item) => (
                <li key={item.slug} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-white/5">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold uppercase">{item.name}</p>
                      <button
                        onClick={() => cart.remove(item.slug)}
                        className="text-xs text-white/50 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-white/20">
                        <button
                          className="px-2 py-1"
                          onClick={() => cart.setQty(item.slug, item.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 text-sm">{item.qty}</span>
                        <button
                          className="px-2 py-1"
                          onClick={() => cart.setQty(item.slug, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        $ {(item.price * item.qty).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-6">
          <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-wide">
            <span>Subtotal:</span>
            <span className="font-semibold">$ {totals.subtotal.toFixed(2)} USD</span>
          </div>
          {totals.bundle && (
            <>
              <div className="-mt-2 mb-2 flex items-center justify-between text-sm uppercase tracking-wide text-accent">
                <span>Bundle {BUNDLE_PERCENT_OFF}% off:</span>
                <span className="font-semibold">− $ {totals.discount.toFixed(2)} USD</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-wide">
                <span>Total:</span>
                <span className="font-semibold">$ {totals.total.toFixed(2)} USD</span>
              </div>
            </>
          )}
          <div className="mb-4">
            <label htmlFor="cart-email" className="mb-1 block text-[11px] uppercase tracking-widest text-white/60">
              Your email (optional)
            </label>
            <input
              id="cart-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-white/20 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-white/60"
            />
            <label className="mt-3 flex items-start gap-2 text-xs leading-snug text-white/60">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                disabled={!email.trim()}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#7ccf00]"
              />
              <span>Email me my cart and offers from Xstatic Fit. Unsubscribe anytime.</span>
            </label>
          </div>
          <button
            onClick={checkout}
            disabled={cart.items.length === 0 || loading}
            className="block w-full rounded-[3px] bg-accent py-4 text-center font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-40"
          >
            {loading ? "Redirecting…" : "Continue to Checkout"}
          </button>
          {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
