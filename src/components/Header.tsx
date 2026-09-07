"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart, useHasHydrated } from "@/store/cart";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const cart = useCart();
  const hydrated = useHasHydrated();
  const count = hydrated ? cart.count() : 0;

  return (
    <header className="sticky top-0 z-40 bg-ink text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Xstatic Fit" width={32} height={32} className="invert" />
            <span className="font-stencil text-lg tracking-[0.1em]">XSTATIC FIT</span>
          </Link>
          <span className="hidden h-px w-6 bg-white/30 md:block" />

          <nav className="hidden items-center text-[11px] font-semibold uppercase tracking-[4px] md:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="ml-8 hover:text-accent transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[4px] hover:text-accent"
          >
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M0 1h16M0 6h16M0 11h16" />
            </svg>
            Menu
          </button>
          <button onClick={cart.open} className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[4px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            Cart
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold normal-case tracking-normal text-ink">
              {count}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink text-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <span className="font-stencil text-lg tracking-[0.15em]">XSTATIC FIT</span>
        <button onClick={onClose} className="text-xs font-stencil uppercase tracking-[0.15em] hover:text-accent">
          Close
        </button>
      </div>
      <nav className="flex flex-col gap-6 px-6 pt-16 md:px-10">
        {[...LINKS, { href: "/guarantee", label: "Guarantee" }, { href: "/contact", label: "Contact" }].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="font-stencil text-4xl uppercase tracking-wide hover:text-accent md:text-6xl"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
