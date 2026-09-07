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
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Xstatic Fit" width={36} height={36} className="invert" />
          <span className="font-stencil text-lg tracking-[0.15em]">XSTATIC FIT</span>
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-stencil uppercase tracking-[0.15em] md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-accent transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setMenuOpen(true)}
            className="hidden text-xs font-stencil uppercase tracking-[0.15em] hover:text-accent md:block"
          >
            Menu
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-xs font-stencil uppercase tracking-[0.15em] md:hidden"
          >
            Menu
          </button>
          <button onClick={cart.open} className="relative flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">
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
