import type { Metadata } from "next";
import ShippingContent from "./ShippingContent";

const TITLE = "Shipping Times, Rates & Our Return Policy";
const DESCRIPTION =
  "Xstatic Fit ships within 24 to 48 hours with 3 to 5 day delivery, plus a 14-day return policy. See our full shipping and returns policy before you order.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return <ShippingContent />;
}
