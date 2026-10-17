"use client";

import { META_CURRENCY, META_PIXEL_ID, type RelayEventName } from "./config";
import { trackingAllowed } from "./consent";

// Browser side of Meta tracking. Every call is a silent no-op when the pixel id is
// missing or the visitor declined. Each event carries an event_id; the same id is
// sent to our Conversions API relay (or used by the Stripe webhook for Purchase) so
// Meta deduplicates the browser and server copies.

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** sessionStorage key: checkout response stored for the success page Purchase event. */
export const PENDING_PURCHASE_KEY = "xsf-pending-purchase";

let initialized = false;

/**
 * Creates the standard fbq command queue (same shape as Meta's base code) without
 * loading anything. fbevents.js itself is loaded by <MetaPixel /> via next/script and
 * drains this queue when it arrives.
 */
function ensureFbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  if (!window.fbq) {
    const n = function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    } as Fbq;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
    if (!window._fbq) window._fbq = n;
  }
  if (!initialized) {
    window.fbq("init", META_PIXEL_ID);
    initialized = true;
  }
  return window.fbq;
}

export function newEventId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `${prefix}.${rand}`;
}

export type ContentItem = { id: string; quantity: number };

export type TrackParams = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: "product";
  contents?: ContentItem[];
  num_items?: number;
};

function fire(name: string, params: TrackParams | undefined, eventId: string) {
  const fbq = ensureFbq();
  if (!fbq) return;
  if (params) fbq("track", name, params, { eventID: eventId });
  else fbq("track", name, {}, { eventID: eventId });
}

/** PageView, browser only. */
export function trackPageView() {
  if (!trackingAllowed()) return;
  fire("PageView", undefined, newEventId("pv"));
}

/**
 * Standard e-commerce events. Fires the browser pixel and forwards the same
 * event_id to /api/meta/event so the server sends the Conversions API copy.
 */
export function trackEvent(
  name: RelayEventName,
  params: TrackParams,
  items: ContentItem[]
): string | null {
  if (!trackingAllowed()) return null;
  const eventId = newEventId(name.toLowerCase());
  fire(name, { currency: META_CURRENCY, content_type: "product", ...params }, eventId);
  try {
    void fetch("/api/meta/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_name: name,
        event_id: eventId,
        event_source_url: window.location.href,
        items,
      }),
    }).catch(() => {});
  } catch {
    // Never let tracking break the page.
  }
  return eventId;
}

/** Purchase from the success page. The Stripe webhook sends the server copy with the same id. */
export function trackPurchase(eventId: string, params: TrackParams) {
  if (!trackingAllowed()) return;
  fire("Purchase", { currency: META_CURRENCY, content_type: "product", ...params }, eventId);
}

/** Called when a visitor declines after the pixel was already running. */
export function revokePixelConsent() {
  if (typeof window !== "undefined" && window.fbq) window.fbq("consent", "revoke");
}

export function grantPixelConsent() {
  if (typeof window !== "undefined" && window.fbq) window.fbq("consent", "grant");
}
