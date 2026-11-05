import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import { shipOrder, type SessionLite } from "@/lib/shipOrder";
import { OWNER_EMAIL, sendViaResend } from "@/lib/sendEmail";
import { isDemo } from "@/lib/adminOrders";
import { decrementOnShip } from "@/lib/inventory";
import { parseTrackingInput } from "@/lib/shipping";

type Address = { country?: string | null };
type ShippingDetails = { name?: string | null; address?: Address | null };

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    tracking?: string;
    lang?: "en" | "es" | "auto";
    force?: boolean;
  };
  if (!body.sessionId || typeof body.tracking !== "string") {
    return NextResponse.json({ error: "sessionId and tracking are required" }, { status: 400 });
  }
  if (isDemo()) {
    // Local preview only: validate the tracking number but never email or write anything.
    const { entries, invalid } = parseTrackingInput(body.tracking);
    if (invalid.length || !entries.length) {
      return NextResponse.json({ error: "invalid_tracking", detail: invalid.join(", ") }, { status: 400 });
    }
    return NextResponse.json({ ok: true, demo: true, packages: entries.length, emailedTo: "(demo, nothing sent)" });
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
  }

  const result = await shipOrder(
    { sessionId: body.sessionId, trackingInput: body.tracking, lang: body.lang, force: body.force },
    {
      ownerEmail: OWNER_EMAIL,
      now: () => new Date(),
      sendEmail: sendViaResend,
      saveShipped: async (id, metadata) => {
        await stripe.checkout.sessions.update(id, { metadata });
      },
      getSession: async (id): Promise<SessionLite | null> => {
        try {
          const s = await stripe.checkout.sessions.retrieve(id);
          const loose = s as unknown as {
            collected_information?: { shipping_details?: ShippingDetails | null } | null;
            shipping_details?: ShippingDetails | null;
          };
          const shipping = loose.collected_information?.shipping_details ?? loose.shipping_details;
          return {
            id: s.id,
            paid: s.payment_status === "paid",
            name: shipping?.name ?? s.customer_details?.name ?? "",
            email: s.customer_details?.email ?? null,
            country: shipping?.address?.country ?? null,
            metadata: (s.metadata ?? {}) as Record<string, string>,
          };
        } catch {
          return null;
        }
      },
    }
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error, detail: result.detail }, { status: result.status });
  }
  // First shipment only: take the shipped units out of stock. Best effort, never blocks the shipped email.
  if (!body.force) {
    try {
      const full = await stripe.checkout.sessions.retrieve(body.sessionId, { expand: ["line_items"] });
      await decrementOnShip(
        (full.line_items?.data ?? []).map((li) => ({ name: li.description ?? "", qty: li.quantity ?? 1 }))
      );
    } catch {}
  }
  return NextResponse.json(result);
}
