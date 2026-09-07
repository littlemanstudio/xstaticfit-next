import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct, getRelated, FAQS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug);

  return (
    <div>
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 py-16 md:grid-cols-2 md:px-10">
        <div className="relative aspect-square overflow-hidden bg-mist">
          {product.compareAtPrice && (
            <span className="absolute left-4 top-4 z-10 bg-accent px-3 py-1 text-xs font-stencil uppercase tracking-wide text-ink">
              Sale!
            </span>
          )}
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>

        <div>
          <h1 className="font-stencil text-3xl uppercase tracking-wide md:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-lg">
            <span className="font-semibold">$ {product.price.toFixed(2)} USD</span>
            {product.compareAtPrice && (
              <span className="text-ink/40 line-through">
                $ {product.compareAtPrice.toFixed(2)} USD
              </span>
            )}
          </div>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink/70">
            {product.description}
          </p>

          <AddToCart product={product} />

          <details className="mt-8 border-t border-line pt-4 text-sm text-ink/70">
            <summary className="cursor-pointer font-semibold uppercase tracking-wide text-ink">
              More Information and Features
            </summary>
            <p className="mt-3">{product.description}</p>
          </details>
        </div>
      </div>

      {/* More from catalog */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <h2 className="mb-10 font-stencil text-2xl uppercase tracking-wide">More from catalog</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-24">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <h2 className="mb-2 font-stencil text-2xl uppercase tracking-wide">
            Frequently asked questions
          </h2>
          <p className="mb-10 text-sm text-ink/60">
            If this list does not have the answers to your queries, please{" "}
            <Link href="/contact" className="underline">
              Contact us
            </Link>
            . Usually we respond to the general enquiries within 48 hours.
          </p>
          <div className="flex flex-col divide-y divide-line">
            {FAQS.map((f) => (
              <details key={f.q} className="py-5">
                <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
