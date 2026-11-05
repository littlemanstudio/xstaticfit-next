"use client";

import type { AdminOrder } from "@/lib/adminOrders";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const isShipped = (o: AdminOrder) => Boolean(o.shippedAt);

export function money(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

export function fmtDate(ms: number) {
  const d = new Date(ms);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today at ${time}`;
  if (d.toDateString() === y.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${time}`;
}

export function PaymentPill() {
  return (
    <Badge variant="secondary" className="gap-1.5 bg-white/10 px-2.5 font-medium text-white/75 hover:bg-white/10">
      <span className="h-2 w-2 rounded-full bg-white/60" />
      Paid
    </Badge>
  );
}

export function FulfillmentPill({ shipped }: { shipped: boolean }) {
  return shipped ? (
    <Badge className="gap-1.5 bg-accent/15 px-2.5 font-medium text-accent hover:bg-accent/15">
      <span className="h-2 w-2 rounded-full bg-accent" />
      Shipped
    </Badge>
  ) : (
    <Badge className="gap-1.5 bg-amber-400/15 px-2.5 font-medium text-amber-300 hover:bg-amber-400/15">
      <span className="h-2 w-2 rounded-full border-[1.5px] border-amber-300" />
      Unfulfilled
    </Badge>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 font-stencil text-[11px] tracking-wider text-white/80",
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}

/** Days to look back. 0 means all time. */
export type Range = 7 | 30 | 90 | 365 | 0;
const DAY = 86400_000;

export type Metric = {
  value: number;
  changePct: number | null;
  chart: { name: string; value: number }[];
};

/** Metric over the last `range` days vs the `range` days before, plus 7 trend buckets for the bar chart. */
export function metric(orders: AdminOrder[], rangeIn: Range, pick: (o: AdminOrder) => number, mode: "sum" | "avg" = "sum"): Metric {
  const now = Date.now();
  const first = orders.reduce((m, o) => Math.min(m, o.created), now);
  // All time: look back to the first order (at least a week) and there is nothing earlier to compare with.
  const range = rangeIn === 0 ? Math.max(7, Math.ceil((now - first) / DAY) + 1) : rangeIn;
  const inWin = (o: AdminOrder, from: number, to: number) => o.created >= from && o.created < to;
  const agg = (list: AdminOrder[]) => {
    const s = list.reduce((n, o) => n + pick(o), 0);
    return mode === "avg" ? (list.length ? s / list.length : 0) : s;
  };
  const cur = orders.filter((o) => inWin(o, now - range * DAY, now + 1));
  const prev = orders.filter((o) => inWin(o, now - 2 * range * DAY, now - range * DAY));
  const value = agg(cur);
  const pv = agg(prev);
  const changePct = rangeIn !== 0 && pv > 0 ? ((value - pv) / pv) * 100 : null;

  const bucket = (range * DAY) / 7;
  const raw: number[] = [];
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const from = now - range * DAY + i * bucket;
    const slice = orders.filter((o) => inWin(o, from, from + bucket));
    raw.push(agg(slice));
    const d = new Date(from + bucket - 1);
    names.push(range > 60 ? `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}` : String(d.getDate()));
  }
  const max = Math.max(...raw, 1);
  return {
    value,
    changePct,
    chart: raw.map((v, i) => ({ name: names[i], value: Math.max(6, Math.round((v / max) * 100)) })),
  };
}

export function ChangeText({ pct, range }: { pct: number | null; range: Range }) {
  if (pct === null) return <>{range === 0 ? "All time" : `Last ${range === 365 ? "year" : `${range} days`}`}</>;
  const up = pct >= 0;
  return (
    <>
      <span className={cn("font-semibold", up ? "text-accent" : "text-red-400")}>
        {up ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}%
      </span>{" "}
      vs previous {range === 365 ? "year" : `${range} days`}
    </>
  );
}
