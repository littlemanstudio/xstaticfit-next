import Image from "next/image";
import Newsletter from "@/components/Newsletter";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import Hero from "@/components/Hero";
import CategoryTile from "@/components/CategoryTile";
import ProductCoverflow from "@/components/ProductCoverflow";
import { PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <>
      <Hero />

      {/* Bestsellers */}
      <section id="bestsellers">
        <ProductCoverflow products={PRODUCTS} eyebrow="Our Bestsellers" />
      </section>

      {/* Shop by category */}
      <section className="bg-ink px-6 py-24 text-white md:px-10">
        <Reveal className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
          <Eyebrow>Shop by category</Eyebrow>
          <h2 className="font-stencil text-3xl uppercase md:text-4xl">Join the Xstatic Fit Club</h2>
          <p className="text-sm text-white/60">
            Be the best version of yourself. We are all able to achieve greatness if we put in
            the work.
          </p>
        </Reveal>
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 md:grid-cols-2">
          <CategoryTile href="/category/apparel" image="/images/cat-apparel.jpg" label="Apparel" />
          <CategoryTile href="/category/training" image="/images/cat-training.jpg" label="Training" />
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <Image src="/images/banner-girl.jpg" alt="Athlete training with Xstatic Fit gear" fill className="object-cover opacity-30" />
        <Reveal className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-3 px-6 text-center">
          <Eyebrow>Subscribe</Eyebrow>
          <h2 className="font-stencil text-3xl uppercase md:text-4xl">
            Stay tuned on new arrivals and offers
          </h2>
          <div className="mt-6 w-full max-w-md">
            <Newsletter label="Subscribe to our newsletter." cta="Join" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
