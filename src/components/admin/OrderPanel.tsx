"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Mail, MapPin, Package, X } from "lucide-react";
import { CARRIER_NAME, buildTrackingEntry, parseTrackingInput, type Lang } from "@/lib/shipping";
import type { AdminOrder } from "@/lib/adminOrders";
import { FulfillmentPill, PaymentPill, fmtDate, money } from "./adminUi";

const LANG_LABEL: Record<Lang, string> = { en: "English", es: "Spanish" };

export default function OrderPanel({
  order,
  onClose,
  onShipped,
}: {
  order: AdminOrder | null;
  onClose: () => void;
  onShipped: () => void;
}) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label={`Order ${order.number}`}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col border-l border-white/10 bg-[#101010] shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
          >
            <PanelBody key={order.id} order={order} onClose={onClose} onShipped={onShipped} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 px-5 py-5">
      <h3 className="mb-3 flex items-center gap-2 font-stencil text-xs uppercase tracking-[0.22em] text-white/45">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function PanelBody({ order, onClose, onShipped }: { order: AdminOrder; onClose: () => void; onShipped: () => void }) {
  const [tracking, setTracking] = useState("");
  const [lang, setLang] = useState<"auto" | Lang>("auto");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [again, setAgain] = useState(false);

  const shipped = Boolean(order.shippedAt);
  const showForm = !shipped || again;
  const { entries, invalid } = parseTrackingInput(tracking);
  const effectiveLang = lang === "auto" ? order.language : lang;
  const canSend = Boolean(order.email) && entries.length > 0 && invalid.length === 0 && !busy;
  const saved = (order.tracking ?? "").split("|").map((t) => buildTrackingEntry(t)).filter(Boolean);

  async function send() {
    const what = `${entries.length} tracking number${entries.length > 1 ? "s" : ""}`;
    const prefix = shipped ? "This order was already marked shipped. " : "";
    if (!window.confirm(`${prefix}Email ${order.email} in ${LANG_LABEL[effectiveLang]} with ${what}?`)) return;
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: order.id, tracking, lang, force: shipped }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      setResult({ ok: true, text: data.warning ?? `Sent to ${data.emailedTo}` });
      setTracking("");
      setTimeout(onShipped, 1100);
    } else {
      setResult({ ok: false, text: `${data.error ?? "Failed"}${data.detail ? `: ${data.detail}` : ""}` });
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(order.address.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <>
      <header className="flex items-start justify-between gap-3 px-5 pb-4 pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <div>
          <p className="font-stencil text-2xl uppercase tracking-wide">{order.number}</p>
          <p className="mt-1 text-sm text-white/50">{fmtDate(order.created)}</p>
          <div className="mt-3 flex gap-2">
            <PaymentPill />
            <FulfillmentPill shipped={shipped} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
        >
          <X size={18} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <Section title="Fulfillment" icon={<Package size={13} />}>
          {shipped && (
            <div className="mb-3 rounded-lg border border-accent/25 bg-accent/[0.07] p-3 text-sm">
              <p className="text-accent">
                Shipped {new Date(order.shippedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <ul className="mt-2 space-y-1.5">
                {saved.map((e) => (
                  <li key={e!.number} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-white/80">
                      <span className="text-white/45">{CARRIER_NAME[e!.carrier] || "Tracking"} · </span>
                      {e!.display}
                    </span>
                    {e!.url && (
                      <a
                        href={e!.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center gap-1 text-xs uppercase tracking-[0.12em] text-accent hover:underline"
                      >
                        Track <ExternalLink size={12} />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {!again && (
                <button
                  type="button"
                  onClick={() => setAgain(true)}
                  className="mt-3 text-xs uppercase tracking-[0.15em] text-white/50 underline"
                >
                  Send a new tracking email
                </button>
              )}
            </div>
          )}

          {showForm && (
            <div className="flex flex-col gap-3">
              <textarea
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                rows={3}
                placeholder={"Paste tracking number(s), one per line"}
                className="resize-none rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/35 focus:border-accent"
              />
              {(entries.length > 0 || invalid.length > 0) && (
                <ul className="space-y-1 text-xs text-white/60">
                  {entries.map((e) => (
                    <li key={e.number} className="flex items-center gap-1.5">
                      <Check size={13} className="text-accent" />
                      <span className="text-accent">{CARRIER_NAME[e.carrier] || "Carrier unknown, no link"}</span> · {e.display}
                    </li>
                  ))}
                  {invalid.map((i) => (
                    <li key={i} className="text-red-400">
                      Not a valid tracking number: {i}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "auto" | Lang)}
                  className="h-12 rounded-lg border border-white/15 bg-[#101010] px-3 text-sm text-white"
                >
                  <option value="auto">Auto ({LANG_LABEL[order.language]})</option>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={send}
                  className="h-12 flex-1 rounded-[3px] bg-accent px-6 font-stencil text-xs uppercase tracking-[0.2em] text-ink transition hover:brightness-95 disabled:opacity-35"
                >
                  {busy ? "Sending…" : "Mark shipped + email customer"}
                </button>
              </div>
              {!order.email && <p className="text-sm text-red-400">No email on this order, cannot notify the customer.</p>}
              {result && <p className={`text-sm ${result.ok ? "text-accent" : "text-red-400"}`}>{result.text}</p>}
              <p className="text-xs text-white/35">The customer gets the branded shipped email from orders@xstaticfit.com. You are BCC&apos;d.</p>
            </div>
          )}
        </Section>

        <Section title="Items">
          <ul className="space-y-3">
            {order.items.length === 0 && <li className="text-sm text-white/45">No line items on this order.</li>}
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="text-white">{it.name}</span>
                  <span className="text-white/45"> × {it.qty}</span>
                </span>
                <span className="text-white/80">{money(Number(it.total), order.currency)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-sm">
            <Row k="Subtotal" v={money(Number(order.subtotal), order.currency)} />
            <Row k="Shipping" v={Number(order.shippingCost) ? money(Number(order.shippingCost), order.currency) : "Free"} />
            {Number(order.tax) > 0 && <Row k="Tax" v={money(Number(order.tax), order.currency)} />}
            <div className="flex justify-between pt-1.5 text-base font-semibold">
              <dt>Total</dt>
              <dd>{money(Number(order.total), order.currency)}</dd>
            </div>
          </dl>
        </Section>

        <Section title="Customer" icon={<Mail size={13} />}>
          <p className="text-white">{order.name}</p>
          {order.email && (
            <a href={`mailto:${order.email}`} className="text-sm text-accent hover:underline">
              {order.email}
            </a>
          )}
          {order.phone && <p className="text-sm text-white/60">{order.phone}</p>}
        </Section>

        <Section title="Ship to" icon={<MapPin size={13} />}>
          {order.address.length ? (
            <div className="flex items-start justify-between gap-3">
              <address className="text-sm not-italic leading-relaxed text-white/80">
                {order.address.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </address>
              <button
                type="button"
                onClick={copyAddress}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs uppercase tracking-[0.12em] text-white/70 hover:border-white/40"
              >
                {copied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/45">No shipping address on this order.</p>
          )}
        </Section>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-white/60">
      <dt>{k}</dt>
      <dd className="text-white/80">{v}</dd>
    </div>
  );
}
