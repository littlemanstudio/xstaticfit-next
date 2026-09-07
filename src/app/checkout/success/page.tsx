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
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center bg-ink px-6 py-32 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-accent">Order Confirmed</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase">You&rsquo;re a warrior</h1>
      <p className="mt-4 text-sm text-white/70">
        Thank you for your order. A confirmation has been sent to your email, and we&rsquo;ll ship
        within 24-48 hours.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
