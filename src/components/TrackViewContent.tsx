"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/meta/pixel";

/** Fires ViewContent once per product page view. Renders nothing. */
export default function TrackViewContent({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (fired.current === slug) return;
    fired.current = slug;
    trackEvent(
      "ViewContent",
      { content_ids: [slug], content_name: name, value: price, contents: [{ id: slug, quantity: 1 }] },
      [{ id: slug, quantity: 1 }]
    );
  }, [slug, name, price]);

  return null;
}
