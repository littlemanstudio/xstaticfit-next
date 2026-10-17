"use client";

import { META_ENABLED } from "@/lib/meta/config";
import { resetConsent } from "@/lib/meta/consent";
import { revokePixelConsent } from "@/lib/meta/pixel";

/** Footer link that reopens the cookie banner. Hidden when the pixel is not configured. */
export default function CookieChoicesLink() {
  if (!META_ENABLED) return null;
  return (
    <button
      type="button"
      onClick={() => {
        revokePixelConsent();
        resetConsent();
      }}
      className="hover:text-white/70"
    >
      Cookie Choices
    </button>
  );
}
