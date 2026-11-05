"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3, Download, Search, Upload } from "lucide-react";
import type { AdminOrder } from "@/lib/adminOrders";
import type { StockRow } from "@/lib/inventory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsCountBadge } from "@/components/ui/tabs-count-badge";
import { cn } from "@/lib/utils";

type Tab = "all" | "incoming" | "low" | "out";
type SortKey = "name" | "available" | "onHand";
type ColKey = "unavailable" | "committed" | "available" | "onHand" | "incoming";

const COLS: { key: ColKey; label: string; tip: string }[] = [
  { key: "unavailable", label: "Unavailable", tip: "Units you own but cannot sell right now (damaged, on hold)." },
  { key: "committed", label: "Committed", tip: "Units in paid orders that have not shipped yet." },
  { key: "available", label: "Available", tip: "Units you can sell: on hand minus committed minus unavailable." },
  { key: "onHand", label: "On hand", tip: "Units physically in your stock. Shipping an order takes its units out." },
  { key: "incoming", label: "Incoming", tip: "Units on the way from the factory (not yet counted as on hand)." },
];

export default function InventoryView({ orders }: { orders: AdminOrder[] }) {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [configured, setConfigured] = useState(true);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [cols, setCols] = useState<Record<ColKey, boolean>>({ unavailable: true, committed: true, available: true, onHand: true, incoming: true });
  const [menu, setMenu] = useState<null | "cols" | "sort">(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load stock");
        return setState("error");
      }
      setRows(data.rows);
      setConfigured(Boolean(data.configured));
      setState("ready");
    } catch {
      setError("Could not reach the server");
      setState("error");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const committed = useMemo(() => {
    const out: Record<string, number> = {};
    for (const o of orders) {
      if (o.shippedAt) continue;
      for (const it of o.items) {
        const r = rows.find((x) => x.name === it.name);
        if (r) out[r.slug] = (out[r.slug] ?? 0) + it.qty;
      }
    }
    return out;
  }, [orders, rows]);

  const avail = useCallback((r: StockRow) => r.onHand - (committed[r.slug] ?? 0) - r.unavailable, [committed]);

  async function save(updates: ({ slug: string } & Partial<Pick<StockRow, "onHand" | "unavailable" | "incoming" | "lowAt">>)[]) {
    const before = rows;
    setRows((rs) => rs.map((r) => ({ ...r, ...(updates.find((u) => u.slug === r.slug) ?? {}) })));
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setRows(before);
      setNote(data.error ?? "Could not save");
      return false;
    }
    setRows(data.rows);
    setNote("Saved");
    setTimeout(() => setNote(""), 1400);
    return true;
  }

  const status = (r: StockRow) => {
    const a = avail(r);
    if (a <= 0) return "out" as const;
    if (a <= r.lowAt) return "low" as const;
    return "ok" as const;
  };

  const counts = {
    all: rows.length,
    incoming: rows.filter((r) => r.incoming > 0).length,
    low: rows.filter((r) => status(r) === "low").length,
    out: rows.filter((r) => status(r) === "out").length,
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.filter((r) => (needle ? r.name.toLowerCase().includes(needle) : true));
    if (tab === "incoming") list = list.filter((r) => r.incoming > 0);
    if (tab === "low") list = list.filter((r) => status(r) === "low");
    if (tab === "out") list = list.filter((r) => status(r) === "out");
    const val = (r: StockRow) => (sort.key === "name" ? r.name.toLowerCase() : sort.key === "available" ? avail(r) : r.onHand);
    return [...list].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * sort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, tab, sort, committed]);

  const allPicked = shown.length > 0 && shown.every((r) => picked.has(r.slug));
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(shown.map((r) => r.slug)));
  const toggle = (slug: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });

  function exportCsv(list: StockRow[]) {
    const lines = [["product", "slug", "unavailable", "committed", "available", "on_hand", "incoming", "low_stock_at"], ...list.map((r) => [r.name, r.slug, r.unavailable, committed[r.slug] ?? 0, avail(r), r.onHand, r.incoming, r.lowAt])];
    const blob = new Blob([lines.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `xstatic-fit-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const [head, ...body] = text.split(/\r?\n/).filter(Boolean);
    const cells = (l: string) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    const cols = cells(head).map((c) => c.toLowerCase());
    const idx = (n: string) => cols.indexOf(n);
    const updates = body
      .map((l) => {
        const c = cells(l);
        const slug = c[idx("slug")];
        if (!slug) return null;
        const num = (name: string) => (idx(name) >= 0 && c[idx(name)] !== "" ? Number(c[idx(name)]) : undefined);
        return { slug, onHand: num("on_hand"), unavailable: num("unavailable"), incoming: num("incoming"), lowAt: num("low_stock_at") };
      })
      .filter((u): u is NonNullable<typeof u> => Boolean(u));
    if (!updates.length) return setNote("No rows found. Use the Export file as a template.");
    const ok = await save(updates);
    if (ok) setNote(`Imported ${updates.length} product${updates.length === 1 ? "" : "s"}`);
  }

  const tabs = [
    { id: "all" as const, label: "All", count: counts.all },
    { id: "incoming" as const, label: "Incoming", count: counts.incoming },
    { id: "low" as const, label: "Low stock", count: counts.low },
    { id: "out" as const, label: "Out of stock", count: counts.out },
  ];
  const vis = (k: ColKey) => cols[k];

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-stencil text-3xl uppercase tracking-wide">Inventory</h1>
        <div className="flex items-center gap-2">
          {note && <span className="text-sm text-accent">{note}</span>}
          <button type="button" onClick={() => exportCsv(rows)} className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm text-white/85 hover:border-white/30">
            <Download size={15} /> Export
          </button>
          <button type="button" disabled={!configured} onClick={() => fileRef.current?.click()} className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm text-white/85 hover:border-white/30 disabled:opacity-40">
            <Upload size={15} /> Import
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void importCsv(f); e.target.value = ""; }} />
        </div>
      </div>

      {!configured && state === "ready" && (
        <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Stock counts cannot be saved here yet because the Stripe key is not set on this server.
        </div>
      )}
      {state === "loading" && <p className="text-sm text-white/50">Loading stock…</p>}
      {state === "error" && <p className="text-sm text-red-400">{error}</p>}

      {state === "ready" && (
        <div className="rounded-xl border border-white/10 bg-[#121212]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
            <TabsCountBadge tabs={tabs} value={tab} onChange={setTab} />
            <div className="relative flex items-center gap-1.5">
              {showSearch && (
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter products" className="h-10 w-44 rounded-lg border border-white/15 bg-black/40 px-3 text-base text-white outline-none placeholder:text-white/35 focus:border-accent sm:text-sm" />
              )}
              <IconBtn label="Search products" active={showSearch} onClick={() => { setShowSearch((v) => !v); if (showSearch) setQ(""); }}><Search size={16} /></IconBtn>
              <IconBtn label="Choose columns" active={menu === "cols"} onClick={() => setMenu(menu === "cols" ? null : "cols")}><Columns3 size={16} /></IconBtn>
              <IconBtn label="Sort" active={menu === "sort"} onClick={() => setMenu(menu === "sort" ? null : "sort")}><ArrowUpDown size={16} /></IconBtn>
              {menu && (
                <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-white/15 bg-[#181818] p-2 shadow-2xl">
                  {menu === "cols" &&
                    COLS.map((c) => (
                      <label key={c.key} className="flex h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-white/5">
                        <input type="checkbox" checked={cols[c.key]} onChange={() => setCols((s) => ({ ...s, [c.key]: !s[c.key] }))} className="h-4 w-4 accent-[#7ccf00]" />
                        {c.label}
                      </label>
                    ))}
                  {menu === "sort" &&
                    (["name", "available", "onHand"] as SortKey[]).flatMap((k) =>
                      ([1, -1] as const).map((d) => (
                        <button key={k + d} type="button" onClick={() => { setSort({ key: k, dir: d }); setMenu(null); }} className={cn("flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-white/5", sort.key === k && sort.dir === d && "text-accent")}>
                          {d === 1 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                          {k === "name" ? "Product" : k === "available" ? "Available" : "On hand"} {d === 1 ? (k === "name" ? "A to Z" : "low to high") : k === "name" ? "Z to A" : "high to low"}
                        </button>
                      ))
                    )}
                </div>
              )}
            </div>
          </div>

          {picked.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-accent/[0.07] px-4 py-2.5 text-sm">
              <span className="text-accent">{picked.size} selected</span>
              <button type="button" onClick={() => exportCsv(rows.filter((r) => picked.has(r.slug)))} className="underline underline-offset-2 hover:text-white">Export selected</button>
              {configured && (
                <button
                  type="button"
                  onClick={() => {
                    const v = window.prompt("Low-stock alert level for the selected products (units):", "20");
                    if (v === null) return;
                    void save([...picked].map((slug) => ({ slug, lowAt: Number(v) })));
                  }}
                  className="underline underline-offset-2 hover:text-white"
                >
                  Set low-stock alert
                </button>
              )}
              <button type="button" onClick={() => setPicked(new Set())} className="ml-auto text-white/50 hover:text-white">Clear</button>
            </div>
          )}

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 w-10 pr-0"><Check checked={allPicked} onChange={toggleAll} label="Select all" /></TableHead>
                  <TableHead className="h-11 w-14 pl-1" />
                  <TableHead className="h-11">
                    <button type="button" onClick={() => setSort((s) => ({ key: "name", dir: s.key === "name" ? (s.dir === 1 ? -1 : 1) : 1 }))} className="flex items-center gap-1.5 hover:text-white">
                      Product <ArrowUpDown size={13} className={sort.key === "name" ? "text-accent" : ""} />
                    </button>
                  </TableHead>
                  {COLS.filter((c) => vis(c.key)).map((c) => (
                    <TableHead key={c.key} className="h-11"><span title={c.tip} className="cursor-help underline decoration-dotted decoration-white/30 underline-offset-4">{c.label}</span></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((r) => (
                  <TableRow key={r.slug} data-state={picked.has(r.slug) ? "selected" : undefined}>
                    <TableCell className="w-10 py-3 pr-0"><Check checked={picked.has(r.slug)} onChange={() => toggle(r.slug)} label={`Select ${r.name}`} /></TableCell>
                    <TableCell className="w-14 py-3 pl-1"><Thumb src={r.image} alt={r.name} /></TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium">{r.name}</span>
                      <StockBadge s={status(r)} />
                    </TableCell>
                    {vis("unavailable") && <TableCell className="py-3"><Num value={r.unavailable} disabled={!configured} onSave={(v) => save([{ slug: r.slug, unavailable: v }])} small /></TableCell>}
                    {vis("committed") && <TableCell className="py-3 text-white/70">{committed[r.slug] ?? 0}</TableCell>}
                    {vis("available") && <TableCell className="py-3"><Num value={Math.max(0, avail(r))} disabled={!configured} onSave={(v) => save([{ slug: r.slug, onHand: v + (committed[r.slug] ?? 0) + r.unavailable }])} /></TableCell>}
                    {vis("onHand") && <TableCell className="py-3"><Num value={r.onHand} disabled={!configured} onSave={(v) => save([{ slug: r.slug, onHand: v }])} /></TableCell>}
                    {vis("incoming") && <TableCell className="py-3"><Num value={r.incoming} disabled={!configured} onSave={(v) => save([{ slug: r.slug, incoming: v }])} small /></TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-white/10 md:hidden">
            {shown.map((r) => (
              <li key={r.slug} className="p-4">
                <div className="flex items-center gap-3">
                  <Thumb src={r.image} alt={r.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.name}</p>
                    <StockBadge s={status(r)} block />
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
                  {vis("committed") && <Field label="Committed" tip={COLS[1].tip}><span className="text-white/70">{committed[r.slug] ?? 0}</span></Field>}
                  {vis("unavailable") && <Field label="Unavailable" tip={COLS[0].tip}><Num value={r.unavailable} disabled={!configured} onSave={(v) => save([{ slug: r.slug, unavailable: v }])} small /></Field>}
                  {vis("available") && <Field label="Available" tip={COLS[2].tip}><Num value={Math.max(0, avail(r))} disabled={!configured} onSave={(v) => save([{ slug: r.slug, onHand: v + (committed[r.slug] ?? 0) + r.unavailable }])} /></Field>}
                  {vis("onHand") && <Field label="On hand" tip={COLS[3].tip}><Num value={r.onHand} disabled={!configured} onSave={(v) => save([{ slug: r.slug, onHand: v }])} /></Field>}
                  {vis("incoming") && <Field label="Incoming" tip={COLS[4].tip}><Num value={r.incoming} disabled={!configured} onSave={(v) => save([{ slug: r.slug, incoming: v }])} small /></Field>}
                </dl>
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className="px-4 py-12 text-center text-sm text-white/45">No products match.</p>}
        </div>
      )}
      <p className="mt-3 text-xs text-white/35">On hand = Available + Committed + Unavailable. Shipping an order for the first time takes its units out of On hand.</p>
    </>
  );
}

function IconBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cn("grid h-10 w-10 place-items-center rounded-lg border text-white/70 transition hover:text-white", active ? "border-accent/60 bg-accent/10 text-accent" : "border-white/10 bg-white/[0.05] hover:border-white/30")}>
      {children}
    </button>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <input type="checkbox" aria-label={label} checked={checked} onChange={onChange} className="h-[18px] w-[18px] cursor-pointer rounded accent-[#7ccf00]" />;
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <Image src={src} alt={alt} fill sizes="44px" className="object-cover" />
    </span>
  );
}

function StockBadge({ s, block }: { s: "ok" | "low" | "out"; block?: boolean }) {
  if (s === "ok") return null;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", block ? "mt-1 inline-block" : "ml-2", s === "out" ? "bg-red-500/15 text-red-300" : "bg-amber-400/15 text-amber-300")}>
      {s === "out" ? "Out of stock" : "Low stock"}
    </span>
  );
}

function Field({ label, tip, children }: { label: string; tip: string; children: React.ReactNode }) {
  return (
    <div>
      <dt title={tip} className="mb-1 text-xs text-white/45">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Editable whole-number box that saves on blur or Enter, like the Shopify inventory fields. */
function Num({ value, onSave, disabled, small }: { value: number; onSave: (v: number) => void; disabled?: boolean; small?: boolean }) {
  // Uncontrolled, re-keyed by value so a saved or reverted count always shows.
  const commit = (el: HTMLInputElement) => {
    const v = Math.round(Number(el.value));
    if (el.value === "" || !Number.isFinite(v) || v < 0) {
      el.value = String(value);
      return;
    }
    if (v !== value) onSave(v);
  };
  return (
    <input
      key={value}
      inputMode="numeric"
      defaultValue={value}
      disabled={disabled}
      onChange={(e) => (e.target.value = e.target.value.replace(/[^\d]/g, ""))}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={cn("h-11 rounded-lg border border-white/20 bg-black/30 px-3 text-base text-white outline-none focus:border-accent disabled:opacity-50", small ? "w-20 text-white/80" : "w-28")}
    />
  );
}
