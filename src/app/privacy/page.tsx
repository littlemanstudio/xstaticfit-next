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
        <p className="mt-2 text-sm text-white/50">Last updated: September 6, 2026</p>
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
                Usage data: pages visited, device and browser type, and general location, collected
                automatically via standard web analytics.
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
              like payment processing (Stripe), shipping carriers, and email delivery, and only
              to the extent needed to provide those services. We do not sell your personal
              information to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-stencil text-xl uppercase text-white">Cookies</h2>
            <p>
              We use cookies and similar technologies to keep your cart working between pages, remember
              your preferences, and understand how visitors use our site. You can disable cookies in
              your browser settings, though some features may not work correctly without them.
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
