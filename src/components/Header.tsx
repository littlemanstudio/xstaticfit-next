"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useHasHydrated } from "@/store/cart";
import { EASE } from "@/lib/motion";
import RollingText from "./RollingText";
import Magnetic from "./Magnetic";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/about", label: "About" },
];

const MENU_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/about", label: "About" },
  { href: "/guarantee", label: "Guarantee" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCart();
  const hydrated = useHasHydrated();
  const count = hydrated ? cart.count() : 0;
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/images/logo-white.png" alt="Xstatic Fit" width={28} height={28} className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="whitespace-nowrap font-stencil text-sm tracking-[0.1em] sm:text-lg">
              XSTATIC FIT
            </span>
          </Link>
          <span className="hidden h-px w-6 bg-white/30 md:block" />

          <nav className="hidden items-center text-[11px] font-semibold uppercase tracking-[4px] md:flex">
            {LINKS.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`group relative ml-8 py-1 transition-colors before:absolute before:inset-x-0 before:bottom-0 before:h-[1.5px] before:origin-left before:scale-x-0 before:bg-accent before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-accent hover:before:scale-x-100 ${
                    isActive ? "text-accent before:scale-x-100" : ""
                  }`}
                >
                  <RollingText>{l.label}</RollingText>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[4px] hover:text-accent sm:gap-3"
            aria-label="Open menu"
          >
            <span className="relative h-3 w-4 shrink-0">
              <span className="absolute left-0 top-0 h-[1.5px] w-4 bg-current" />
              <span className="absolute bottom-0 left-0 h-[1.5px] w-4 bg-current" />
            </span>
            <span className="hidden sm:inline">Menu</span>
          </button>
          <Magnetic strength={0.4}>
            <button
              onClick={cart.open}
              className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[4px]"
              aria-label="Open cart"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0"
              >
                <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold normal-case tracking-normal text-ink">
                {count}
              </span>
            </button>
          </Magnetic>
        </div>
      </div>

      <AnimatePresence>{menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}</AnimatePresence>
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-white"
    >
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-white.png" alt="Xstatic Fit" width={24} height={24} className="h-6 w-6" />
          <span className="font-stencil text-sm tracking-[0.1em] sm:text-lg">XSTATIC FIT</span>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative flex h-8 w-8 shrink-0 items-center justify-center"
          aria-label="Close menu"
        >
          <span className="absolute h-[1.5px] w-5 rotate-45 bg-white" />
          <span className="absolute h-[1.5px] w-5 -rotate-45 bg-white" />
        </motion.button>
      </div>

      <nav className="flex flex-1 flex-col justify-center gap-1 px-4 py-8 sm:px-6 md:px-10">
        {MENU_LINKS.map((l, i) => (
          <motion.div
            key={l.href}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: EASE }}
            className="group flex items-baseline gap-3 border-b border-white/10 py-3 first:pt-0 sm:gap-6"
          >
            <span className="shrink-0 font-stencil text-xs text-white/30 transition-colors group-hover:text-accent sm:text-sm">
              0{i + 1}
            </span>
            <Link href={l.href} onClick={onClose} className="min-w-0 flex-1">
              <RollingText className="font-stencil text-2xl uppercase leading-tight tracking-wide transition-colors group-hover:text-accent sm:text-5xl lg:text-6xl">
                {l.label}
              </RollingText>
            </Link>
          </motion.div>
        ))}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col gap-4 border-t border-white/10 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8 md:px-10"
      >
        <div className="flex gap-6 text-[11px] font-semibold uppercase tracking-[3px] text-white/50">
          <Link href="/privacy" onClick={onClose} className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" onClick={onClose} className="hover:text-white">
            Terms &amp; Conditions
          </Link>
        </div>
        <a
          href="mailto:contact@xstaticfit.com"
          className="text-[11px] font-semibold uppercase tracking-[3px] text-white/50 hover:text-white"
        >
          contact@xstaticfit.com
        </a>
      </motion.div>
    </motion.div>
  );
}
