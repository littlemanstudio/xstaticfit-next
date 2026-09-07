"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE } from "@/lib/motion";
import Magnetic from "./Magnetic";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section
      ref={ref}
      className="relative flex h-[100vh] min-h-[640px] flex-col justify-end overflow-hidden bg-ink pb-24 pt-32 text-white"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
          className="absolute inset-0"
        >
          <Image
            src="/images/hero.jpg"
            alt="Xstatic Fit athlete training"
            fill
            priority
            className="object-cover opacity-75"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/20" />
      </motion.div>

      <motion.div
        style={{ y: contentY }}
        className="relative z-10 mx-3 flex flex-col items-start gap-8 px-6 md:mx-[3vw] md:flex-row md:items-end md:justify-between md:px-[60px]"
      >
        <div className="flex max-w-2xl flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70"
          >
            <span className="h-px w-8 bg-accent" />
            Welcome to Xstatic Fit
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="font-stencil whitespace-nowrap text-4xl uppercase leading-[1.05] tracking-[0.05em] sm:text-5xl lg:text-6xl"
          >
            Raising Warriors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            className="max-w-md text-sm leading-relaxed text-white/70"
          >
            Get everything you need to stay fit, be greater &amp; live better. Our top of the
            notch products includes workout routines for you to follow along.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
        >
          <Magnetic strength={0.3}>
            <Link
              href="#bestsellers"
              className="inline-block shrink-0 rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition-shadow duration-500 hover:shadow-[0_0_32px_rgba(124,207,0,0.45)]"
            >
              Shop Now
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-white/30"
        />
      </motion.div>
    </section>
  );
}
