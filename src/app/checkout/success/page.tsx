"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useCart } from "@/store/cart";
import { setLang, useLang } from "@/lib/lang";
import { PRODUCT_COPY } from "@/lib/funnel";
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

type Recap = { slugs: string[]; total?: number };

// Read once per page load and kept: firePurchaseOnce clears the saved purchase right after this.
let recapRaw: string | null | undefined;

function recapSnapshot(): string | null {
  if (recapRaw === undefined) {
    try {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      const raw = window.sessionStorage.getItem(PENDING_PURCHASE_KEY);
      recapRaw = sessionId && raw && (JSON.parse(raw) as { id?: string }).id === sessionId ? raw : null;
    } catch {
      recapRaw = null;
    }
  }
  return recapRaw;
}

const noSubscribe = () => () => {};

/** What the buyer just ordered, from the checkout response saved before the Stripe redirect. */
function parseRecap(raw: string | null): Recap | null {
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as { value?: number; content_ids?: string[] };
    const slugs = (pending.content_ids ?? []).filter((slug) => slug in PRODUCT_COPY);
    return slugs.length ? { slugs, total: pending.value } : null;
  } catch {
    return null;
  }
}

const COPY = {
  en: {
    eyebrow: "Order Confirmed",
    recapTitle: "Your order",
    recapTotal: "Total paid",
    title: "You\u2019re a warrior",
    body: "Thank you for your order. A confirmation has been sent to your email.",
    stepsTitle: "What happens next",
    steps: [
      "Your order ships within 24 to 48 hours (not on weekends).",
      "We email you the tracking number when it ships.",
      "It arrives in 3 to 5 business days.",
    ],
    follow: "Follow the training on Instagram",
    shop: "Continue Shopping",
    rewardTitle: "Get 10% off your next order",
    rewardBody: "Send us a video of you using your gear and your honest review.",
    rewardLink: "See how it works",
    help: "Questions about your order? Email contact@xstaticfit.com",
  },
  es: {
    eyebrow: "Pedido confirmado",
    recapTitle: "Tu pedido",
    recapTotal: "Total pagado",
    title: "Ya eres un guerrero",
    body: "Gracias por tu pedido. Te enviamos la confirmación a tu email.",
    stepsTitle: "Lo que sigue",
    steps: [
      "Tu pedido sale en 24 a 48 horas (no enviamos en fines de semana).",
      "Te escribimos el número de rastreo cuando salga.",
      "Llega en 3 a 5 días hábiles.",
    ],
    follow: "Sigue el entrenamiento en Instagram",
    shop: "Seguir comprando",
    rewardTitle: "Gana 10% en tu próximo pedido",
    rewardBody: "Mándanos un video usando tu equipo y tu reseña honesta.",
    rewardLink: "Mira cómo funciona",
    help: "¿Dudas sobre tu pedido? Escríbenos a contact@xstaticfit.com",
  },
} as const;

export default function CheckoutSuccessPage() {
  const clear = useCart((s) => s.clear);
  const lang = useLang();
  const t = COPY[lang];
  const recap = parseRecap(useSyncExternalStore(noSubscribe, recapSnapshot, () => null));

  useEffect(() => {
    clear();
    firePurchaseOnce();
    // The checkout sends the buyer back with ?lang=es so the page speaks the language of the ad they came from.
    const q = new URLSearchParams(window.location.search).get("lang");
    if (q === "es" || q === "en") setLang(q);
  }, [clear]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center bg-ink px-6 py-24 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-accent">{t.eyebrow}</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase">{t.title}</h1>
      <p className="mt-4 text-sm text-white/70">{t.body}</p>

      {recap && recap.slugs.length > 0 && (
        <div className="mt-8 w-full border border-white/10 p-5 text-left">
          <p className="font-stencil text-xs uppercase tracking-[0.2em] text-white/60">{t.recapTitle}</p>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-white/80">
            {recap.slugs.map((slug) => (
              <li key={slug}>{PRODUCT_COPY[slug][lang].name}</li>
            ))}
          </ul>
          {typeof recap.total === "number" && (
            <p className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm font-semibold">
              <span>{t.recapTotal}</span>
              <span>${recap.total.toFixed(2)} USD</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-6 w-full border border-white/10 p-5 text-left">
        <p className="font-stencil text-xs uppercase tracking-[0.2em] text-white/60">{t.stepsTitle}</p>
        <ol className="mt-3 flex flex-col gap-3 text-sm text-white/80">
          {t.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 w-full border border-accent/40 bg-accent/[0.06] p-5 text-left">
        <p className="font-stencil text-sm uppercase tracking-[0.15em] text-accent">{t.rewardTitle}</p>
        <p className="mt-2 text-sm text-white/80">{t.rewardBody}</p>
        <Link href="/rewards" className="mt-3 inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4">
          {t.rewardLink}
        </Link>
      </div>

      <a
        href="https://instagram.com/xstaticfit"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-4"
      >
        {t.follow} @xstaticfit
      </a>
      <p className="mt-6 text-xs text-white/60">{t.help}</p>
      <Link
        href="/shop"
        className="mt-6 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        {t.shop}
      </Link>
    </div>
  );
}
