"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import Eyebrow from "@/components/Eyebrow";
import { PRODUCTS } from "@/lib/products";

const CATEGORIES = ["All", "Apparel", "Training"] as const;

export default function ShopPage() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = PRODUCTS.filter((p) => {
    if (active === "All") return true;
    return p.category === active.toLowerCase();
  });

  return (
    <div className="bg-ink text-white">
      <section
        style={{ marginTop: "calc(var(--header-h) * -1)", height: "calc(70vh + var(--header-h))" }}
        className="relative flex min-h-[440px] flex-col justify-center overflow-hidden"
      >
        <Image src="/images/hero.jpg" alt="Xstatic Fit training gear background" fill className="object-cover opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-6 flex flex-col gap-3 md:mx-[60px]"
        >
          <Eyebrow align="left">Our Catalog</Eyebrow>
          <h1 className="font-stencil text-4xl uppercase md:text-6xl">Become a warrior</h1>
          <p className="max-w-md text-sm text-white/70">
            Home training gear built to hold up to real work: carbon fiber grips, weighted
            jump ropes, and door pull-up bars, each shipped with a &ldquo;how to use&rdquo;
            video so you know exactly what to do from day one.
          </p>
        </motion.div>
      </section>

      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <div className="mb-10 flex items-center justify-center gap-8 border-b border-white/10 pb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`text-xs uppercase tracking-[0.2em] transition ${
                active === c ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-24 max-w-2xl border-t border-white/10 pt-16 text-center">
          <h2 className="font-stencil text-2xl uppercase">Built for how you actually train</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            We&rsquo;ll make sure you won&rsquo;t buy anything you won&rsquo;t use. Every product
            in the catalog is picked for one reason: it holds up to real, repeated training, not
            just a photo shoot. Most of our gear ships with a &ldquo;how to use&rdquo; video so
            you&rsquo;re never guessing.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Buy all three items together and save 10% on your order. See our{" "}
            <Link href="/product/xstatic-carbon-grips" className="underline">
              frequently asked questions
            </Link>{" "}
            on any product page for details.
          </p>
        </div>
      </div>
    </div>
  );
}
