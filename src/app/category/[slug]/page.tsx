import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import { PRODUCTS } from "@/lib/products";
import { breadcrumbSchema } from "@/lib/seo";

const CATEGORY_LABELS: Record<string, string> = {
  apparel: "Apparel",
  training: "Training",
};

const CATEGORY_COPY: Record<string, { intro: string; body: string }> = {
  training: {
    intro:
      "Every piece of Xstatic Fit training gear, from carbon grips to weighted jump ropes, is built to hold up to real, repeated work, not just look good in a photo.",
    body: "Our training category covers the equipment you actually reach for: carbon fiber hand grips for pull-ups and bar work, a weighted jump rope for cardio that scales with you, and an adjustable door pull-up bar that turns any room into a gym. Each product ships with a \"how to use\" video, so you're never guessing how to get started. Buy all three together and save 10% on your order, and every purchase is backed by our 14-day return policy if it's not the right fit for your setup.",
  },
  apparel: {
    intro:
      "Xstatic Fit apparel is in the works. In the meantime, shop our training gear, built for real home workouts, not just the gym selfie you post afterward.",
    body: "We're building out a training apparel line to match the same standard as our gear: built for real workouts, not just the gym selfie. Every design will go through the same real-training testing our equipment does before it ships, so when the line launches, you can trust it holds up to actual reps, not just a lookbook. In the meantime, check out our training equipment, carbon grips, weighted jump ropes, and door pull-up bars, all built to help you become the best version of yourself. Want to be the first to know when apparel drops? Sign up for our newsletter on the homepage, or follow along on Instagram for updates as we slowly get closer to an actual launch date.",
  },
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const label = CATEGORY_LABELS[slug];
  if (!label) return {};

  const title = `Shop ${label} Gear & Equipment Online`;
  const description = CATEGORY_COPY[slug]?.intro ?? `Shop ${label} at Xstatic Fit.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const label = CATEGORY_LABELS[slug];
  if (!label) notFound();

  const products = PRODUCTS.filter((p) => p.category === slug);
  const copy = CATEGORY_COPY[slug];

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: label, path: `/category/${slug}` },
  ]);

  return (
    <div className="min-h-[70vh] bg-ink px-6 py-14 text-white md:px-10 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <nav aria-label="Breadcrumb" className="mx-auto mb-10 max-w-[1400px] text-xs text-white/50">
        <ol className="flex items-center justify-center gap-2">
          <li>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/shop" className="hover:text-white">
              Shop
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-white/80">{label}</li>
        </ol>
      </nav>

      <Reveal className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
        <Eyebrow>Shop by Category</Eyebrow>
        <h1 className="font-stencil text-4xl uppercase md:text-5xl">{label}</h1>
        {copy && <p className="text-sm text-white/60">{copy.intro}</p>}
      </Reveal>

      {products.length === 0 ? (
        <p className="text-center text-sm text-white/60">
          New {label.toLowerCase()} drops coming soon.
        </p>
      ) : (
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      {copy && (
        <div className="mx-auto mt-24 max-w-2xl border-t border-white/10 pt-16 text-center">
          <p className="text-sm leading-relaxed text-white/60">{copy.body}</p>
        </div>
      )}
    </div>
  );
}
