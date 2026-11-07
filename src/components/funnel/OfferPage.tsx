import Image from "next/image";
import { OFFERS, PRODUCT_COPY, UI, productsFor, type OfferId } from "@/lib/funnel";
import type { Lang } from "@/lib/lang";
import TrackViewContent from "@/components/TrackViewContent";
import { BuyBox, BuyButton, BuyProvider, StickyBar } from "./BuyFlow";
import FunnelEffects from "./FunnelEffects";

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ccf00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 shrink-0">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}

/** One ad landing page. Server-rendered copy, client islands for the buy box and sticky bar. */
export default function OfferPage({ offerId, lang }: { offerId: OfferId; lang: Lang }) {
  const offer = OFFERS[offerId];
  const copy = offer.copy[lang];
  const ui = UI[lang];
  const products = productsFor(offer.order);
  const hero = products[0];

  return (
    <BuyProvider lang={lang} offer={offerId}>
      <FunnelEffects lang={lang} />
      <TrackViewContent slug={hero.slug} name={offerId === "kit" ? "Warrior Kit" : hero.name} price={hero.price} />

      {/* Above the fold: photo, promise, buy box */}
      <section className="mx-auto grid max-w-[1200px] gap-6 px-0 pb-10 md:grid-cols-2 md:gap-12 md:px-6 md:py-10">
        <div className="md:sticky md:top-20 md:self-start">
          <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
            {offer.gallery.map((g, i) => (
              <li key={g.src} className="aspect-[4/5] w-[72%] shrink-0 snap-center overflow-hidden bg-white md:w-[calc(50%-4px)] md:first:w-full md:first:basis-full">
                <Image
                  src={g.src}
                  alt={g.alt[lang]}
                  width={900}
                  height={1125}
                  sizes="(min-width: 768px) 560px, 72vw"
                  priority={i === 0}
                  className="h-full w-full object-cover"
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="px-4 md:px-0">
          <p className="font-stencil text-xs uppercase tracking-[0.3em] text-accent">{copy.eyebrow}</p>
          <h1 className="mt-2 font-stencil text-4xl uppercase leading-[1.05] sm:text-5xl">{copy.h1}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/80">{copy.sub}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {copy.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm leading-snug text-white/90">
                <Tick />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <BuyBox />

          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/80">
            {ui.trust.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Tick />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/70">
            {ui.ask}{" "}
            <a href="mailto:contact@xstaticfit.com" className="text-accent underline underline-offset-4">
              contact@xstaticfit.com
            </a>
          </p>
        </div>
      </section>

      {/* What is in it */}
      <section className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="font-stencil text-2xl uppercase">{copy.includedTitle}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {products.map((p) => {
              const c = PRODUCT_COPY[p.slug][lang];
              return (
                <li key={p.slug} className="border border-white/10">
                  <div className="relative aspect-[4/5] bg-white">
                    <Image src={p.image} alt={c.name} fill sizes="(min-width: 640px) 380px, 100vw" className="object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-stencil text-lg uppercase leading-tight">{c.name}</p>
                    <p className="mt-1 text-sm text-white/70">{c.line}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="font-stencil text-2xl uppercase">{ui.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {ui.steps.map((s) => (
              <li key={s.t} className="border-l-2 border-accent pl-4">
                <p className="font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-white/70">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-stencil text-2xl uppercase">{ui.faqTitle}</h2>
          <div className="mt-6 flex flex-col divide-y divide-white/10 border-y border-white/10">
            {ui.faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  {f.q}
                  <span aria-hidden className="text-2xl leading-none text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-1 pt-2 text-sm leading-relaxed text-white/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing push */}
      <section className="border-t border-white/10 bg-white/[0.03] py-14">
        <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6">
          <h2 className="font-stencil text-3xl uppercase">{ui.finalTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">{ui.finalSub}</p>
          <div className="mt-6 flex flex-col items-center">
            <BuyButton />
          </div>
        </div>
      </section>

      <StickyBar />
    </BuyProvider>
  );
}
