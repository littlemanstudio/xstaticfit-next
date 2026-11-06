"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { setLang, type Lang } from "@/lib/lang";

/** Saves the visitor's language and the ad tags from the URL. Renders nothing. */
export default function FunnelEffects({ lang }: { lang: Lang }) {
  useEffect(() => {
    setLang(lang);
    document.documentElement.lang = lang;
    captureAttribution();
  }, [lang]);
  return null;
}
