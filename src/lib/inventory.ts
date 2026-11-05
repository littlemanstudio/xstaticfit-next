import { PRODUCTS } from "./products";
import { isDemo } from "./adminOrders";
import { getStripe } from "./stripe";

export type StockRecord = { onHand: number; unavailable: number; incoming: number; lowAt: number };
export type StockFile = Record<string, StockRecord>;

export type StockRow = StockRecord & {
  slug: string;
  name: string;
  image: string;
  category: string;
  price: number;
};

const KEY = "xf:inventory";
const EMPTY: StockRecord = { onHand: 0, unavailable: 0, incoming: 0, lowAt: 10 };

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

/** True when stock counts can be saved: local demo, Redis if connected, otherwise Stripe (always there for the store). */
export function inventoryConfigured() {
  return isDemo() || Boolean(redisConfig()) || Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Zero-setup storage: one inactive internal Stripe product holds the counts in its metadata, so no extra
 * database is needed. Format: "slug=onHand,unavailable,incoming,lowAt;slug2=..." (well under Stripe's 500 char limit).
 */
const STRIPE_FLAG = "xf_inventory";

function encode(file: StockFile) {
  return Object.entries(file)
    .map(([slug, r]) => `${slug}=${r.onHand},${r.unavailable},${r.incoming},${r.lowAt}`)
    .join(";");
}

function decode(text: string | undefined): StockFile {
  const out: StockFile = {};
  for (const part of (text ?? "").split(";")) {
    const [slug, nums] = part.split("=");
    if (!slug || !nums) continue;
    const [onHand, unavailable, incoming, lowAt] = nums.split(",").map((n) => Number(n));
    out[slug] = { onHand: onHand || 0, unavailable: unavailable || 0, incoming: incoming || 0, lowAt: Number.isFinite(lowAt) ? lowAt : EMPTY.lowAt };
  }
  return out;
}

async function findStripeStore() {
  const stripe = getStripe();
  if (!stripe) return null;
  for await (const p of stripe.products.list({ active: false, limit: 100 })) {
    if (p.metadata?.[STRIPE_FLAG] === "1") return { stripe, product: p };
  }
  return { stripe, product: null };
}

type DemoGlobal = typeof globalThis & { __xfDemoStock?: StockFile };

function demoSeed(): StockFile {
  return {
    "xstatic-carbon-grips": { onHand: 120, unavailable: 3, incoming: 200, lowAt: 25 },
    "xstatic-weighted-jump-ropes": { onHand: 64, unavailable: 2, incoming: 0, lowAt: 20 },
    "xstatic-door-pull-up-bar": { onHand: 24, unavailable: 0, incoming: 60, lowAt: 25 },
  };
}

export async function readStock(): Promise<StockFile> {
  if (isDemo()) {
    const g = globalThis as DemoGlobal;
    g.__xfDemoStock ??= demoSeed();
    return g.__xfDemoStock;
  }
  const cfg = redisConfig();
  if (!cfg) {
    const found = await findStripeStore();
    return decode(found?.product?.metadata?.data);
  }
  const res = await fetch(`${cfg.url}/get/${KEY}`, { headers: { Authorization: `Bearer ${cfg.token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Stock storage read failed (${res.status})`);
  const data = (await res.json()) as { result: string | null };
  return data.result ? (JSON.parse(data.result) as StockFile) : {};
}

export async function writeStock(file: StockFile): Promise<void> {
  if (isDemo()) {
    (globalThis as DemoGlobal).__xfDemoStock = file;
    return;
  }
  const cfg = redisConfig();
  if (!cfg) {
    const found = await findStripeStore();
    if (!found) throw new Error("Stock storage is not connected");
    const data = encode(file);
    if (found.product) await found.stripe.products.update(found.product.id, { metadata: { data } });
    else
      await found.stripe.products.create({
        name: "Xstatic Fit stock counts (internal, do not delete)",
        active: false,
        metadata: { [STRIPE_FLAG]: "1", data },
      });
    return;
  }
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", KEY, JSON.stringify(file)]),
  });
  if (!res.ok) throw new Error(`Stock storage write failed (${res.status})`);
}

export function stockRows(file: StockFile): StockRow[] {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.image,
    category: p.category,
    price: p.price,
    ...EMPTY,
    ...(file[p.slug] ?? {}),
  }));
}

const clampInt = (n: unknown, fallback: number) => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) && v >= 0 && v <= 1_000_000 ? v : fallback;
};

/** Applies validated partial updates and returns the new file. Unknown slugs are ignored. */
export function applyStockUpdates(file: StockFile, updates: ({ slug: string } & Partial<StockRecord>)[]): StockFile {
  const next: StockFile = { ...file };
  for (const u of updates) {
    if (!PRODUCTS.some((p) => p.slug === u.slug)) continue;
    const cur = { ...EMPTY, ...(next[u.slug] ?? {}) };
    next[u.slug] = {
      onHand: clampInt(u.onHand, cur.onHand),
      unavailable: clampInt(u.unavailable, cur.unavailable),
      incoming: clampInt(u.incoming, cur.incoming),
      lowAt: clampInt(u.lowAt, cur.lowAt),
    };
  }
  return next;
}

/** When an order ships for the first time, take its items out of stock. */
export async function decrementOnShip(items: { name: string; qty: number }[]): Promise<void> {
  if (!inventoryConfigured()) return;
  const file = await readStock();
  const updates: ({ slug: string } & Partial<StockRecord>)[] = [];
  for (const it of items) {
    const p = PRODUCTS.find((x) => x.name === it.name);
    if (!p) continue;
    const cur = { ...EMPTY, ...(file[p.slug] ?? {}) };
    updates.push({ slug: p.slug, onHand: Math.max(0, cur.onHand - it.qty) });
  }
  if (updates.length) await writeStock(applyStockUpdates(file, updates));
}

/** Units sitting in paid-but-unshipped orders, per product slug. */
export function committedBySlug(orders: { shippedAt: string | null; items: { name: string; qty: number }[] }[]) {
  const out: Record<string, number> = {};
  for (const o of orders) {
    if (o.shippedAt) continue;
    for (const it of o.items) {
      const p = PRODUCTS.find((x) => x.name === it.name);
      if (p) out[p.slug] = (out[p.slug] ?? 0) + it.qty;
    }
  }
  return out;
}
