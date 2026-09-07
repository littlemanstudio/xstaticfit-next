import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout Cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center bg-ink px-6 py-32 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-white/50">Checkout Cancelled</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase">No worries</h1>
      <p className="mt-4 text-sm text-white/70">
        Your cart is still saved. Come back whenever you&rsquo;re ready.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
      >
        Back to Shop
      </Link>
    </div>
  );
}
