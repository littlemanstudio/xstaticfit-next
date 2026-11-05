import { pickLanguage, type Lang } from "./shipping";

export type OrderItem = { name: string; qty: number; total: string };

export type AdminOrder = {
  id: string;
  number: string;
  created: number;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  address: string[];
  language: Lang;
  currency: string;
  subtotal: string;
  shippingCost: string;
  tax: string;
  total: string;
  items: OrderItem[];
  itemCount: number;
  shippedAt: string | null;
  tracking: string | null;
};

const money = (cents: number | null | undefined) => ((cents ?? 0) / 100).toFixed(2);

export function orderNumber(sessionId: string) {
  return "XF-" + sessionId.slice(-5).toUpperCase();
}

type StripeLike = {
  id: string;
  created: number;
  currency?: string | null;
  amount_total?: number | null;
  amount_subtotal?: number | null;
  total_details?: { amount_shipping?: number | null; amount_tax?: number | null } | null;
  customer_details?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  collected_information?: { shipping_details?: ShippingDetails | null } | null;
  shipping_details?: ShippingDetails | null;
  line_items?: { data: { description?: string | null; quantity?: number | null; amount_total?: number }[] } | null;
  metadata?: Record<string, string> | null;
};
type ShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

/** Maps a Stripe Checkout Session (with line_items expanded) to the shape the dashboard uses. */
export function fromStripeSession(s: StripeLike): AdminOrder {
  const ship = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
  const a = ship?.address;
  const country = a?.country ?? null;
  const address = [
    a?.line1,
    a?.line2,
    [a?.city, a?.state, a?.postal_code].filter(Boolean).join(", "),
    country,
  ].filter((x): x is string => Boolean(x));
  const items: OrderItem[] = (s.line_items?.data ?? []).map((li) => ({
    name: li.description ?? "Item",
    qty: li.quantity ?? 1,
    total: money(li.amount_total),
  }));
  return {
    id: s.id,
    number: orderNumber(s.id),
    created: s.created * 1000,
    name: ship?.name ?? s.customer_details?.name ?? "Unknown",
    email: s.customer_details?.email ?? null,
    phone: s.customer_details?.phone ?? null,
    country,
    address,
    language: pickLanguage(country),
    currency: (s.currency ?? "usd").toUpperCase(),
    subtotal: money(s.amount_subtotal),
    shippingCost: money(s.total_details?.amount_shipping),
    tax: money(s.total_details?.amount_tax),
    total: money(s.amount_total),
    items,
    itemCount: items.reduce((n, i) => n + i.qty, 0),
    shippedAt: s.metadata?.shipped_at ?? null,
    tracking: s.metadata?.tracking ?? null,
  };
}

/** Local-only sample data so the dashboard can be previewed before Stripe is connected. */
export function demoOrders(now = Date.now()): AdminOrder[] {
  const people: [string, string, string, string[]][] = [
    ["Mariela Rivera", "PR", "mariela@example.com", ["Calle Luna 14", "Ponce, PR, 00717", "PR"]],
    ["Jordan Blake", "US", "jordan@example.com", ["88 Maple Ave", "Austin, TX, 78701", "US"]],
    ["Carlos Medina", "PR", "carlos@example.com", ["Urb. Las Delicias 221", "San Juan, PR, 00926", "PR"]],
    ["Tyler Hughes", "US", "tyler@example.com", ["402 Oak St", "Tampa, FL, 33602", "US"]],
    ["Ana Torres", "PR", "ana@example.com", ["Carr. 14 Km 3", "Juana Diaz, PR, 00795", "PR"]],
    ["Devon Price", "US", "devon@example.com", ["19 River Rd", "Columbus, OH, 43215", "US"]],
    ["Luis Ortiz", "PR", "luis@example.com", ["Calle Sol 9", "Mayaguez, PR, 00680", "PR"]],
    ["Marcus Cole", "US", "marcus@example.com", ["77 Pine Ln", "Denver, CO, 80202", "US"]],
  ];
  const catalog: [string, number][] = [
    ["Xstatic Carbon Grips", 4000],
    ["Xstatic Weighted Jump Ropes", 2500],
    ["Xstatic Door Pull Up Bar", 6000],
  ];
  const out: AdminOrder[] = [];
  for (let i = 0; i < 42; i++) {
    const p = people[i % people.length];
    const n = 1 + ((i * 7) % 3 === 0 ? 1 : 0) + (i % 5 === 0 ? 1 : 0);
    const lines: OrderItem[] = [];
    let sub = 0;
    for (let k = 0; k < n; k++) {
      const [name, cents] = catalog[(i + k) % catalog.length];
      lines.push({ name, qty: 1, total: money(cents) });
      sub += cents;
    }
    const shipC = p[1] === "PR" ? 0 : 599;
    const created = now - i * 3600_000 * (5 + (i % 4)) - (i % 3) * 600_000;
    const shipped = i > 5 && i % 4 !== 0;
    const id = `cs_demo_${String(1000 + i).padStart(5, "0")}${(i * 7919).toString(36)}`;
    out.push({
      id,
      number: orderNumber(id),
      created,
      name: p[0],
      email: p[2],
      phone: null,
      country: p[1],
      address: [p[0], ...p[3]],
      language: pickLanguage(p[1]),
      currency: "USD",
      subtotal: money(sub),
      shippingCost: money(shipC),
      tax: "0.00",
      total: money(sub + shipC),
      items: lines,
      itemCount: lines.length,
      shippedAt: shipped ? new Date(created + 86400_000).toISOString() : null,
      tracking: shipped ? `9405 5112 0620 ${(4000 + i * 37).toString().padStart(4, "0")} 8821 ${(10 + i).toString().padStart(2, "0")}` : null,
    });
  }
  return out;
}

export function isDemo() {
  return process.env.ADMIN_DEMO === "1" && process.env.NODE_ENV !== "production";
}

export type AbandonedCheckout = {
  id: string;
  number: string;
  created: number;
  email: string | null;
  name: string | null;
  total: string;
  currency: string;
  items: { name: string; qty: number }[];
};

export function demoAbandoned(now = Date.now()): AbandonedCheckout[] {
  const rows: [string | null, string | null, [string, number, number][]][] = [
    ["kyle@example.com", "Kyle Brooks", [["Xstatic Door Pull Up Bar", 1, 60]]],
    [null, null, [["Xstatic Carbon Grips", 2, 40]]],
    ["nina@example.com", null, [["Xstatic Weighted Jump Ropes", 1, 25], ["Xstatic Carbon Grips", 1, 40]]],
    [null, null, [["Xstatic Weighted Jump Ropes", 1, 25]]],
    ["rafa@example.com", "Rafael Soto", [["Xstatic Door Pull Up Bar", 1, 60], ["Xstatic Carbon Grips", 1, 40]]],
  ];
  return rows.map(([email, name, lines], i) => {
    const id = `cs_demo_ab${i}${(i * 104729).toString(36)}`;
    return {
      id,
      number: orderNumber(id),
      created: now - (i * 7 + 3) * 3600_000,
      email,
      name,
      total: lines.reduce((n, l) => n + l[1] * l[2], 0).toFixed(2),
      currency: "USD",
      items: lines.map((l) => ({ name: l[0], qty: l[1] })),
    };
  });
}
