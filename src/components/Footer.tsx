import Link from "next/link";
import Image from "next/image";
import Newsletter from "./Newsletter";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-4 md:px-10">
        <div>
          <span className="font-stencil text-lg tracking-[0.15em]">XSTATIC FIT</span>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/70">
          <Link href="/shop" className="hover:text-accent">Shop</Link>
          <Link href="/guarantee" className="hover:text-accent">Guarantee</Link>
          <Link href="/shipping" className="hover:text-accent">Shipping & Returns</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
        </div>

        <div>
          <p className="mb-3 font-stencil text-sm uppercase tracking-wide">Join the Xstatic Fit club</p>
          <p className="mb-4 text-sm italic text-white/70">
            &ldquo;We believe anyone can achieve greatness&rdquo;
          </p>
          <p className="mb-4 text-sm text-white/60">
            We want to inspire people to be the best version of themselves. Achieve greatness, and be
            better than ever before.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com/xstaticfit" target="_blank" rel="noreferrer">
              <Image src="/images/ig.svg" alt="Instagram" width={20} height={20} />
            </a>
            <a href="https://facebook.com/xstaticfit" target="_blank" rel="noreferrer">
              <Image src="/images/fb.svg" alt="Facebook" width={20} height={20} />
            </a>
            <a href="https://youtube.com/xstaticfit" target="_blank" rel="noreferrer">
              <Image src="/images/yt.svg" alt="YouTube" width={20} height={20} />
            </a>
          </div>
        </div>

        <Newsletter cta="Subscribe" />
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/40 md:px-10">
        Copyright © All Rights Reserved
      </div>
    </footer>
  );
}
