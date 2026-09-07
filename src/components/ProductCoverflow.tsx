"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "@/lib/products";

const ChevronLeftIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// Card offset relative to the centered slide, wrapped into (-total/2, total/2]
// so a 3-item deck positions the "previous" item to the left instead of
// wrapping it around to the far right (the naive offset===total-1 approach
// only reads correctly once there are 5+ items).
function signedOffset(index: number, current: number, total: number) {
  let offset = (index - current + total) % total;
  if (offset > total / 2) offset -= total;
  return offset;
}

export default function ProductCoverflow({
  products,
  eyebrow = "Our Bestsellers",
  autoplay = true,
  autoplayDelay = 4500,
}: {
  products: Product[];
  eyebrow?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const total = products.length;

  const nextSlide = useCallback(() => setCurrentIndex((p) => (p + 1) % total), [total]);
  const prevSlide = useCallback(() => setCurrentIndex((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (!autoplay || isHovered || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, nextSlide, total]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) (diff < 0 ? nextSlide : prevSlide)();
  }

  if (total === 0) return null;

  return (
    <section
      className="relative flex min-h-[760px] w-full select-none flex-col items-center justify-center overflow-hidden bg-ink py-16 text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient blurred backdrop of the active product */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Image
          src={products[currentIndex].image}
          alt=""
          fill
          className="scale-110 object-cover opacity-20 blur-3xl transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(13,13,13,0.3)_0%,rgba(13,13,13,0.95)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4">
        <div className="mb-10 flex items-center gap-3">
          <span className="h-px w-9 bg-gradient-to-r from-transparent to-accent" />
          <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</h3>
          <span className="h-px w-9 bg-gradient-to-l from-transparent to-accent" />
        </div>

        {/* Coverflow stage */}
        <div className="relative mb-10 flex h-[520px] w-full items-center justify-center" style={{ perspective: 1400 }}>
          {products.map((product, idx) => {
            const offset = signedOffset(idx, currentIndex, total);
            const isCenter = offset === 0;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4)";

            if (offset === 0) {
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = "translateX(285px) scale(0.84) rotateY(-24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === -1) {
              transform = "translateX(-285px) scale(0.84) rotateY(24deg)";
              opacity = 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = "translateX(510px) scale(0.68) rotateY(-38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === -2) {
              transform = "translateX(-510px) scale(0.68) rotateY(38deg)";
              opacity = 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={product.slug}
                onClick={() => !isCenter && setCurrentIndex(idx)}
                className="absolute h-[500px] w-[330px] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                style={{
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(124,207,0,0.2)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isCenter ? "default" : "pointer",
                }}
              >
                <Image src={product.image} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/10 to-black/95" />

                <div
                  className="relative z-20 flex h-full w-full flex-col justify-between px-5 py-6 text-center transition-all duration-500"
                  style={{
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {product.compareAtPrice && (
                    <span className="ml-auto rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Sale!
                    </span>
                  )}

                  <div className="mt-auto flex flex-col items-center gap-1 pb-1">
                    <h2 className="font-stencil text-2xl uppercase leading-tight tracking-wide text-white [text-shadow:0_3px_12px_rgba(0,0,0,0.95)]">
                      {product.name}
                    </h2>
                    <div className="my-2 h-[2px] w-9 rounded bg-accent shadow-[0_0_8px_rgba(124,207,0,0.7)]" />
                    <p className="flex items-center gap-2 text-sm text-white/90">
                      <span className="font-semibold">$ {product.price.toFixed(2)} USD</span>
                      {product.compareAtPrice && (
                        <span className="text-white/50 line-through">
                          $ {product.compareAtPrice.toFixed(2)} USD
                        </span>
                      )}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-transform hover:scale-105"
                    >
                      View Product
                      <ArrowRightIcon />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous product"
          className="absolute left-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition hover:border-accent hover:text-accent md:left-6"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next product"
          className="absolute right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm transition hover:border-accent hover:text-accent md:right-6"
        >
          <ChevronRightIcon />
        </button>

        <div className="z-30 flex items-center justify-center gap-2">
          {products.map((p, idx) => (
            <button
              key={p.slug}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to ${p.name}`}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: idx === currentIndex ? 28 : 8,
                backgroundColor: idx === currentIndex ? "#7ccf00" : "rgba(255,255,255,0.25)",
                boxShadow: idx === currentIndex ? "0 0 10px rgba(124,207,0,0.7)" : "none",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
