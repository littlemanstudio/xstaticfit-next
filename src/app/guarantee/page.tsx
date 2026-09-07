import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const TITLE = "100% Satisfaction Guarantee on Every Order";
const DESCRIPTION =
  "Xstatic Fit backs every product with a 14-day return policy. Shop with confidence, and if it's not right, send it back for a full refund or easy exchange.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/guarantee" },
};

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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-10 text-left">
          <h2 className="font-stencil text-2xl uppercase">How it works</h2>
          <p className="text-sm leading-relaxed text-white/70">
            Every Xstatic Fit product goes through real training use before it ever ships, not
            just a photo shoot. Carbon fiber grips get pull-up tested, jump ropes get logged
            miles, and pull-up bars get loaded past their rated weight. If something still
            doesn&rsquo;t hold up the way it should, we want to know about it.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            To start a return or exchange, email{" "}
            <a href="mailto:contact@xstaticfit.com" className="underline">
              contact@xstaticfit.com
            </a>{" "}
            with your order number. We&rsquo;ll walk you through sending the item back, and once
            it arrives and passes inspection, your refund or replacement goes out right away. See
            our full{" "}
            <Link href="/shipping" className="underline">
              Shipping &amp; Returns policy
            </Link>{" "}
            for the fine print.
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
