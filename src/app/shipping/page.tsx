import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const TITLE = "Shipping & Returns";
const DESCRIPTION =
  "Xstatic Fit ships within 24-48 hours with 3-5 day delivery, plus a 14-day return policy. See our full shipping and returns policy here.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-24 text-center">
        <Eyebrow>Shipping Worldwide</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">Shipping &amp; Returns</h1>
        <p className="mt-2 text-sm text-white/60">Delivering rock solid dependability</p>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl border-t border-white/10 px-6 py-20 md:px-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-stencil text-2xl uppercase">Shipping</h2>
          <p className="text-sm leading-relaxed text-white/70">
            We typically ship within 24 hours of placing your order; however, some orders may
            take up to 48 hours to process. Please note that we do not ship on Saturdays or
            Sundays.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            All orders will arrive within 3-5 business days.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            For more information and shipping inquiries, please contact us at{" "}
            <a href="mailto:contact@xstaticfit.com" className="underline">
              contact@xstaticfit.com
            </a>
          </p>
        </div>

        <div className="mt-14 flex flex-col gap-4">
          <h2 className="font-stencil text-2xl uppercase">Returns</h2>
          <p className="text-sm leading-relaxed text-white/70">
            Change of heart? No problem, we accept exchange or refunds within 14 days after
            delivery.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            Your purchase should be returned in saleable condition with all product packaging
            (box, bag and care card). Ensure that the item is safely wrapped in its cloth to
            avoid scratches. Any damage caused by negligence in the return process will be the
            customer&rsquo;s responsibility.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            Goods will be refunded upon inspection on arrival (excluding the original delivery
            charge). Please note that resized, customized, damaged or otherwise altered items
            after delivery will not be accepted for return. Return shipping charges are not
            refundable.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            The item is your responsibility until it reaches us. Therefore, for your own
            protection, we recommend that you send the parcel using a traceable delivery
            service.
          </p>
          <p className="text-sm leading-relaxed text-white/70">
            To determine the best return process, please contact us at{" "}
            <a href="mailto:contact@xstaticfit.com" className="underline">
              contact@xstaticfit.com
            </a>
          </p>
        </div>

        <Link
          href="/shop"
          className="mt-14 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
        >
          Shop Now
        </Link>
      </Reveal>
    </div>
  );
}
