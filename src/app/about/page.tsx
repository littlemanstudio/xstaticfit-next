import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";

const TITLE = "Our Story";
const DESCRIPTION =
  "Founded by 14-year-old Puerto Rico entrepreneur Allan Rosario, Xstatic Fit builds home training gear to help you break barriers and become your best self.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: ["/images/hero.jpg"] },
  twitter: { title: TITLE, description: DESCRIPTION, images: ["/images/hero.jpg"] },
  alternates: { canonical: "/about" },
};

const REVIEWS = [
  {
    name: "Michael H",
    tag: "Xstatic Grips",
    text: "I've tried my fair share of grips, but none come close to the Xstatic Grips. It's like being glued to the bar, especially during intense workouts like speal bars.",
  },
  {
    name: "Kari Mehl",
    tag: "President, Corporate Store",
    text: "Has been a solid addition to my home gym setup. As someone who tries to stay active amidst a busy schedule, love the convenience it offers. It's sturdy enough to support my workouts without feeling flimsy, which is a big plus. Installing it was a breeze, and it fits snugly on my door frame.",
  },
  {
    name: "Justin Hall",
    tag: "Xstatic Ropes",
    text: "These Xstatic Fit Jump Ropes are a game changer. They're sturdy, easy to adjust, and adding weights gives me a killer workout. Seriously, they've made cardio fun again. Worth every penny.",
  },
  {
    name: "Sarah Thompson",
    tag: "Xstatic Bar",
    text: "Has been a solid addition to my home gym setup. As someone who tries to stay active amidst a busy schedule, love the convenience it offers. It's sturdy enough to support my workouts without feeling flimsy, which is a big plus.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-ink text-white">
      <section
        style={{ marginTop: "calc(var(--header-h) * -1)", height: "calc(70vh + var(--header-h))" }}
        className="relative flex min-h-[480px] flex-col justify-center overflow-hidden"
      >
        <Image src="/images/hero.jpg" alt="Xstatic Fit training gear background" fill className="object-cover opacity-40" />
        <div className="relative z-10 mx-6 flex flex-col gap-3 md:mx-[60px]">
          <Eyebrow align="left">Founded by</Eyebrow>
          <h1 className="font-stencil text-4xl uppercase leading-tight md:text-6xl">
            Young Local
            <br />
            Entrepreneurs
          </h1>
          <p className="text-sm text-white/70">Striving for greatness!</p>
        </div>
      </section>

      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:px-10">
        <Eyebrow>Our Story</Eyebrow>
        <h2 className="mt-4 font-stencil text-3xl uppercase md:text-4xl">
          Founded by local young entrepreneurs
        </h2>
        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4 text-left text-sm leading-relaxed text-white/70">
          <p>
            My name is Allan Rosario. I&rsquo;m a 14 year old entrepreneur from Puerto Rico. I
            started working out with my dad when I was 7 years old. I&rsquo;ve always been
            looking for ways to create a business where I can motivate and inspire people the
            way I was inspired through fitness. For me, fitness is something that changes lives,
            it is something that helps people break barriers and become someone they would never
            have imagined. To become the best version of themselves.
          </p>
          <p>
            Most people struggle to work out because they don&rsquo;t know where to start or
            they don&rsquo;t feel comfortable enough to expose themselves to a gym. That&rsquo;s
            why we created Xstatic Fit. Xstatic Fit is not only another retail fitness company.
            What makes us different is that we provide you the necessary tools and guidance for
            you to train where you feel best and perform at your best.
          </p>
          <p>We include training routine videos with most of our gear so you know exactly what to do.</p>
          <p>Thank you for supporting us. Please contact us for any questions or inquiries.</p>
        </div>
        <p className="mt-8 font-stencil text-xl uppercase">&ldquo;Welcome Warriors&rdquo;</p>
        <p className="text-sm text-white/50">Allan</p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
        >
          Discover the Shop
        </Link>
      </Reveal>

      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal className="mb-12 flex flex-col items-center gap-3 text-center">
            <Eyebrow>Reviews</Eyebrow>
            <h2 className="font-stencil text-3xl uppercase">What people are saying</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {REVIEWS.map((r, i) => (
              <Reveal key={r.name + r.tag} delay={i * 0.08} className="border border-white/10 p-8">
                <p className="text-sm leading-relaxed text-white/70">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide">{r.name}</p>
                <p className="text-xs text-white/50">{r.tag}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-20 text-center">
        <Eyebrow>Xstatic Fit</Eyebrow>
        <h2 className="mt-3 font-stencil text-3xl uppercase">Now receiving orders</h2>
        <p className="mt-2 text-sm text-white/60">Stay tuned for new arrivals and offers.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
