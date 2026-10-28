import type { NextRequest } from "next/server";

// Small in-memory fixed-window limiter. On Vercel each warm serverless instance keeps its own
// counters, so this only blunts bursts from one client. Real protection needs a Vercel Firewall
// rate-limit rule on /api/* (dashboard setting, see AUDIT_REPORT.md).
const buckets = new Map<string, { count: number; reset: number }>();

export function clientKey(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown").trim();
}

/** Returns true when the caller is over the limit. */
export function rateLimited(request: NextRequest, name: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${name}:${clientKey(request)}`;
  const b = buckets.get(key);
  if (!b || b.reset <= now) {
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    }
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > max;
}
