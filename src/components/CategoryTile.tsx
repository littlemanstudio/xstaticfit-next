"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CategoryTile({
  href,
  image,
  label,
}: {
  href: string;
  image: string;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link href={href} className="group relative block aspect-[16/10] overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <Image src={image} alt={label} fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/50" />
        <motion.div
          initial={{ y: 0 }}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-8 left-8 text-white"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Shop</p>
          <p className="font-stencil text-3xl uppercase tracking-wide">{label}</p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
