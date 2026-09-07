import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct, getRelated, FAQS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Eyebrow from "@/components/Eyebrow";
import AddToCart from "./AddToCart";
import ProductGallery from "./ProductGallery";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug);

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 py-16 md:grid-cols-2 md:px-10">
        <ProductGallery images={product.images} name={product.name} onSale={!!product.compareAtPrice} />

        <div>
          <h1 className="font-stencil text-3xl uppercase md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-lg">
            <span className="font-semibold">$ {product.price.toFixed(2)} USD</span>
            {product.compareAtPrice && (
              <span className="text-white/40 line-through">
                $ {product.compareAtPrice.toFixed(2)} USD
              </span>
            )}
          </div>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/70">
            {product.description}
          </p>

          <AddToCart product={product} />

          <details className="mt-8 border-t border-white/10 pt-4 text-sm text-white/70">
            <summary className="cursor-pointer font-semibold uppercase tracking-wide text-white">
              More Information and Features
            </summary>
            <p className="mt-3">{product.description}</p>
          </details>
        </div>
      </div>

      {/* More from catalog */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <h2 className="mb-10 font-stencil text-2xl uppercase">More from catalog</h2>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <Eyebrow align="left">FAQ</Eyebrow>
          <h2 className="mb-2 mt-3 font-stencil text-2xl uppercase">Frequently asked questions</h2>
          <p className="mb-10 text-sm text-white/60">
            If this list does not have the answers to your queries, please{" "}
            <Link href="/contact" className="underline">
              Contact us
            </Link>
            . Usually we respond to the general enquiries within 48 hours.
          </p>
          <div className="flex flex-col divide-y divide-white/10">
            {FAQS.map((f) => (
              <details key={f.q} className="py-5">
                <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-white/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
