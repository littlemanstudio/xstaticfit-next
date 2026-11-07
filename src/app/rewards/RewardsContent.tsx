"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang";

// Customer reward: after an order, a video of the gear in use plus an honest review earns 10% off
// any item on the next order. The review can be any rating (asking only for 5 stars would break
// the FTC rule on incentivized reviews and the review policies of Google and Meta).
const COPY = {
  en: {
    eyebrow: "Customer reward",
    title: "Get 10% off your next order",
    lead: "Bought something from Xstatic Fit? Show us how you use it and get 10% off any item on your next order.",
    stepsTitle: "How it works",
    steps: [
      "Order any Xstatic Fit product.",
      "Send us a short video of you using it, plus your honest review. Email contact@xstaticfit.com or message @xstaticfit on Instagram, and mention your order.",
      "We email you a 10% discount code for any item on your next order.",
    ],
    fine: [
      "We want your honest opinion, whatever the rating.",
      "The code works on any single item. It does not combine with the kit discount for taking all three products.",
    ],
    shop: "Shop now",
  },
  es: {
    eyebrow: "Recompensa para clientes",
    title: "Gana 10% en tu próximo pedido",
    lead: "¿Compraste en Xstatic Fit? Muéstranos cómo lo usas y recibe 10% de descuento en cualquier producto de tu próximo pedido.",
    stepsTitle: "Así funciona",
    steps: [
      "Compra cualquier producto de Xstatic Fit.",
      "Mándanos un video corto usándolo y tu reseña honesta. Escribe a contact@xstaticfit.com o por mensaje a @xstaticfit en Instagram, y menciona tu pedido.",
      "Te enviamos por email un código de 10% para cualquier producto de tu próximo pedido.",
    ],
    fine: [
      "Queremos tu opinión honesta, sin importar la calificación.",
      "El código sirve para un solo producto. No se combina con el descuento del kit por llevar los tres.",
    ],
    shop: "Comprar ahora",
  },
} as const;

export default function RewardsContent() {
  const t = COPY[useLang()];
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center bg-ink px-6 py-20 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-accent">{t.eyebrow}</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase">{t.title}</h1>
      <p className="mt-4 text-base text-white/80">{t.lead}</p>

      <div className="mt-8 w-full border border-white/10 p-5 text-left">
        <p className="font-stencil text-xs uppercase tracking-[0.2em] text-white/60">{t.stepsTitle}</p>
        <ol className="mt-3 flex flex-col gap-4 text-sm text-white/85">
          {t.steps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-ink">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <ul className="mt-6 flex flex-col gap-2 text-left text-sm text-white/70">
        {t.fine.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <Link
        href="/shop"
        className="mt-8 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        {t.shop}
      </Link>
    </div>
  );
}
