import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  robots: { index: false, follow: false },
};

export default function AdminShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
