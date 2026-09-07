import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const TITLE = "Terms & Conditions of Sale, Use, and Returns";
const DESCRIPTION =
  "The terms that govern orders, shipping, returns, and use of xstaticfit.com. Read our full terms and conditions carefully before you shop with us today.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-14 text-center md:py-24">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: September 6, 2026</p>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl border-t border-white/10 px-6 py-12 md:px-10 md:py-20">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          <p>
            These Terms &amp; Conditions govern your use of xstaticfit.com and any purchase you
            make from us. By placing an order or using this site, you agree to these terms.
          </p>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Orders &amp; Payment</h2>
            <p>
              All prices are listed in US dollars. Payment is processed securely through Stripe at
              the time of checkout. We reserve the right to refuse or cancel any order, including
              for suspected fraud, pricing errors, or inventory issues, in which case you will be
              fully refunded.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Shipping</h2>
            <p>
              Orders typically ship within 24&ndash;48 hours on business days and arrive within
              3&ndash;5 business days. See our{" "}
              <a href="/shipping" className="underline">
                Shipping &amp; Returns
              </a>{" "}
              page for full details. Risk of loss and title for products purchased pass to you upon
              delivery to the shipping carrier.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Returns &amp; Refunds</h2>
            <p>
              We offer a 14-day return policy from the date of delivery on items returned in
              saleable condition with original packaging. Return shipping is the customer&rsquo;s
              responsibility unless the item arrived damaged or defective. Full details are on our{" "}
              <a href="/shipping" className="underline">
                Shipping &amp; Returns
              </a>{" "}
              page.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Product Use &amp; Liability</h2>
            <p>
              Our training equipment is intended for general fitness use by adults in reasonable
              health. Consult a physician before beginning any new exercise program. You use our
              products at your own risk, and Xstatic Fit is not liable for injuries resulting from
              improper use, failure to follow included instructions, or pre-existing health
              conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Intellectual Property</h2>
            <p>
              All content on this site, including text, graphics, logos, and product photography,
              is the property of Xstatic Fit and may not be copied or reused without our written
              permission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Account &amp; Conduct</h2>
            <p>
              You agree to provide accurate information when placing an order and not to use this
              site for any unlawful purpose, including attempting to interfere with its normal
              operation.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the site after changes
              are posted means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Contact Us</h2>
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:contact@xstaticfit.com" className="underline">
                contact@xstaticfit.com
              </a>
              .
            </p>
          </section>
        </div>
      </Reveal>
    </div>
  );
}
