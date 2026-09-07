"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { Product } from "@/lib/products";

export default function AddToCart({ product }: { product: Product }) {
  const cart = useCart();
  const [variant, setVariant] = useState(product.variants?.[0] ?? "");
  const [qty, setQty] = useState(1);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {product.variants && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ink/50">
            {product.variantLabel}
          </p>
          <div className="flex gap-2">
            {product.variants.map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`border px-4 py-2 text-xs uppercase tracking-wide transition ${
                  variant === v ? "border-ink bg-ink text-white" : "border-line text-ink/60"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-line">
          <button className="px-4 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="px-4 text-sm">{qty}</span>
          <button className="px-4 py-3" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
        <button
          onClick={() =>
            cart.add(
              {
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
              },
              qty
            )
          }
          className="flex-1 bg-ink py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
