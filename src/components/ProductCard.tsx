"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Product } from "@/lib/products";
import { EASE } from "@/lib/motion";

export default function ProductCard({ product }: { product: Product }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      style={{ perspective: 1200 }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-square overflow-hidden bg-white/5"
        >
          {product.compareAtPrice && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Sale!
            </span>
          )}
          <motion.div style={{ transform: "translateZ(20px)" }} className="absolute inset-0">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-center gap-2 pb-5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                View Product
              </span>
            </div>
          </motion.div>
        </motion.div>
        <div className="mt-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">{product.name}</h3>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="font-semibold text-white">$ {product.price.toFixed(2)} USD</span>
          {product.compareAtPrice && (
            <span className="text-white/40 line-through">$ {product.compareAtPrice.toFixed(2)} USD</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
