"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { AbandonedCheckout, AdminOrder } from "@/lib/adminOrders";
import type { StockRow } from "@/lib/inventory";
import { PRODUCTS } from "@/lib/products";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, fmtDate, isShipped, money } from "./adminUi";

function Head({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-stencil text-3xl uppercase tracking-wide">{title}</h1>
      <div className="text-sm text-white/45">{right}</div>
    </div>
  );
}

const panel = "overflow-hidden rounded-xl border border-white/10 bg-[#121212]";

export function ProductsView({ orders }: { orders: AdminOrder[] }) {
  const [stock, setStock] = useState<StockRow[]>([]);
  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStock(d.rows))
      .catch(() => {});
  }, []);
  const sold = useMemo(() => {
    const m: Record<string, { units: number; revenue: number }> = {};
    for (const o of orders) for (const it of o.items) {
      const e = (m[it.name] ??= { units: 0, revenue: 0 });
      e.units += it.qty;
      e.revenue += Number(it.total);
    }
    return m;
  }, [orders]);

  return (
    <>
      <Head title="Products" right={`${PRODUCTS.length} products`} />
      <div className={panel}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 w-16" />
              <TableHead className="h-11">Product</TableHead>
              <TableHead className="hidden h-11 sm:table-cell">Price</TableHead>
              <TableHead className="h-11">In stock</TableHead>
              <TableHead className="hidden h-11 md:table-cell">Units sold</TableHead>
              <TableHead className="hidden h-11 text-right md:table-cell">Revenue</TableHead>
              <TableHead className="h-11 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {PRODUCTS.map((p) => {
              const s = stock.find((x) => x.slug === p.slug);
              const x = sold[p.name];
              return (
                <TableRow key={p.slug}>
                  <TableCell className="py-3">
                    <span className="relative block h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                      <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs capitalize text-white/45">{p.category}</span>
                  </TableCell>
                  <TableCell className="hidden py-3 sm:table-cell">
                    {money(p.price)}
                    {p.compareAtPrice && <span className="ml-2 text-xs text-white/35 line-through">{money(p.compareAtPrice)}</span>}
                  </TableCell>
                  <TableCell className="py-3">{s ? s.onHand : "·"}</TableCell>
                  <TableCell className="hidden py-3 text-white/70 md:table-cell">{x?.units ?? 0}</TableCell>
                  <TableCell className="hidden py-3 text-right md:table-cell">{money(x?.revenue ?? 0)}</TableCell>
                  <TableCell className="py-3">
                    <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${p.name} on the store`} className="grid h-9 w-9 place-items-center text-white/45 hover:text-white">
                      <ExternalLink size={15} />
                    </a>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-white/35">Product details and prices are edited in the store code. Stock is edited in Inventory.</p>
    </>
  );
}

export function AbandonedView() {
  const [rows, setRows] = useState<AbandonedCheckout[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/admin/abandoned")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) return setError(d.error ?? "Could not load");
        setRows(d.checkouts);
      })
      .catch(() => setError("Could not reach the server"));
  }, []);
  const withEmail = rows?.filter((r) => r.email).length ?? 0;
  const potential = rows?.reduce((n, r) => n + Number(r.total), 0) ?? 0;

  return (
    <>
      <Head title="Abandoned checkouts" right={rows ? `${rows.length} expired · ${withEmail} with an email · ${money(potential)} left on the table` : undefined} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!rows && !error && <p className="text-sm text-white/50">Loading…</p>}
      {rows && (
        <div className={panel}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11">Checkout</TableHead>
                <TableHead className="h-11">Date</TableHead>
                <TableHead className="h-11">Customer</TableHead>
                <TableHead className="hidden h-11 md:table-cell">Items</TableHead>
                <TableHead className="h-11 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="py-3 font-stencil tracking-wide">{r.number}</TableCell>
                  <TableCell className="py-3 text-white/60">{fmtDate(r.created)}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name ?? r.email ?? "?"} />
                      <span className="min-w-0">
                        <span className="block truncate">{r.name ?? (r.email ? "Email only" : "Left before entering an email")}</span>
                        {r.email && <a href={`mailto:${r.email}`} className="block truncate text-xs text-accent hover:underline">{r.email}</a>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 text-white/60 md:table-cell">{r.items.map((i) => `${i.name}${i.qty > 1 ? ` x${i.qty}` : ""}`).join(", ")}</TableCell>
                  <TableCell className="py-3 text-right font-medium">{money(Number(r.total), r.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && <p className="px-4 py-12 text-center text-sm text-white/45">No abandoned checkouts.</p>}
        </div>
      )}
      <p className="mt-3 text-xs text-white/35">These are Stripe checkouts that expired without payment. Recovery emails belong in Klaviyo (the abandoned checkout flow is already live).</p>
    </>
  );
}

function Bars({ data, height = 140 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group relative flex h-full flex-1 items-end" title={`${d.label}: ${d.value}`}>
          <div className={d.value ? "w-full rounded-t bg-accent/80 transition group-hover:bg-accent" : "w-full rounded-t bg-white/10"} style={{ height: `${Math.max(3, (d.value / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsView({ orders }: { orders: AdminOrder[] }) {
  const DAYS = 30;
  const now = new Date();
  const days = useMemo(() => {
    const out: { label: string; value: number; orders: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const next = d.getTime() + 86400_000;
      const list = orders.filter((o) => o.created >= d.getTime() && o.created < next);
      out.push({ label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: list.reduce((n, o) => n + Number(o.total), 0), orders: list.length });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const total = orders.reduce((n, o) => n + Number(o.total), 0);
  const customers = new Map<string, number>();
  for (const o of orders) customers.set((o.email ?? o.name).toLowerCase(), (customers.get((o.email ?? o.name).toLowerCase()) ?? 0) + 1);
  const repeat = [...customers.values()].filter((n) => n > 1).length;
  const shippedOrders = orders.filter((o) => isShipped(o));
  const avgShipDays = shippedOrders.length ? shippedOrders.reduce((n, o) => n + (new Date(o.shippedAt!).getTime() - o.created) / 86400_000, 0) / shippedOrders.length : null;

  const byCountry = (() => {
    const m: Record<string, { orders: number; revenue: number }> = {};
    for (const o of orders) {
      const c = o.country ?? "Unknown";
      const e = (m[c] ??= { orders: 0, revenue: 0 });
      e.orders += 1;
      e.revenue += Number(o.total);
    }
    return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue);
  })();

  const byProduct = (() => {
    const m: Record<string, { units: number; revenue: number }> = {};
    for (const o of orders) for (const it of o.items) {
      const e = (m[it.name] ??= { units: 0, revenue: 0 });
      e.units += it.qty;
      e.revenue += Number(it.total);
    }
    return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue);
  })();

  const kpi = (label: string, value: string, sub?: string) => (
    <div className="rounded-xl border border-white/10 bg-[#121212] p-4">
      <p className="text-sm text-white/55">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-white/45">{sub}</p>}
    </div>
  );

  return (
    <>
      <Head title="Analytics" right="All paid orders loaded from Stripe" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpi("Total revenue", money(total), `${orders.length} orders`)}
        {kpi("Avg order value", money(orders.length ? total / orders.length : 0))}
        {kpi("Repeat customers", customers.size ? `${Math.round((repeat / customers.size) * 100)}%` : "0%", `${repeat} of ${customers.size}`)}
        {kpi("Avg time to ship", avgShipDays === null ? "·" : `${avgShipDays.toFixed(1)} days`, `${shippedOrders.length} shipped`)}
      </div>

      <section className={`${panel} mt-4 p-4`}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-stencil text-sm uppercase tracking-[0.2em] text-white/60">Revenue, last 30 days</h2>
          <span className="text-sm text-white/45">{money(days.reduce((n, d) => n + d.value, 0))}</span>
        </div>
        <Bars data={days.map((d) => ({ label: d.label, value: Math.round(d.value) }))} height={160} />
        <div className="mt-2 flex justify-between text-xs text-white/35"><span>{days[0].label}</span><span>{days[days.length - 1].label}</span></div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={`${panel} p-4`}>
          <h2 className="mb-3 font-stencil text-sm uppercase tracking-[0.2em] text-white/60">Top products</h2>
          <ul className="space-y-3">
            {byProduct.map(([name, v]) => (
              <li key={name}>
                <div className="flex justify-between text-sm"><span className="truncate pr-3">{name}</span><span className="shrink-0 text-white/70">{v.units} units · {money(v.revenue)}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${(v.revenue / (byProduct[0]?.[1].revenue || 1)) * 100}%` }} /></div>
              </li>
            ))}
            {byProduct.length === 0 && <li className="text-sm text-white/45">No sales yet.</li>}
          </ul>
        </section>
        <section className={`${panel} p-4`}>
          <h2 className="mb-3 font-stencil text-sm uppercase tracking-[0.2em] text-white/60">Where orders ship</h2>
          <ul className="space-y-3">
            {byCountry.map(([c, v]) => (
              <li key={c}>
                <div className="flex justify-between text-sm"><span>{c === "PR" ? "Puerto Rico" : c === "US" ? "United States" : c === "CA" ? "Canada" : c}</span><span className="text-white/70">{v.orders} orders · {money(v.revenue)}</span></div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${(v.revenue / (byCountry[0]?.[1].revenue || 1)) * 100}%` }} /></div>
              </li>
            ))}
            {byCountry.length === 0 && <li className="text-sm text-white/45">No sales yet.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
