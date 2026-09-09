import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProduct } from "@/lib/products";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to your environment." },
      { status: 501 }
    );
  }

  const { items } = (await request.json()) as {
    items: { slug: string; qty: number }[];
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const isPublicHttps = origin.startsWith("https://");

  const line_items: import("stripe").Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const productNames: string[] = [];

  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) {
      return NextResponse.json({ error: `Unknown product: ${item.slug}` }, { status: 400 });
    }
    line_items.push({
      quantity: item.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.name,
          images: isPublicHttps ? [new URL(product.image, origin).toString()] : undefined,
        },
      },
    });
    productNames.push(item.qty > 1 ? `${product.name} x${item.qty}` : product.name);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    shipping_address_collection: { allowed_countries: ["US", "PR", "CA"] },
    payment_intent_data: { description: productNames.join(", ") },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
