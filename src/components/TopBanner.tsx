"use client";

import { useEffect, useRef } from "react";

export default function TopBanner({ text = "NOW RECEIVING ORDERS!" }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Publish the banner's real rendered height as a CSS var, same pattern as
  // Header's --header-h, so the hero can size itself to exactly fill the
  // rest of the first viewport instead of overflowing past the fold.
  useEffect(() => {
    function publishHeight() {
      if (ref.current) {
        document.documentElement.style.setProperty("--banner-h", `${ref.current.offsetHeight}px`);
      }
    }
    publishHeight();
    window.addEventListener("resize", publishHeight);
    return () => window.removeEventListener("resize", publishHeight);
  }, []);

  return (
    <div
      ref={ref}
      className="bg-accent text-ink text-center text-[11px] font-stencil font-bold uppercase tracking-[0.2em] py-2"
    >
      {text}
    </div>
  );
}
