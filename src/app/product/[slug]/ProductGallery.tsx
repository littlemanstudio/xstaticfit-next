"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductGallery({
  images,
  name,
  onSale,
}: {
  images: string[];
  name: string;
  onSale: boolean;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {onSale && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Sale!
          </span>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image src={images[active]} alt={name} fill priority className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-7">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden bg-white/5 transition ${
                active === i ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${name} view ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
