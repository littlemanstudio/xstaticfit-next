import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { demoAbandoned, isDemo, orderNumber } from "@/lib/adminOrders";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemo()) return NextResponse.json({ checkouts: demoAbandoned() });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });

  const list = await stripe.checkout.sessions.list({ limit: 100, status: "expired", expand: ["data.line_items"] });
  const checkouts = list.data.map((s) => ({
    id: s.id,
    number: orderNumber(s.id),
    created: s.created * 1000,
    email: s.customer_details?.email ?? null,
    name: s.customer_details?.name ?? null,
    total: ((s.amount_total ?? 0) / 100).toFixed(2),
    currency: (s.currency ?? "usd").toUpperCase(),
    items: (s.line_items?.data ?? []).map((li) => ({ name: li.description ?? "Item", qty: li.quantity ?? 1 })),
  }));
  return NextResponse.json({ checkouts });
}
