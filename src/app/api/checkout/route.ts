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

  const { items, tracking, email, marketingConsent, browserLang } = (await request.json()) as {
    items: { slug: string; qty: number }[];
    // Optional, typed in the cart. marketingConsent is true only if the visitor ticked the box.
    email?: string;
    marketingConsent?: boolean;
    browserLang?: string;
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

  const cartEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email ?? "").trim())
    ? String(email).trim().toLowerCase().slice(0, 254)
    : null;
  if (cartEmail && marketingConsent === true) {
    metadata.marketing_consent = "granted";
    metadata.browser_lang = trim500(browserLang);
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    ...(cartEmail ? { customer_email: cartEmail } : {}),
    line_items,
    ...(discounts ? { discounts } : { allow_promotion_codes: true }),
    ...(COLLECT_SALES_TAX ? { automatic_tax: { enabled: true } } : {}),
    shipping_address_collection: { allowed_countries: ["US", "PR", "CA"] },
    // Abandoned checkout flow: Stripe expires the session after 30 minutes (its minimum) and
    // sends checkout.session.expired with the email (if typed) and a recovery link.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    after_expiration: { recovery: { enabled: true, allow_promotion_codes: false } },
    payment_intent_data: { description: productNames.join(", ") },
    metadata,
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  };

  // Marketing extras (prefilled email, promotions checkbox) must never block a purchase. Try the full
  // session first, then without the extras, so a Stripe rejection of any of them still lets people pay.
  const { customer_email, ...baseParams } = params;
  const attempts: Stripe.Checkout.SessionCreateParams[] = [
    { ...params, consent_collection: { promotions: "auto" } },
    params,
    baseParams,
  ];
  let session: Stripe.Checkout.Session | null = null;
  let lastError: unknown = null;
  for (let i = 0; i < attempts.length; i++) {
    // Skip identical attempts (no email typed means attempts 2 and 3 are the same).
    if (i === 2 && !customer_email) break;
    try {
      session = await stripe.checkout.sessions.create(attempts[i]);
      if (i > 0) console.error("Checkout created without marketing extras, attempt", i + 1, String(lastError));
      break;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Only retry for errors about the optional parameters. Anything else is a real failure.
      if (!/consent_collection|customer_email|customer/i.test(msg)) throw err;
    }
  }
  if (!session) throw lastError;

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
