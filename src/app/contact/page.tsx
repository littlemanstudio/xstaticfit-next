import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <div>
      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Contact Us</span>
          <h1 className="mt-3 font-stencil text-4xl uppercase tracking-wide md:text-5xl">
            Get in Touch
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 py-20 md:grid-cols-2 md:px-10">
        <div>
          <h2 className="font-stencil text-2xl uppercase tracking-wide">
            Our customer support team is here to help
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Fill out the form below and a representative from our support team will get back to
            you. Usually, we respond to general enquiries within 24-48 hours.
          </p>

          <div className="mt-10 border-t border-line pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Or reach us here</p>
            <p className="mt-3 text-sm font-semibold uppercase">Xstatic Fit</p>
            <a href="mailto:contact@xstaticfit.com" className="text-sm text-ink/70 underline">
              contact@xstaticfit.com
            </a>
          </div>
        </div>

        <ContactForm />
      </section>
    </div>
  );
}
