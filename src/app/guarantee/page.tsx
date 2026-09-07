import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

export default function GuaranteePage() {
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-24 text-center">
        <Eyebrow>Guarantee</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">
          100% Satisfaction Guaranteed
        </h1>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl border-t border-white/10 px-6 py-20 text-center md:px-10">
        <p className="text-lg font-stencil uppercase text-white">
          &ldquo;We stand behind the quality of everything we make.&rdquo;
        </p>

        <div className="mt-10 flex flex-col gap-4 text-left">
          <h2 className="font-stencil text-2xl uppercase">We always delight our customers</h2>
          <p className="text-sm leading-relaxed text-white/70">
            We believe in the quality of our products and want you to feel completely confident
            when you shop with us. That&rsquo;s why we offer a 14-day return policy.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            If you&rsquo;re not fully satisfied with your purchase for any reason, you can return
            it within 15 days for a refund or exchange. That means no hassle &amp; especially no
            stress.
          </p>
        </div>

        <div className="mt-14 border border-white/10 p-10">
          <Eyebrow>Ongoing Sale</Eyebrow>
          <h3 className="mt-3 font-stencil text-2xl uppercase">Become a warrior</h3>
          <p className="mt-1 text-sm text-white/60">Now receiving orders!</p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
          >
            Shop Now
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
