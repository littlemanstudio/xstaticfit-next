"use client";

import { useSyncExternalStore } from "react";

// Visitor language for the ad funnel. The store itself is English; the ad landing pages
// under /go (Spanish) and /en/go (English) save the visitor's language here so the cart,
// the cookie banner, Stripe Checkout and the thank-you page speak the same language.
export type Lang = "es" | "en";

const KEY = "xsf-lang";
const EVENT = "xsf-lang-change";

export function setLang(lang: Lang) {
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // Storage blocked: the language only lasts for this page view.
  }
  window.dispatchEvent(new Event(EVENT));
}

function read(): Lang {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "es" || v === "en") return v;
  } catch {
    // Storage blocked: fall through to English.
  }
  return "en";
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, read, () => "en");
}
