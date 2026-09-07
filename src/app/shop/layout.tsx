import type { Metadata } from "next";

const TITLE = "Shop All Products";
const DESCRIPTION =
  "Browse Xstatic Fit's full catalog: carbon fiber hand grips, weighted jump ropes, and adjustable door pull-up bars built for real home training.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: ["/images/hero.jpg"] },
  twitter: { title: TITLE, description: DESCRIPTION, images: ["/images/hero.jpg"] },
  alternates: { canonical: "/shop" },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
