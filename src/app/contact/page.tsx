import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import ContactForm from "./ContactForm";

const TITLE = "Contact Our Customer Support Team Today";
const DESCRIPTION =
  "Get in touch with the Xstatic Fit team for order questions, product support, or general inquiries. Our support team typically responds within 24 to 48 hours.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-ink text-white">
      <Reveal className="py-24 text-center">
        <Eyebrow>Contact Us</Eyebrow>
        <h1 className="mt-4 font-stencil text-4xl uppercase md:text-5xl">Get in Touch</h1>
      </Reveal>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 border-t border-white/10 px-6 py-20 md:grid-cols-2 md:px-10">
        <Reveal>
          <h2 className="font-stencil text-2xl uppercase">
            Our customer support team is here to help
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Fill out the form below and a representative from our support team will get back to
            you. Usually, we respond to general enquiries within 24-48 hours.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Whether you have a question about an order, need help choosing between our training
            gear, or just want to talk shop about your training routine, we&rsquo;re happy to
            help. Xstatic Fit is a small, hands-on team, so you&rsquo;ll hear back from a real
            person, not a bot.
          </p>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Or reach us here</p>
            <p className="mt-3 text-sm font-semibold uppercase">Xstatic Fit</p>
            <a href="mailto:contact@xstaticfit.com" className="text-sm text-white/70 underline">
              contact@xstaticfit.com
            </a>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Before you reach out
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              <li>
                Questions about delivery times or a return?{" "}
                <Link href="/shipping" className="underline">
                  Check our Shipping &amp; Returns page
                </Link>
                .
              </li>
              <li>
                Want to know more about how we stand behind our gear?{" "}
                <Link href="/guarantee" className="underline">
                  Read our guarantee
                </Link>
                .
              </li>
              <li>
                Still browsing?{" "}
                <Link href="/shop" className="underline">
                  See the full catalog
                </Link>
                .
              </li>
              <li>
                Want the founder&rsquo;s story?{" "}
                <Link href="/about" className="underline">
                  Read about Xstatic Fit
                </Link>
                .
              </li>
            </ul>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Order support</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Include your order number if you&rsquo;re writing about an existing purchase, and
              we&rsquo;ll pull it up right away. It speeds things up, especially for shipping and
              return questions where we need to look at the specific carrier details on your box.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
