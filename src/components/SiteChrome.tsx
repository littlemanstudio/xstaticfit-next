"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import TopBanner from "@/components/TopBanner";
import SmoothScroll from "@/components/SmoothScroll";
import MetaPixel from "@/components/MetaPixel";

/** The storefront shell. The private /admin area brings its own shell, so none of this renders there. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <main className="flex-1">{children}</main>;
  return (
    <>
      <SmoothScroll />
      <TopBanner />
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
      <MetaPixel />
    </>
  );
}
