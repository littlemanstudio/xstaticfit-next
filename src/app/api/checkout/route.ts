import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";
import { BUNDLE_COUPON_ID, BUNDLE_PERCENT_OFF, cartTotals } from "@/lib/bundle";
import { COLLECT_SALES_TAX } from "@/lib/tax";
import { capiConfigured, clientIpFrom, fbcFrom } from "@/lib/meta/capi";

/** Reuses one Stripe coupon for the "buy all 3, save 10%" bundle, creating it the first time. */
async function ensureBundleCoupon(stripe: Stripe) {
  try {
    const existing = await stripe.coupons.retrieve(BUNDLE_COUPON_ID);
    if (existing.valid && existing.percent_off === BUNDLE_PERCENT_OFF) return existing.id;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "resource_missing") throw err;
    const created = await stripe.coupons.create({
      id: BUNDLE_COUPON_ID,
      percent_off: BUNDLE_PERCENT_OFF,
      duration: "once",
      name: `Bundle: all 3 items ${BUNDLE_PERCENT_OFF}% off`,
    });
    return created.id;
  }
  throw new Error(`Coupon ${BUNDLE_COUPON_ID} exists but is invalid or not ${BUNDLE_PERCENT_OFF}% off`);
}

function trim500(v: string | null | undefined) {
  return v ? v.slice(0, 500) : "";
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 501 }
    );
  }

  const { items, tracking } = (await request.json()) as {
    items: { slug: string; qty: number }[];
    // Sent by the cart only when the visitor has not declined tracking.
    tracking?: { consent?: "granted"; pageUrl?: string };
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const isPublicHttps = origin.startsWith("https://");

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const productNames: string[] = [];
  const lines: { slug: string; qty: number }[] = [];

  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
    }
    const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
    lines.push({ slug: product.slug, qty });
    line_items.push({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: isPublicHttps ? [new URL(product.image, origin).toString()] : undefined,
          metadata: { slug: product.slug },
        },
      },
    });
    productNames.push(qty > 1 ? `${product.name} x${qty}` : product.name);
  }

  const totals = cartTotals(lines);

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (totals.bundle) {
    try {
      discounts = [{ coupon: await ensureBundleCoupon(stripe) }];
    } catch (err) {
      // Do not charge full price when the site promised 10% off. Ask the customer to retry.
      console.error("Bundle coupon error:", err instanceof Error ? err.message : err);
      return NextResponse.json(
        { error: "We could not apply your bundle discount. Please try again in a moment." },
        { status: 502 }
      );
    }
  }

  // Meta Conversions API context for the Purchase event sent by the Stripe webhook.
  // Stored only when tracking is configured and the visitor did not decline.
  const metadata: Record<string, string> = {
    content_ids: lines.map((l) => l.slug).join(",").slice(0, 500),
    num_items: String(lines.reduce((s, l) => s + l.qty, 0)),
  };
  if (capiConfigured() && tracking?.consent === "granted") {
    let pageUrl: string | null = null;
    try {
      const u = new URL(String(tracking.pageUrl ?? ""));
      if (u.host === request.nextUrl.host) pageUrl = u.toString();
    } catch {}
    metadata.meta_consent = "granted";
    metadata.meta_ip = trim500(clientIpFrom(request.headers));
    metadata.meta_ua = trim500(request.headers.get("user-agent"));
    metadata.meta_fbp = trim500(request.cookies.get("_fbp")?.value);
    metadata.meta_fbc = trim500(fbcFrom(request.cookies.get("_fbc")?.value, pageUrl));
    metadata.meta_source_url = trim500(pageUrl);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    ...(discounts ? { discounts } : {}),
    ...(COLLECT_SALES_TAX ? { automatic_tax: { enabled: true } } : {}),
    shipping_address_collection: { allowed_countries: ["US", "PR", "CA"] },
    // Abandoned checkout flow: Stripe expires the session after 30 minutes (its minimum) and
    // sends checkout.session.expired with the email (if typed) and a recovery link.
    // Promotions consent adds the opt-in checkbox on the Stripe page where Stripe requires it.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    after_expiration: { recovery: { enabled: true, allow_promotion_codes: false } },
    consent_collection: { promotions: "auto" },
    payment_intent_data: { description: productNames.join(", ") },
    metadata,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  return NextResponse.json({
    url: session.url,
    // Used by the success page for the browser Purchase event (event_id = session id).
    purchase: {
      id: session.id,
      value: totals.total,
      content_ids: lines.map((l) => l.slug),
      contents: lines.map((l) => ({ id: l.slug, quantity: l.qty })),
      num_items: lines.reduce((s, l) => s + l.qty, 0),
    },
  });
}
