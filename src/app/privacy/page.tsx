import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const TITLE = "Privacy Policy & Your Data Protection";
const DESCRIPTION =
  "How Xstatic Fit collects, uses, and protects your personal information when you shop with us. Read our full privacy policy before you place your order.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-14 text-center md:py-24">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/50">Last updated: October 17, 2026</p>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl border-t border-white/10 px-6 py-12 md:px-10 md:py-20">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-white/70">
          <p>
            Xstatic Fit (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects your
            privacy. This policy explains what information we collect when you visit or shop at
            xstaticfit.com, how we use it, and the choices you have.
          </p>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Information We Collect</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>Contact details you give us: name, email address, shipping address, phone number.</li>
              <li>Order information: items purchased, order value, order history.</li>
              <li>
                Payment information: processed directly by Stripe, our payment processor. We do
                not store your card number, CVC, or full payment details on our servers.
              </li>
              <li>
                Usage data: pages visited, device and browser type, IP address, and general
                location, collected automatically through cookies and the Meta Pixel (see
                &ldquo;Advertising &amp; Measurement&rdquo; below).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">How We Use Your Information</h2>
            <ul className="flex flex-col gap-2 list-disc pl-5">
              <li>To process and fulfill your orders, including shipping and customer support.</li>
              <li>To send order confirmations, shipping updates, and, if you opt in, marketing emails about new products and offers.</li>
              <li>To improve our site, products, and customer experience.</li>
              <li>To detect and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Sharing Your Information</h2>
            <p>
              We share information only with service providers who help us run our business,
              like payment processing (Stripe), shipping carriers, email delivery, and
              advertising measurement (Meta, as described below), and only to the extent needed
              to provide those services. We do not sell your personal information for money. Sending
              data to Meta for ad measurement may count as &ldquo;sharing&rdquo; under some US state
              privacy laws; you can opt out at any time as described below.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Advertising &amp; Measurement</h2>
            <p>
              We use the Meta Pixel (a small piece of code from Meta Platforms, the company behind
              Facebook and Instagram) and Meta&rsquo;s Conversions API to measure how our ads perform
              and to show our ads to people who may be interested in them.
            </p>
            <ul className="mt-3 flex flex-col gap-2 list-disc pl-5">
              <li>
                From your browser, the Meta Pixel sends Meta the pages you view, the products you view
                or add to your cart, when you start checkout, and when you complete a purchase, along
                with your IP address, browser details, and Meta cookie identifiers.
              </li>
              <li>
                From our server (Conversions API), we send Meta the same shopping events. For
                purchases this includes the order value and items, plus your email address, phone
                number, city, state, ZIP code, and country in hashed (scrambled) form, which Meta
                uses to match the purchase to an ad.
              </li>
              <li>
                Meta handles this data under its own privacy policy at{" "}
                <a
                  href="https://www.facebook.com/privacy/policy/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  facebook.com/privacy/policy
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              You can say no. Click &ldquo;Decline&rdquo; in the cookie banner, or use the
              &ldquo;Cookie Choices&rdquo; link at the bottom of any page to change your mind later.
              When you decline, we do not load the Meta Pixel and we do not send your visits or
              purchases to Meta. We also treat a Global Privacy Control signal from your browser as
              a decline. You can also manage ad preferences in your Facebook or Instagram settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Cookies</h2>
            <p>
              We use cookies and similar technologies to keep your cart working between pages, remember
              your preferences and your cookie choice, and understand how visitors use our site. If you
              do not decline, the Meta Pixel sets Meta cookies (such as _fbp and _fbc) to recognize
              your browser and connect visits to ads. You can disable cookies in your browser
              settings, though some features may not work correctly without them.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Your Rights</h2>
            <p>
              You can ask us to access, correct, or delete the personal information we hold about
              you, and you can unsubscribe from marketing emails at any time using the link in any
              email we send. To make a request, contact us at{" "}
              <a href="mailto:contact@xstaticfit.com" className="underline">
                contact@xstaticfit.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Data Retention</h2>
            <p>
              We keep order records for as long as needed for accounting, tax, and legal purposes,
              and delete or anonymize other personal data when it&rsquo;s no longer needed for the
              purposes described above.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Changes will be posted on this page with
              an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Contact Us</h2>
            <p>
              Questions about this policy? Email us at{" "}
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
