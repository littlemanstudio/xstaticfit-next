import { PRODUCTS } from "./products";

// Bundle offer promised in the FAQ, the Shop page and the Training category page:
// "Purchase all three items in one go and enjoy a generous 10% discount on your
// total order." This file is the single source of truth for that rule. The cart
// drawer uses it to show the discount and the checkout route uses it to apply the
// same discount in Stripe, so what the customer sees is what Stripe charges.

/** The three training products that together unlock the bundle. */
export const BUNDLE_SLUGS = PRODUCTS.filter((p) => p.category === "training").map((p) => p.slug);

export const BUNDLE_PERCENT_OFF = 10;

/** Stripe coupon id reused for every bundle order (created on first use). */
export const BUNDLE_COUPON_ID = "XSF_BUNDLE_ALL3_10";

type LineLike = { slug: string; qty: number };

export function qualifiesForBundle(items: LineLike[]): boolean {
  if (BUNDLE_SLUGS.length < 3) return false;
  return BUNDLE_SLUGS.every((slug) => items.some((i) => i.slug === slug && i.qty >= 1));
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Totals in dollars. Uses catalog prices (not client prices) so client and server agree.
 * The discount is 10% of the whole order, matching "10% discount on your total order".
 */
export function cartTotals(items: LineLike[]) {
  const subtotal = round2(
    items.reduce((sum, i) => {
      const product = PRODUCTS.find((p) => p.slug === i.slug);
      return sum + (product ? product.price * i.qty : 0);
    }, 0)
  );
  const bundle = qualifiesForBundle(items);
  // Stripe rounds percent coupons per order to the cent; mirror that here.
  const discount = bundle ? round2((subtotal * BUNDLE_PERCENT_OFF) / 100) : 0;
  return { subtotal, discount, total: round2(subtotal - discount), bundle };
}
