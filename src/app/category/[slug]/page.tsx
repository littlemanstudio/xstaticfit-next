import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
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
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
      <div className="mb-12 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-ink/50">Shop by Category</span>
        <h1 className="font-stencil text-4xl uppercase tracking-wide md:text-5xl">{label}</h1>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink/60">New {label.toLowerCase()} drops coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
