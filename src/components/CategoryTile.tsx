"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import RollingText from "./RollingText";

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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <Link href={href} className="group relative block aspect-[16/10] overflow-hidden">
        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0"
        >
          <Image src={image} alt={label} fill className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/50" />
        <motion.div
          initial={{ y: 0 }}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="absolute bottom-8 left-8 text-white"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Shop</p>
          <p className="font-stencil text-3xl uppercase tracking-wide">
            <RollingText>{label}</RollingText>
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
}
