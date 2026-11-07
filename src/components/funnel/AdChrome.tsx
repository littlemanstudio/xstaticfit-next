"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import MetaPixel from "@/components/MetaPixel";
import { UI } from "@/lib/funnel";
import { useCart, useHasHydrated } from "@/store/cart";

/** True for the ad landing pages: /go/<offer> and /en/go/<offer>. */
export function isAdLanding(pathname: string | null) {
  return !!pathname && (pathname.startsWith("/go/") || pathname.startsWith("/en/go/"));
}

/**
 * Shell for ad traffic: logo only (not a link, nothing to wander off to), a cart button that
 * shows up only when the cart has something in it, and a short footer with the policy links.
 */
export default function AdChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const lang = pathname.startsWith("/en/") ? "en" : "es";
  const ui = UI[lang];
  const cart = useCart();
  const hydrated = useHasHydrated();
  const count = hydrated ? cart.count() : 0;
  // The same offer in the other language: /go/kit <-> /en/go/kit.
  const otherLang = lang === "es" ? "en" : "es";
  const otherHref = lang === "es" ? pathname.replace(/^\/go\//, "/en/go/") : pathname.replace(/^\/en\/go\//, "/go/");

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2" aria-label={ui.homeAria}>
            <Image src="/images/logo-white.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7" priority />
            <span className="font-stencil text-base tracking-[0.1em]">XSTATIC FIT</span>
          </span>
          <div className="flex items-center gap-1">
          <Link
            href={otherHref}
            hrefLang={otherLang}
            aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
            className="flex min-h-11 min-w-11 items-center justify-center px-2 text-xs font-semibold uppercase tracking-[2px] text-white/70 hover:text-white"
          >
            {otherLang === "es" ? "Español" : "English"}
          </Link>
          {count > 0 && (
            <button
              onClick={cart.open}
              aria-label={ui.cartAria}
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[3px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M6 6h15l-1.5 9h-12L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-ink">{count}</span>
            </button>
          )}
          </div>
        </div>
      </header>
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 px-4 py-8 pb-24 text-center sm:px-6 md:pb-8">
        <ul className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
          {ui.footer.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-white/40">© Xstatic Fit</p>
      </footer>
      <MetaPixel />
    </>
  );
}
