import { NextRequest, NextResponse, after } from "next/server";
import { RELAY_EVENTS, type RelayEventName } from "@/lib/meta/config";
import { capiConfigured, clientIpFrom, fbcFrom, sendCapiEvent } from "@/lib/meta/capi";
import { getProduct } from "@/lib/products";
import { cartTotals } from "@/lib/bundle";

// Relay for browser events (ViewContent, AddToCart, InitiateCheckout) to the Meta
// Conversions API. The browser sends the event name, its event_id and the items; the
// server rebuilds value and names from the catalog (client prices are not trusted),
// adds IP, user agent and the _fbp/_fbc cookies, and sends it after the response.
// The client only calls this when the visitor has not declined tracking.

type Body = {
  event_name?: string;
  event_id?: string;
  event_source_url?: string;
  items?: { id?: string; quantity?: number }[];
};

export async function POST(request: NextRequest) {
  if (!capiConfigured()) return NextResponse.json({ ok: true, skipped: true });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const name = body.event_name as RelayEventName;
  if (!RELAY_EVENTS.includes(name)) {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }
  const eventId = typeof body.event_id === "string" ? body.event_id : "";
  if (!/^[\w.:-]{8,100}$/.test(eventId)) {
    return NextResponse.json({ error: "Bad event_id" }, { status: 400 });
  }

  const items = (body.items ?? [])
    .map((i) => ({ product: getProduct(String(i.id ?? "")), qty: Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 1))) }))
    .filter((i): i is { product: NonNullable<typeof i.product>; qty: number } => Boolean(i.product))
    .slice(0, 10);
  if (!items.length) return NextResponse.json({ error: "No known items" }, { status: 400 });

  const lines = items.map((i) => ({ slug: i.product.slug, qty: i.qty }));
  const value = name === "InitiateCheckout" ? cartTotals(lines).total : cartTotals(lines).subtotal;

  // Only accept URLs on this site as the event source.
  let sourceUrl: string | null = null;
  try {
    const u = new URL(String(body.event_source_url ?? ""));
    if (u.host === request.nextUrl.host) sourceUrl = u.toString();
  } catch {}

  const user = {
    clientIp: clientIpFrom(request.headers),
    userAgent: request.headers.get("user-agent"),
    fbp: request.cookies.get("_fbp")?.value ?? null,
    fbc: fbcFrom(request.cookies.get("_fbc")?.value, sourceUrl),
  };

  after(() =>
    sendCapiEvent({
      eventName: name,
      eventId,
      eventSourceUrl: sourceUrl,
      user,
      custom: {
        value,
        content_ids: lines.map((l) => l.slug),
        contents: lines.map((l) => ({ id: l.slug, quantity: l.qty })),
        num_items: lines.reduce((s, l) => s + l.qty, 0),
        ...(items.length === 1 ? { content_name: items[0].product.name } : {}),
      },
    })
  );

  return NextResponse.json({ ok: true });
}
