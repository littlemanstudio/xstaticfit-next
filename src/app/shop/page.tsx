"use client";

import { useState } from "react";
import Image from "next/image";
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
      <section className="relative flex h-[70vh] min-h-[440px] flex-col justify-center overflow-hidden">
        <Image src="/images/hero.jpg" alt="" fill className="object-cover opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-6 flex flex-col gap-3 md:mx-[60px]"
        >
          <Eyebrow align="left">Our Catalog</Eyebrow>
          <h1 className="font-stencil text-4xl uppercase md:text-6xl">Become a warrior</h1>
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
      </div>
    </div>
  );
}
