import Link from "next/link";
import Image from "next/image";
import Newsletter from "./Newsletter";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/guarantee", label: "Guarantee" },
  { href: "/shipping", label: "Shipping & Returns" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:px-10">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-10 md:flex-row">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-stencil text-lg tracking-[0.1em]">XSTATIC FIT</span>
            <span className="hidden h-px w-6 bg-white/30 sm:block" />
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] font-semibold uppercase tracking-[3px] text-white/70 hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[3px] text-white/70">
              Join the Xstatic Fit club
            </span>
            <div className="flex gap-4">
              <a href="https://instagram.com/xstaticfit" target="_blank" rel="noreferrer">
                <Image src="/images/ig.svg" alt="Instagram" width={18} height={18} />
              </a>
              <a href="https://facebook.com/xstaticfit" target="_blank" rel="noreferrer">
                <Image src="/images/fb.svg" alt="Facebook" width={18} height={18} />
              </a>
              <a href="https://youtube.com/xstaticfit" target="_blank" rel="noreferrer">
                <Image src="/images/yt.svg" alt="YouTube" width={18} height={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 py-10 md:grid-cols-2">
          <div>
            <p className="font-stencil text-2xl uppercase leading-snug">
              &ldquo;We believe anyone can achieve greatness&rdquo;
            </p>
            <p className="mt-4 max-w-md text-sm text-white/60">
              We want to inspire people to be the best version of themselves. Achieve greatness,
              and be better than ever before.
            </p>
          </div>
          <div className="md:justify-self-end md:text-right">
            <p className="mb-3 text-sm text-white/70">Sign up to our newsletter.</p>
            <div className="md:ml-auto md:max-w-sm">
              <Newsletter cta="Subscribe" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-6 text-xs text-white/40 sm:flex-row md:px-10">
        <span>Copyright © All Rights Reserved</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-white/70">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/70">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
