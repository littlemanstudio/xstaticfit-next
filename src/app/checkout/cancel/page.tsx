import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Checkout Cancelled</span>
      <h1 className="mt-4 font-stencil text-4xl uppercase tracking-wide">No worries</h1>
      <p className="mt-4 text-sm text-ink/70">
        Your cart is still saved. Come back whenever you&rsquo;re ready.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block bg-ink px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink"
      >
        Back to Shop
      </Link>
    </div>
  );
}
