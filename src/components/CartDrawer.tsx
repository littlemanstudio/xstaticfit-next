"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart, useHasHydrated } from "@/store/cart";
import { BUNDLE_PERCENT_OFF, BUNDLE_SLUGS, cartTotals } from "@/lib/bundle";
import { startCheckout } from "@/lib/checkoutClient";
import { PRODUCT_COPY } from "@/lib/funnel";
import { useLang } from "@/lib/lang";
import { trackEvent } from "@/lib/meta/pixel";
import { getProduct } from "@/lib/products";

const T = {
  en: {
    title: "Your Cart", close: "Close", empty: "No items found.", remove: "Remove",
    subtotal: "Subtotal:", bundle: `Bundle ${BUNDLE_PERCENT_OFF}% off:`, total: "Total:",
    email: "Your email (optional)", consent: "Email me my cart and offers from Xstatic Fit. Unsubscribe anytime.",
    go: "Continue to Checkout", going: "Redirecting…",
    save: `Add these and save ${BUNDLE_PERCENT_OFF}%`, add: "Add",
  },
  es: {
    title: "Tu carrito", close: "Cerrar", empty: "No hay productos.", remove: "Quitar",
    subtotal: "Subtotal:", bundle: `Descuento del kit ${BUNDLE_PERCENT_OFF}%:`, total: "Total:",
    email: "Tu email (opcional)", consent: "Envíame mi carrito y ofertas de Xstatic Fit. Puedes darte de baja cuando quieras.",
    go: "Continuar al pago", going: "Abriendo el pago…",
    save: `Agrega estos y ahorra ${BUNDLE_PERCENT_OFF}%`, add: "Agregar",
  },
} as const;

export default function CartDrawer() {
  const cart = useCart();
  const hydrated = useHasHydrated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const lang = useLang();
  const t = T[lang];

  if (!hydrated || !cart.isOpen) return null;

  const totals = cartTotals(cart.items);

  async function checkout() {
    setLoading(true);
    setError(null);
    const err = await startCheckout({
      items: cart.items.map((i) => ({ slug: i.slug, qty: i.qty })),
      lang,
      email,
      marketingConsent: consent,
    });
    if (err) setError(err);
    setLoading(false);
  }

  // Products still missing from the "all three" bundle, offered as one-tap adds.
  const missing = totals.bundle
    ? []
    : BUNDLE_SLUGS.filter((slug) => !cart.items.some((i) => i.slug === slug))
        .map((slug) => getProduct(slug))
        .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart overlay"
        onClick={cart.close}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-ink text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-stencil text-xl uppercase">{t.title}</h2>
          <button onClick={cart.close} className="text-xs font-semibold uppercase tracking-widest hover:text-accent">
            {t.close}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">{t.empty}</p>
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
                        {t.remove}
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
            <span>{t.subtotal}</span>
            <span className="font-semibold">$ {totals.subtotal.toFixed(2)} USD</span>
          </div>
          {totals.bundle && (
            <>
              <div className="-mt-2 mb-2 flex items-center justify-between text-sm uppercase tracking-wide text-accent">
                <span>{t.bundle}</span>
                <span className="font-semibold">− $ {totals.discount.toFixed(2)} USD</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-wide">
                <span>{t.total}</span>
                <span className="font-semibold">$ {totals.total.toFixed(2)} USD</span>
              </div>
            </>
          )}
          {missing.length > 0 && cart.items.length > 0 && (
            <div className="mb-4 border border-accent/40 bg-accent/[0.06] p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-accent">{t.save}</p>
              <ul className="flex flex-col gap-2">
                {missing.map((p) => (
                  <li key={p.slug} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {PRODUCT_COPY[p.slug]?.[lang].name ?? p.name} · $ {p.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        cart.add({ slug: p.slug, name: p.name, price: p.price, image: p.image }, 1);
                        trackEvent(
                          "AddToCart",
                          { value: p.price, content_ids: [p.slug], content_name: p.name, contents: [{ id: p.slug, quantity: 1 }] },
                          [{ id: p.slug, quantity: 1 }]
                        );
                      }}
                      className="min-h-11 shrink-0 rounded-[3px] border border-accent px-4 text-xs font-semibold uppercase tracking-widest text-accent hover:bg-accent hover:text-ink"
                    >
                      + {t.add}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="cart-email" className="mb-1 block text-[11px] uppercase tracking-widest text-white/60">
              {t.email}
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
              <span>{t.consent}</span>
            </label>
          </div>
          <button
            onClick={checkout}
            disabled={cart.items.length === 0 || loading}
            className="block w-full rounded-[3px] bg-accent py-4 text-center font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-40"
          >
            {loading ? t.going : t.go}
          </button>
          {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
