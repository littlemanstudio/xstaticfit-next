"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <span className="text-xs uppercase tracking-[0.3em] text-accent">Order Confirmed</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase tracking-wide">You&rsquo;re a warrior</h1>
      <p className="mt-4 text-sm text-ink/70">
        Thank you for your order. A confirmation has been sent to your email, and we&rsquo;ll ship
        within 24-48 hours.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block bg-ink px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
