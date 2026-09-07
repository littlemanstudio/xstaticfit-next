import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-mist">
        {product.compareAtPrice && (
          <span className="absolute left-3 top-3 z-10 bg-accent px-2 py-1 text-[10px] font-stencil uppercase tracking-wide text-ink">
            Sale!
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide">{product.name}</h3>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="font-semibold">$ {product.price.toFixed(2)} USD</span>
        {product.compareAtPrice && (
          <span className="text-ink/40 line-through">$ {product.compareAtPrice.toFixed(2)} USD</span>
        )}
      </div>
    </Link>
  );
}
