import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { applyStockUpdates, inventoryConfigured, readStock, stockRows, writeStock, type StockRecord } from "@/lib/inventory";
import { isDemo } from "@/lib/adminOrders";

const authed = (r: NextRequest) => verifyAdminToken(r.cookies.get(ADMIN_COOKIE)?.value);

export async function GET(request: NextRequest) {
  if (!authed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const file = await readStock();
    return NextResponse.json({ rows: stockRows(file), configured: inventoryConfigured(), demo: isDemo() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not read stock" }, { status: 502 });
  }
}

/** Body: { updates: [{ slug, onHand?, unavailable?, incoming?, lowAt? }] } */
export async function PATCH(request: NextRequest) {
  if (!authed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!inventoryConfigured()) {
    return NextResponse.json({ error: "Stock storage is not connected" }, { status: 501 });
  }
  const body = (await request.json().catch(() => ({}))) as { updates?: ({ slug: string } & Partial<StockRecord>)[] };
  if (!Array.isArray(body.updates) || body.updates.length === 0 || body.updates.length > 50) {
    return NextResponse.json({ error: "updates required" }, { status: 400 });
  }
  try {
    const next = applyStockUpdates(await readStock(), body.updates);
    await writeStock(next);
    return NextResponse.json({ rows: stockRows(next) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save stock" }, { status: 502 });
  }
}
