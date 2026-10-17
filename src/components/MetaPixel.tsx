"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { META_CONSENT_MODE, META_ENABLED } from "@/lib/meta/config";
import { setConsent, useConsent } from "@/lib/meta/consent";
import { grantPixelConsent, revokePixelConsent, trackPageView } from "@/lib/meta/pixel";

/**
 * Loads Meta's fbevents.js (only when NEXT_PUBLIC_META_PIXEL_ID is set and the
 * visitor's choice allows it), fires PageView on every App Router pathname change,
 * and shows the cookie choice banner.
 */
export default function MetaPixel() {
  if (!META_ENABLED) return null;
  return <MetaPixelInner />;
}

function MetaPixelInner() {
  const consent = useConsent();
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  const allowed =
    consent === "granted" || (consent === null && META_CONSENT_MODE === "opt-out");

  useEffect(() => {
    if (!allowed) return;
    // Guard against double effects (React dev mode) and re-renders on the same route.
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    trackPageView();
  }, [allowed, pathname]);

  return (
    <>
      {allowed && (
        <Script
          id="meta-pixel"
          src="https://connect.facebook.net/en_US/fbevents.js"
          strategy="afterInteractive"
        />
      )}
      {consent === null && <ConsentBanner />}
    </>
  );
}

function ConsentBanner() {
  return (
    <div
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[45] border-t border-white/10 bg-ink text-white"
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-10">
        <p className="text-xs leading-relaxed text-white/70 sm:max-w-2xl">
          We use cookies, including the Meta Pixel, to measure our ads and improve the site. See
          our{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => {
              setConsent("denied");
              revokePixelConsent();
            }}
            className="min-h-11 flex-1 rounded-[3px] border border-white/30 px-6 font-stencil text-xs uppercase tracking-[0.2em] transition hover:border-white sm:flex-none"
          >
            Decline
          </button>
          <button
            onClick={() => {
              setConsent("granted");
              grantPixelConsent();
            }}
            className="min-h-11 flex-1 rounded-[3px] bg-accent px-6 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 sm:flex-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
