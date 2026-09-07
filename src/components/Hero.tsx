"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[100vh] min-h-[640px] flex-col justify-end overflow-hidden bg-ink pb-24 pt-32 text-white"
    >
      <motion.div style={{ y: imageY }} className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Xstatic Fit athlete training"
          fill
          priority
          className="object-cover opacity-75"
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-3 flex flex-col items-start gap-8 px-6 md:mx-[3vw] md:flex-row md:items-end md:justify-between md:px-[60px]"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70"
          >
            <span className="h-px w-8 bg-accent" />
            Welcome to Xstatic Fit
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="font-stencil whitespace-nowrap text-4xl uppercase leading-[1.05] tracking-[0.05em] sm:text-5xl lg:text-6xl"
          >
            Raising Warriors
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-md text-sm text-white/70"
          >
            Get everything you need to stay fit, be greater &amp; live better. Our top of the
            notch products includes workout routines for you to follow along.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <Link
            href="#bestsellers"
            className="inline-block shrink-0 rounded-[3px] bg-accent px-8 py-4 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 hover:shadow-[0_0_24px_rgba(124,207,0,0.5)]"
          >
            Shop Now
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
