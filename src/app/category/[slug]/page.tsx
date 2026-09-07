import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import { PRODUCTS } from "@/lib/products";

const CATEGORY_LABELS: Record<string, string> = {
  apparel: "Apparel",
  training: "Training",
};

export function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((slug) => ({ slug }));
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const { slug } = await props.params;
  const label = CATEGORY_LABELS[slug];
  if (!label) notFound();

  const products = PRODUCTS.filter((p) => p.category === slug);

  return (
    <div className="min-h-[70vh] bg-ink px-6 py-24 text-white md:px-10">
      <Reveal className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 text-center">
        <Eyebrow>Shop by Category</Eyebrow>
        <h1 className="font-stencil text-4xl uppercase md:text-5xl">{label}</h1>
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
    </div>
  );
}
