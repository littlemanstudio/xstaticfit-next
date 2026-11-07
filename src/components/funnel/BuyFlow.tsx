"use client";

import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BUNDLE_PERCENT_OFF, cartTotals } from "@/lib/bundle";
import { startCheckout } from "@/lib/checkoutClient";
import { OFFERS, PRODUCT_COPY, UI, productsFor, type OfferId } from "@/lib/funnel";
import type { Lang } from "@/lib/lang";
import { META_ENABLED } from "@/lib/meta/config";
import { useConsent } from "@/lib/meta/consent";
import { trackEvent } from "@/lib/meta/pixel";

// Shared state for the ad landing page: which products are ticked, the live total
// (same bundle rule as the cart and Stripe), and the one-tap path to Stripe Checkout.

type BuyState = {
  lang: Lang;
  offer: OfferId;
  selected: string[];
  toggle: (slug: string) => void;
  totals: ReturnType<typeof cartTotals>;
  loading: boolean;
  error: string | null;
  buy: () => void;
};

const Ctx = createContext<BuyState | null>(null);

function useBuy() {
  const v = useContext(Ctx);
  if (!v) throw new Error("BuyFlow components must be inside <BuyProvider>");
  return v;
}

const money = (n: number) => `$${n.toFixed(2)}`;

export function BuyProvider({ lang, offer, children }: { lang: Lang; offer: OfferId; children: React.ReactNode }) {
  const [selected, setSelected] = useState<string[]>(OFFERS[offer].preselected);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines = useMemo(() => selected.map((slug) => ({ slug, qty: 1 })), [selected]);
  const totals = useMemo(() => cartTotals(lines), [lines]);

  const toggle = useCallback(
    (slug: string) => {
      setError(null);
      setSelected((cur) => {
        if (cur.includes(slug)) {
          if (cur.length === 1) {
            setError(UI[lang].mustKeepOne);
            return cur;
          }
          return cur.filter((s) => s !== slug);
        }
        return [...cur, slug];
      });
    },
    [lang]
  );

  // Coming back from Stripe with the back button restores the page from cache: unlock the button.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const buy = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const items = lines.map((l) => ({ id: l.slug, quantity: l.qty }));
    trackEvent(
      "AddToCart",
      {
        value: totals.subtotal,
        content_ids: items.map((i) => i.id),
        contents: items,
        num_items: items.length,
      },
      items
    );
    const err = await startCheckout({ items: lines, lang });
    if (err) {
      setError(err);
      setLoading(false);
    }
  }, [lang, lines, loading, totals.subtotal]);

  // The error sits under the main button. If the buyer tapped the sticky bar, bring it into view.
  useEffect(() => {
    if (error) document.getElementById("buy-error")?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);

  return <Ctx.Provider value={{ lang, offer, selected, toggle, totals, loading, error, buy }}>{children}</Ctx.Provider>;
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border transition ${
        on ? "border-accent bg-accent text-ink" : "border-white/30 text-transparent"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12.5 9.5 18 20 6.5" />
      </svg>
    </span>
  );
}

/** The product rows, the live total and the main button. Sits right under the headline. */
export function BuyBox() {
  const { lang, offer, selected, toggle, totals, loading, error, buy } = useBuy();
  const ui = UI[lang];
  const products = productsFor(OFFERS[offer].order);
  const missing = products.length - selected.length;

  return (
    <div id="buybox" className="mt-6 border border-white/15 bg-white/[0.03] p-4 sm:p-5">
      <p className="font-stencil text-xs uppercase tracking-[0.2em] text-white/60">{ui.pickTitle}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {products.map((p) => {
          const on = selected.includes(p.slug);
          const copy = PRODUCT_COPY[p.slug][lang];
          return (
            <li key={p.slug}>
              <label
                className={`flex min-h-[64px] cursor-pointer items-center gap-3 border p-2 pr-3 transition ${
                  on ? "border-accent/70 bg-accent/[0.06]" : "border-white/15"
                }`}
              >
                <input type="checkbox" checked={on} onChange={() => toggle(p.slug)} className="sr-only" />
                <Check on={on} />
                <span className="relative h-12 w-12 shrink-0 overflow-hidden bg-white">
                  <Image src={p.image} alt="" fill sizes="48px" loading="eager" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{copy.name}</span>
                  <span className="block text-[13px] leading-snug text-white/70">{copy.line}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold">{money(p.price)}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className={`mt-3 text-sm ${totals.bundle ? "text-accent" : "text-white/80"}`} aria-live="polite">
        {totals.bundle ? ui.bundleDone : ui.bundleHint(missing)}
      </p>

      <dl className="mt-3 flex min-h-[104px] flex-col justify-end gap-1 border-t border-white/10 pt-3 text-sm">
        {totals.bundle && (
          <>
            <div className="flex justify-between text-white/70">
              <dt>{ui.subtotal}</dt>
              <dd>{money(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-accent">
              <dt>{ui.bundleLine}</dt>
              <dd>−{money(totals.discount)}</dd>
            </div>
          </>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-stencil uppercase tracking-wide">{ui.total}</dt>
          <dd className="text-xl font-bold">{money(totals.total)} USD</dd>
        </div>
      </dl>

      <button
        id="buy-main"
        type="button"
        onClick={buy}
        disabled={loading}
        className="mt-4 flex min-h-[56px] w-full items-center justify-center rounded-[3px] bg-accent px-4 font-stencil text-sm uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-60"
      >
        {loading ? ui.buying : `${ui.buy} · ${money(totals.total)}`}
      </button>
      {error && (
        <p id="buy-error" role="alert" className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}
      <p className="mt-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        {ui.secure}
      </p>
    </div>
  );
}

/** Same action as the main button, for the closing section. */
export function BuyButton() {
  const { lang, totals, loading, error, buy } = useBuy();
  const ui = UI[lang];
  return (
    <>
      <button
        id="buy-final"
        type="button"
        onClick={buy}
        disabled={loading}
        className="flex min-h-[56px] w-full items-center justify-center rounded-[3px] bg-accent px-4 font-stencil text-sm uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-60 sm:w-auto sm:min-w-[320px]"
      >
        {loading ? ui.buying : `${ui.buy} · ${money(totals.total)}`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Mobile bar fixed to the bottom whenever the main button is off screen (first screen included),
 * so the button is under the thumb at every scroll position. Hidden while the cookie banner is open
 * (the banner owns the bottom edge until the visitor chooses).
 */
export function StickyBar() {
  const { lang, totals, loading, error, buy } = useBuy();
  const consent = useConsent();
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const ui = UI[lang];

  useEffect(() => {
    const els = ["buy-main", "buy-final"].map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => setVisible((cur) => entries.reduce((acc, e) => ({ ...acc, [e.target.id]: e.isIntersecting }), cur)),
      { threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const bannerOpen = META_ENABLED && consent === null;
  const show = !visible["buy-main"] && !visible["buy-final"];
  if (!show || bannerOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      {error && (
        <p role="alert" className="mb-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={buy}
        disabled={loading}
        className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-[3px] bg-accent px-4 font-stencil text-sm uppercase tracking-[0.2em] text-ink disabled:opacity-60"
      >
        <span>{loading ? ui.buying : ui.buy}</span>
        <span aria-hidden>·</span>
        <span>{money(totals.total)}</span>
        {totals.bundle && <span className="text-[10px] tracking-widest">−{BUNDLE_PERCENT_OFF}%</span>}
      </button>
    </div>
  );
}
