import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { demoOrders, fromStripeSession, isDemo } from "@/lib/adminOrders";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemo()) return NextResponse.json({ orders: demoOrders(), demo: true });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
  }

  // Walk the whole history, 100 per page, newest first. Capped so one request stays fast.
  const MAX = 1500;
  const orders: ReturnType<typeof fromStripeSession>[] = [];
  let scanned = 0;
  let truncated = false;
  for await (const s of stripe.checkout.sessions.list({ limit: 100, expand: ["data.line_items"] })) {
    if (++scanned > MAX) {
      truncated = true;
      break;
    }
    if (s.payment_status === "paid") {
      orders.push(fromStripeSession(s as unknown as Parameters<typeof fromStripeSession>[0]));
    }
  }

  return NextResponse.json({ orders, demo: false, truncated });
}
