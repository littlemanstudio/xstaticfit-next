import Image from "next/image";
import Link from "next/link";

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
    <div>
      <section className="relative flex h-[70vh] min-h-[480px] flex-col justify-end bg-ink pb-20 pt-32 text-white">
        <Image src="/images/hero.jpg" alt="" fill className="object-cover opacity-60" />
        <div className="relative z-10 mx-6 md:mx-[60px]">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Founded by</span>
          <h1 className="mt-3 font-stencil text-4xl uppercase leading-tight tracking-wide md:text-6xl">
            Young Local
            <br />
            Entrepreneurs
          </h1>
          <p className="mt-4 text-sm text-white/70">Striving for greatness!</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 py-24 md:grid-cols-2 md:px-10">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          <Image src="/images/about-leather.jpg" alt="Allan Rosario" fill className="object-cover" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Our Story</span>
          <h2 className="mt-3 font-stencil text-3xl uppercase tracking-wide">
            Founded by local young entrepreneurs
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-ink/70">
            <p>
              My name is Allan Rosario. I&rsquo;m a 14 year old entrepreneur from Puerto Rico. I
              started working out with my dad when I was 7 years old. I&rsquo;ve always been
              looking for ways to create a business where I can motivate and inspire people the
              way I was inspired through fitness. For me, fitness is something that changes
              lives, it is something that helps people break barriers and become someone they
              would never have imagined. To become the best version of themselves.
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
          <p className="mt-6 font-stencil text-xl uppercase tracking-wide">&ldquo;Welcome Warriors&rdquo;</p>
          <p className="text-sm text-ink/50">— Allan</p>
          <Link
            href="/shop"
            className="mt-8 inline-block bg-ink px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-white transition hover:bg-accent hover:text-ink"
          >
            Discover the Shop
          </Link>
        </div>
      </section>

      <section className="bg-mist py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <h2 className="mb-12 font-stencil text-3xl uppercase tracking-wide">
            What people are saying
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {REVIEWS.map((r) => (
              <div key={r.name + r.tag} className="bg-white p-8">
                <p className="text-sm leading-relaxed text-ink/70">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide">{r.name}</p>
                <p className="text-xs text-ink/50">{r.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-center text-white">
        <span className="text-xs uppercase tracking-[0.3em] text-accent">Xstatic Fit</span>
        <h2 className="mt-3 font-stencil text-3xl uppercase tracking-wide">
          Now receiving orders
        </h2>
        <p className="mt-2 text-sm text-white/60">Stay tuned for new arrivals and offers.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
        >
          Shop Now
        </Link>
      </section>
    </div>
  );
}
