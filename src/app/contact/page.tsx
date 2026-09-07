import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import ContactForm from "./ContactForm";

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

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Or reach us here</p>
            <p className="mt-3 text-sm font-semibold uppercase">Xstatic Fit</p>
            <a href="mailto:contact@xstaticfit.com" className="text-sm text-white/70 underline">
              contact@xstaticfit.com
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
