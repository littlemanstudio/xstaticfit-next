import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import { PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[100vh] min-h-[640px] flex-col justify-end bg-ink pb-24 pt-32 text-white">
        <Image
          src="/images/hero.jpg"
          alt="Xstatic Fit athlete training"
          fill
          priority
          className="object-cover opacity-75"
        />
        <div className="relative z-10 mx-3 flex flex-col items-start gap-8 px-6 md:mx-[3vw] md:flex-row md:items-end md:justify-between md:px-[60px]">
          <div className="flex max-w-xl flex-col gap-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70">
              <span className="h-px w-8 bg-accent" />
              Welcome to Xstatic Fit
            </div>
            <h1 className="font-stencil text-5xl uppercase leading-[1.05] tracking-wide md:text-7xl">
              Raising
              <br />
              Warriors
            </h1>
            <p className="max-w-md text-sm text-white/70">
              Get everything you need to stay fit, be greater &amp; live better. Our top of the
              notch products includes workout routines for you to follow along.
            </p>
          </div>
          <Link
            href="#bestsellers"
            className="shrink-0 bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Bestsellers */}
      <section id="bestsellers" className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Our Bestsellers</span>
          <h2 className="font-stencil text-3xl uppercase tracking-wide md:text-4xl">
            Home training products + Routines
          </h2>
          <p className="max-w-xl text-sm text-ink/60">
            We&rsquo;ll make sure you won&rsquo;t buy anything you won&rsquo;t use. Most of our
            training equipment includes &ldquo;how to use&rdquo; videos.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-12 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Shop by category</span>
            <h2 className="font-stencil text-3xl uppercase tracking-wide md:text-4xl">
              Join the Xstatic Fit Club
            </h2>
            <p className="max-w-xl text-sm text-ink/60">
              Be the best version of yourself. We are all able to achieve greatness if we put in
              the work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CategoryTile href="/category/apparel" image="/images/cat-apparel.jpg" label="Apparel" />
            <CategoryTile href="/category/training" image="/images/cat-training.jpg" label="Training" />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <Image src="/images/banner-girl.jpg" alt="" fill className="object-cover opacity-30" />
        <div className="relative z-10 mx-auto max-w-xl px-6 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Subscribe</span>
          <h2 className="mt-3 font-stencil text-3xl uppercase tracking-wide md:text-4xl">
            Stay tuned on new arrivals and offers
          </h2>
          <div className="mt-8">
            <Newsletter label="Subscribe to our newsletter." cta="Join" />
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryTile({ href, image, label }: { href: string; image: string; label: string }) {
  return (
    <Link href={href} className="group relative block aspect-[16/10] overflow-hidden">
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/50" />
      <div className="absolute bottom-8 left-8 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Shop</p>
        <p className="font-stencil text-3xl uppercase tracking-wide">{label}</p>
      </div>
    </Link>
  );
}
