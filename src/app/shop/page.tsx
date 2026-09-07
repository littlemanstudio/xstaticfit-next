"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";

const CATEGORIES = ["All", "Apparel", "Training"] as const;

export default function ShopPage() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = PRODUCTS.filter((p) => {
    if (active === "All") return true;
    return p.category === active.toLowerCase();
  });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
      <div className="mb-12 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Our Catalog</span>
        <h1 className="font-stencil text-4xl uppercase tracking-wide md:text-5xl">
          Become a warrior
        </h1>
      </div>

      <div className="mb-10 flex items-center gap-2 border-b border-line pb-4">
        <span className="mr-4 text-xs uppercase tracking-[0.2em] text-ink/50">Select Category</span>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
              active === c ? "bg-ink text-white" : "bg-mist text-ink/60 hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
