import Link from "next/link";

export default function GuaranteePage() {
  return (
    <div>
      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Guarantee</span>
          <h1 className="mt-3 font-stencil text-4xl uppercase tracking-wide md:text-5xl">
            100% Satisfaction Guaranteed
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 md:px-10">
        <p className="text-lg font-stencil uppercase tracking-wide text-ink">
          &ldquo;We stand behind the quality of everything we make.&rdquo;
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className="font-stencil text-2xl uppercase tracking-wide">
            We always delight our customers
          </h2>
          <p className="text-sm leading-relaxed text-ink/70">
            We believe in the quality of our products and want you to feel completely confident
            when you shop with us. That&rsquo;s why we offer a 14-day return policy.
          </p>
          <p className="text-sm leading-relaxed text-ink/70">
            If you&rsquo;re not fully satisfied with your purchase for any reason, you can return
            it within 15 days for a refund or exchange. That means no hassle &amp; especially no
            stress.
          </p>
        </div>

        <div className="mt-14 bg-mist p-10 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Ongoing Sale</span>
          <h3 className="mt-2 font-stencil text-2xl uppercase tracking-wide">Become a warrior</h3>
          <p className="mt-1 text-sm text-ink/60">Now receiving orders!</p>
          <Link
            href="/shop"
            className="mt-6 inline-block bg-ink px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
