"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart, useHasHydrated } from "@/store/cart";

export default function CartDrawer() {
  const cart = useCart();
  const hydrated = useHasHydrated();
  const [loading, setLoading] = useState(false);

  if (!hydrated || !cart.isOpen) return null;

  async function checkout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.items }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout failed. Try again.");
    } catch {
      alert("Checkout failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close cart overlay"
        onClick={cart.close}
        className="absolute inset-0 bg-black/70"
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-ink text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-stencil text-xl uppercase">Your Cart</h2>
          <button onClick={cart.close} className="text-xs font-semibold uppercase tracking-widest hover:text-accent">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/60">No items found.</p>
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
                        Remove
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
            <span>Subtotal:</span>
            <span className="font-semibold">$ {cart.subtotal().toFixed(2)} USD</span>
          </div>
          <button
            onClick={checkout}
            disabled={cart.items.length === 0 || loading}
            className="block w-full rounded-[3px] bg-accent py-4 text-center font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-40"
          >
            {loading ? "Redirecting…" : "Continue to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
