export type Carrier = "usps" | "ups" | "fedex" | "other";
export type Lang = "en" | "es";

export const CARRIER_NAME: Record<Carrier, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  other: "",
};

export function normalizeTracking(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function detectCarrier(tracking: string): Carrier {
  if (/^1Z[0-9A-Z]{16}$/.test(tracking)) return "ups";
  if (/^9[1-5]\d{18,28}$/.test(tracking) || /^[A-Z]{2}\d{9}US$/.test(tracking)) return "usps";
  if (/^(\d{12}|\d{15})$/.test(tracking)) return "fedex";
  return "other";
}

export function trackingUrl(tracking: string, carrier: Carrier): string | null {
  const t = encodeURIComponent(tracking);
  if (carrier === "usps") return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${t}`;
  if (carrier === "ups") return `https://www.ups.com/track?tracknum=${t}`;
  if (carrier === "fedex") return `https://www.fedex.com/fedextrack/?trknbr=${t}`;
  return null;
}

/** 9505510547326286985309 -> "9505 5105 4732 6286 9853 09" for readability. */
export function formatTracking(tracking: string): string {
  if (/^\d{16,}$/.test(tracking)) return tracking.replace(/(\d{4})(?=\d)/g, "$1 ");
  return tracking;
}

export type TrackingEntry = {
  number: string;
  display: string;
  carrier: Carrier;
  url: string | null;
};

export function buildTrackingEntry(raw: string): TrackingEntry | null {
  const number = normalizeTracking(raw);
  if (number.length < 8 || number.length > 40 || !/^[0-9A-Z]+$/.test(number)) return null;
  const carrier = detectCarrier(number);
  return { number, display: formatTracking(number), carrier, url: trackingUrl(number, carrier) };
}

/** One tracking number per line (numbers may contain spaces). Commas also split. */
export function parseTrackingInput(input: string): { entries: TrackingEntry[]; invalid: string[] } {
  const parts = input
    .split(/[\n,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const entries: TrackingEntry[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const entry = buildTrackingEntry(part);
    if (!entry) {
      invalid.push(part);
      continue;
    }
    if (seen.has(entry.number)) continue;
    seen.add(entry.number);
    entries.push(entry);
  }
  return { entries, invalid };
}

/** Puerto Rico gets Spanish, everything else English. */
export function pickLanguage(country: string | null | undefined): Lang {
  return country?.toUpperCase() === "PR" ? "es" : "en";
}
