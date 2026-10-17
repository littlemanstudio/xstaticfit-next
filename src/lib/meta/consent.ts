"use client";

import { useSyncExternalStore } from "react";
import { META_CONSENT_MODE, META_ENABLED } from "./config";

// Visitor tracking choice, stored in localStorage on this device only.
export type ConsentChoice = "granted" | "denied" | null;

const KEY = "xsf-tracking-consent";
const EVENT = "xsf-consent-change";

function hasGpc(): boolean {
  // Global Privacy Control: a browser-level "do not sell or share" signal.
  return typeof navigator !== "undefined" && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function readConsent(): ConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "granted" || v === "denied") return v;
  } catch {
    // Storage blocked: fall through to defaults.
  }
  return hasGpc() ? "denied" : null;
}

export function setConsent(choice: "granted" | "denied") {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  memo = choice;
  window.dispatchEvent(new Event(EVENT));
}

/** Clears the stored choice so the banner shows again ("Cookie choices" link). */
export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  memo = undefined;
  window.dispatchEvent(new Event(EVENT));
}

/** True when tracking may run right now for this visitor. */
export function trackingAllowed(): boolean {
  if (!META_ENABLED || typeof window === "undefined") return false;
  const c = readConsent();
  if (c === "denied") return false;
  if (c === "granted") return true;
  return META_CONSENT_MODE === "opt-out";
}

let memo: ConsentChoice | undefined;

function subscribe(cb: () => void) {
  const handler = () => {
    memo = undefined;
    cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): ConsentChoice | "unknown" {
  if (memo === undefined) memo = readConsent();
  return memo;
}

/** React hook. Returns "unknown" during server render and the first hydration pass. */
export function useConsent(): ConsentChoice | "unknown" {
  return useSyncExternalStore(subscribe, getSnapshot, () => "unknown");
}
