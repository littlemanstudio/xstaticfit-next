"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Download, ExternalLink, Inbox, LayoutGrid, LineChart, Menu, Package, RefreshCw, Search, ShoppingCart, Tag, Users, X } from "lucide-react";
import type { AdminOrder } from "@/lib/adminOrders";
import { StatsCard } from "@/components/ui/stats-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsCountBadge } from "@/components/ui/tabs-count-badge";
import OrderPanel from "./OrderPanel";
import InventoryView from "./InventoryView";
import { AbandonedView, AnalyticsView, ProductsView } from "./ExtraViews";
import { Avatar, ChangeText, FulfillmentPill, PaymentPill, fmtDate, isShipped, metric, money, type Range } from "./adminUi";

type Phase = "loading" | "login" | "ready" | "error";
type View = "overview" | "orders" | "inventory" | "products" | "customers" | "abandoned" | "analytics";
type Filter = "all" | "unfulfilled" | "shipped" | "pr" | "intl";

const NAV: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid size={18} /> },
  { id: "orders", label: "Orders", icon: <Inbox size={18} /> },
  { id: "inventory", label: "Inventory", icon: <Package size={18} /> },
  { id: "products", label: "Products", icon: <Tag size={18} /> },
  { id: "customers", label: "Customers", icon: <Users size={18} /> },
  { id: "abandoned", label: "Abandoned checkouts", icon: <ShoppingCart size={18} /> },
  { id: "analytics", label: "Analytics", icon: <LineChart size={18} /> },
];

export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [demo, setDemo] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [view, setView] = useState<View>("orders");
  const [range, setRange] = useState<Range>(30);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) return setPhase("login");
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not load orders");
        return setPhase("error");
      }
      setOrders(data.orders);
      setDemo(Boolean(data.demo));
      setTruncated(Boolean(data.truncated));
      setPhase("ready");
    } catch {
      setMessage("Could not reach the server");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setView("orders");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sorted = useMemo(() => [...orders].sort((a, b) => b.created - a.created), [orders]);
  const toShip = sorted.filter((o) => !isShipped(o)).length;
  const open = sorted.find((o) => o.id === openId) ?? null;

  if (phase === "login") return <LoginScreen onDone={load} />;

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar query={query} setQuery={setQuery} searchRef={searchRef} onSearchFocus={() => setView("orders")} onMenu={() => setMenu(true)} onRefresh={load} />
      <div className="flex min-h-0 flex-1">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-white/10 bg-[#0d0d0d] p-3 lg:flex">
          <NavList view={view} setView={setView} toShip={toShip} />
          <p className="mt-auto px-3 pb-2 text-[11px] leading-relaxed text-white/30">
            Private. Orders come live from Stripe. Nothing here is visible to search engines.
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {demo && (
            <div className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
              Demo data. This is a local preview, no emails are sent and nothing is saved.
            </div>
          )}
          {truncated && (
            <div className="mb-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
              Showing your most recent 1,500 checkouts. Older history is still safe in Stripe.
            </div>
          )}
          {phase === "loading" && <p className="text-sm text-white/50">Loading orders…</p>}
          {phase === "error" && <p className="text-sm text-red-400">{message}</p>}
          {phase === "ready" && (
            <>
              {view === "overview" && (
                <Overview orders={sorted} range={range} setRange={setRange} onOpen={setOpenId} goOrders={() => setView("orders")} />
              )}
              {view === "orders" && <OrdersView orders={sorted} range={range} setRange={setRange} query={query} onOpen={setOpenId} />}
              {view === "inventory" && <InventoryView orders={sorted} />}
              {view === "products" && <ProductsView orders={sorted} />}
              {view === "customers" && <CustomersView orders={sorted} />}
              {view === "abandoned" && <AbandonedView />}
              {view === "analytics" && <AnalyticsView orders={sorted} />}
            </>
          )}
        </main>
      </div>

      <BottomBar view={view} setView={setView} toShip={toShip} onMore={() => setMenu(true)} />

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.nav
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#0d0d0d] p-3 pt-[calc(0.75rem+env(safe-area-inset-top))]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
            >
              <div className="mb-3 flex items-center justify-between px-2 pt-1">
                <span className="font-stencil text-lg uppercase tracking-wide">Xstatic Fit</span>
                <button type="button" aria-label="Close menu" onClick={() => setMenu(false)} className="grid h-11 w-11 place-items-center rounded-full text-white/70">
                  <X size={20} />
                </button>
              </div>
              <NavList view={view} setView={(v) => { setView(v); setMenu(false); }} toShip={toShip} />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <OrderPanel order={open} onClose={() => setOpenId(null)} onShipped={() => { setOpenId(null); void load(); }} />
    </div>
  );
}

function TopBar({
  query, setQuery, searchRef, onSearchFocus, onMenu, onRefresh,
}: {
  query: string;
  setQuery: (q: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onSearchFocus: () => void;
  onMenu: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d0d0d]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
      <button type="button" aria-label="Open menu" onClick={onMenu} className="grid h-11 w-11 place-items-center rounded-md text-white/80 lg:hidden">
        <Menu size={22} />
      </button>
      <Link href="/admin" className="flex items-baseline gap-2">
        <span className="whitespace-nowrap font-stencil text-lg uppercase tracking-wide sm:text-xl">Xstatic Fit</span>
        <span className="hidden rounded bg-accent px-1.5 py-0.5 font-stencil text-[10px] uppercase tracking-[0.2em] text-ink sm:inline">Admin</span>
      </Link>
      <div className="mx-auto flex h-10 w-full max-w-xl items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 focus-within:border-accent/60">
        <Search size={16} className="shrink-0 text-white/45" />
        <input
          ref={searchRef}
          value={query}
          onFocus={onSearchFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, customers, tracking"
          className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35 sm:text-sm"
        />
        <kbd className="hidden rounded border border-white/15 px-1.5 text-[11px] text-white/45 sm:block">⌘ K</kbd>
      </div>
      <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-white/55 hover:text-white md:flex">
        View store <ExternalLink size={13} />
      </a>
      <button type="button" aria-label="Refresh orders" onClick={onRefresh} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/60 active:text-accent">
        <RefreshCw size={18} />
      </button>
      <Avatar name="Allan Rosario" className="hidden h-9 w-9 bg-accent/15 text-accent sm:grid" />
      </div>
    </header>
  );
}

function BottomBar({ view, setView, toShip, onMore }: { view: View; setView: (v: View) => void; toShip: number; onMore: () => void }) {
  const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "Orders", icon: <Inbox size={22} /> },
    { id: "inventory", label: "Stock", icon: <Package size={22} /> },
    { id: "overview", label: "Home", icon: <LayoutGrid size={22} /> },
  ];
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0d0d0d]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {tabs.map((t) => {
          const active = view === t.id;
          return (
            <li key={t.id}>
              <button type="button" onClick={() => setView(t.id)} className={`relative flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-accent" : "text-white/50"}`}>
                {t.icon}
                {t.label}
                {t.id === "orders" && toShip > 0 && (
                  <span className="absolute right-[calc(50%-24px)] top-2 min-w-[18px] rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-[18px] text-ink">{toShip}</span>
                )}
              </button>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={onMore} className="flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] text-white/50">
            <Menu size={22} />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

function NavList({ view, setView, toShip }: { view: View; setView: (v: View) => void; toShip: number }) {
  return (
    <ul className="space-y-1">
      {NAV.map((n) => {
        const active = n.id === view;
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => setView(n.id)}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}
            >
              <span className={active ? "text-accent" : ""}>{n.icon}</span>
              {n.label}
              {n.id === "orders" && toShip > 0 && (
                <span className="ml-auto rounded-full bg-accent px-2 text-xs font-semibold leading-5 text-ink">{toShip}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function RangeSelect({ range, setRange }: { range: Range; setRange: (r: Range) => void }) {
  return (
    <select
      value={range}
      onChange={(e) => setRange(Number(e.target.value) as Range)}
      aria-label="Date range"
      className="h-11 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-white outline-none focus:border-accent/60"
    >
      <option value={7}>7 days</option>
      <option value={30}>30 days</option>
      <option value={90}>90 days</option>
      <option value={365}>1 year</option>
      <option value={0}>All time</option>
    </select>
  );
}

function StatStrip({ orders, range }: { orders: AdminOrder[]; range: Range }) {
  const count = metric(orders, range, () => 1);
  const revenue = metric(orders, range, (o) => Number(o.total));
  const aov = metric(orders, range, (o) => Number(o.total), "avg");
  const unf = metric(orders.filter((o) => !isShipped(o)), range, () => 1);
  const shp = metric(orders.filter(isShipped), range, () => 1);
  const bar = "bg-white/20";
  const hi = "bg-accent";
  const cls = "min-w-[80%] max-w-none snap-start rounded-xl bg-[#121212] sm:min-w-0";
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-5">
      <StatsCard className={cls} title="Orders" currentValue={count.value} description={<ChangeText pct={count.changePct} range={range} />} chartData={count.chart} defaultBarColor={bar} highlightedBarColor={hi} />
      <StatsCard className={cls} title="Revenue" valuePrefix="$" currentValue={revenue.value} description={<ChangeText pct={revenue.changePct} range={range} />} chartData={revenue.chart} defaultBarColor={bar} highlightedBarColor={hi} />
      <StatsCard className={cls} title="Avg order value" valuePrefix="$" currentValue={aov.value} description={<ChangeText pct={aov.changePct} range={range} />} chartData={aov.chart} defaultBarColor={bar} highlightedBarColor={hi} />
      <StatsCard className={cls} title="To ship" currentValue={unf.value} description={<>Waiting for tracking</>} chartData={unf.chart} defaultBarColor={bar} highlightedBarColor="bg-amber-400" />
      <StatsCard className={cls} title="Shipped" currentValue={shp.value} description={<ChangeText pct={shp.changePct} range={range} />} chartData={shp.chart} defaultBarColor={bar} highlightedBarColor={hi} />
    </div>
  );
}

function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-stencil text-3xl uppercase tracking-wide">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function exportCsv(orders: AdminOrder[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["order", "date", "customer", "email", "country", "total", "currency", "status", "tracking"],
    ...orders.map((o) => [o.number, new Date(o.created).toISOString(), o.name, o.email ?? "", o.country ?? "", o.total, o.currency, isShipped(o) ? "shipped" : "unfulfilled", o.tracking ?? ""]),
  ];
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `xstatic-fit-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function OrdersView({ orders, range, setRange, query, onOpen }: { orders: AdminOrder[]; range: Range; setRange: (r: Range) => void; query: string; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const q = query.trim().toLowerCase();
  // The date picker applies to the list as well as the stats. A search looks through all time so old orders stay findable.
  const [now] = useState(() => Date.now());
  const since = range === 0 ? 0 : now - range * 86400_000;
  const inRange = orders.filter((o) => o.created >= since);
  const searched = q
    ? orders.filter((o) => [o.number, o.name, o.email ?? "", o.tracking ?? "", o.country ?? ""].some((v) => v.toLowerCase().includes(q)))
    : inRange;
  const match: Record<Filter, (o: AdminOrder) => boolean> = {
    all: () => true,
    unfulfilled: (o) => !isShipped(o),
    shipped: isShipped,
    pr: (o) => o.country === "PR",
    intl: (o) => o.country !== "PR",
  };
  const shown = searched.filter(match[filter]);
  const tabs = [
    { id: "all" as const, label: "All" },
    { id: "unfulfilled" as const, label: "Unfulfilled" },
    { id: "shipped" as const, label: "Shipped" },
    { id: "pr" as const, label: "Puerto Rico" },
    { id: "intl" as const, label: "Elsewhere" },
  ].map((t) => ({ ...t, count: searched.filter(match[t.id]).length }));

  return (
    <>
      <PageHead title="Orders">
        <RangeSelect range={range} setRange={setRange} />
        <button type="button" onClick={() => exportCsv(shown)} className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm text-white/85 hover:border-white/30">
          <Download size={15} /> Export
        </button>
      </PageHead>
      <StatStrip orders={orders} range={range} />

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
          <TabsCountBadge tabs={tabs} value={filter} onChange={setFilter} />
          {q ? (
            <span className="text-xs text-white/45">{shown.length} result{shown.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo; (all time)</span>
          ) : (
            <span className="text-xs text-white/45">
              {range === 0 ? "All time" : `Last ${range === 365 ? "year" : `${range} days`}`} · {inRange.length} of {orders.length} orders
              {range !== 0 && inRange.length < orders.length && (
                <button type="button" onClick={() => setRange(0)} className="ml-2 text-accent underline underline-offset-2">Show all</button>
              )}
            </span>
          )}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11">Order</TableHead>
                <TableHead className="h-11">Date</TableHead>
                <TableHead className="h-11">Customer</TableHead>
                <TableHead className="h-11 text-right">Total</TableHead>
                <TableHead className="h-11">Payment</TableHead>
                <TableHead className="h-11">Fulfillment</TableHead>
                <TableHead className="h-11">Items</TableHead>
                <TableHead className="h-11">Tracking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((o) => (
                <TableRow key={o.id} onClick={() => onOpen(o.id)} className="cursor-pointer">
                  <TableCell className="py-3 font-stencil text-[15px] tracking-wide">{o.number}</TableCell>
                  <TableCell className="py-3 text-white/60">{fmtDate(o.created)}</TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={o.name} />
                      <span>{o.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium">{money(Number(o.total), o.currency)}</TableCell>
                  <TableCell className="py-3"><PaymentPill /></TableCell>
                  <TableCell className="py-3"><FulfillmentPill shipped={isShipped(o)} /></TableCell>
                  <TableCell className="py-3 text-white/60">{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</TableCell>
                  <TableCell className="max-w-[170px] truncate py-3 font-mono text-xs text-white/45">{o.tracking ?? "·"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul className="divide-y divide-white/10 md:hidden">
          {shown.map((o) => (
            <li key={o.id}>
              <button type="button" onClick={() => onOpen(o.id)} className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-white/5">
                <Avatar name={o.name} className="h-10 w-10" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">{o.name}</span>
                    <span className="shrink-0 font-medium">{money(Number(o.total), o.currency)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-white/45">
                    <span className="truncate">{o.number} · {fmtDate(o.created)}</span>
                    <span className="shrink-0">{o.itemCount} item{o.itemCount === 1 ? "" : "s"}</span>
                  </span>
                  <span className="mt-2 flex gap-2">
                    <PaymentPill />
                    <FulfillmentPill shipped={isShipped(o)} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {shown.length === 0 && <p className="px-4 py-12 text-center text-sm text-white/45">No orders match.</p>}
      </div>
    </>
  );
}

function Overview({ orders, range, setRange, onOpen, goOrders }: { orders: AdminOrder[]; range: Range; setRange: (r: Range) => void; onOpen: (id: string) => void; goOrders: () => void }) {
  const waiting = orders.filter((o) => !isShipped(o));
  return (
    <>
      <PageHead title="Overview">
        <RangeSelect range={range} setRange={setRange} />
      </PageHead>
      <StatStrip orders={orders} range={range} />
      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-white/10 bg-[#121212] lg:col-span-3">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="font-stencil text-sm uppercase tracking-[0.2em] text-white/60">Needs shipping</h2>
            <span className="rounded-full bg-amber-400/15 px-2.5 text-xs font-medium leading-6 text-amber-300">{waiting.length}</span>
          </div>
          <ul className="divide-y divide-white/10">
            {waiting.slice(0, 6).map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onOpen(o.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03]">
                  <Avatar name={o.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.name}</span>
                    <span className="block truncate text-xs text-white/45">{o.number} · {fmtDate(o.created)}</span>
                  </span>
                  <span className="text-sm text-white/80">{money(Number(o.total), o.currency)}</span>
                  <span className="rounded-[3px] bg-accent px-3 py-1.5 font-stencil text-[10px] uppercase tracking-[0.18em] text-ink">Ship</span>
                </button>
              </li>
            ))}
            {waiting.length === 0 && <li className="px-4 py-10 text-center text-sm text-white/45">Everything has shipped.</li>}
          </ul>
        </section>
        <section className="rounded-xl border border-white/10 bg-[#121212] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="font-stencil text-sm uppercase tracking-[0.2em] text-white/60">Latest orders</h2>
            <button type="button" onClick={goOrders} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">All orders</button>
          </div>
          <ul className="divide-y divide-white/10">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onOpen(o.id)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.03]">
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{o.name}</span>
                    <span className="block text-xs text-white/45">{fmtDate(o.created)}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm">{money(Number(o.total), o.currency)}</span>
                    <FulfillmentPill shipped={isShipped(o)} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function CustomersView({ orders }: { orders: AdminOrder[] }) {
  const customers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; country: string | null; orders: number; spent: number; last: number }>();
    for (const o of orders) {
      const key = (o.email ?? o.name).toLowerCase();
      const c = map.get(key) ?? { name: o.name, email: o.email ?? "", country: o.country, orders: 0, spent: 0, last: 0 };
      c.orders += 1;
      c.spent += Number(o.total);
      c.last = Math.max(c.last, o.created);
      map.set(key, c);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  return (
    <>
      <PageHead title="Customers">
        <span className="flex items-center gap-2 text-sm text-white/45"><BarChart3 size={15} /> {customers.length} total</span>
      </PageHead>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11">Customer</TableHead>
              <TableHead className="hidden h-11 sm:table-cell">Country</TableHead>
              <TableHead className="h-11 text-right">Orders</TableHead>
              <TableHead className="h-11 text-right">Spent</TableHead>
              <TableHead className="hidden h-11 text-right md:table-cell">Last order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.email || c.name}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} />
                    <span className="min-w-0">
                      <span className="block truncate">{c.name}</span>
                      <span className="block truncate text-xs text-white/45">{c.email}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden py-3 text-white/60 sm:table-cell">{c.country ?? "·"}</TableCell>
                <TableCell className="py-3 text-right">{c.orders}</TableCell>
                <TableCell className="py-3 text-right font-medium">{money(c.spent)}</TableCell>
                <TableCell className="hidden py-3 text-right text-white/60 md:table-cell">{new Date(c.last).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function LoginScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) return onDone();
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Could not sign in");
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121212] p-7"
      >
        <p className="font-stencil text-xs uppercase tracking-[0.3em] text-accent">Xstatic Fit</p>
        <h1 className="mt-1 font-stencil text-3xl uppercase tracking-wide">Admin</h1>
        <input
          type="password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 h-12 w-full rounded-lg border border-white/15 bg-black/40 px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="mt-3 h-12 w-full rounded-[3px] bg-accent font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </motion.form>
    </div>
  );
}
