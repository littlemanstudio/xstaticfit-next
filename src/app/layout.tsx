import type { Metadata } from "next";
import { stencil, cabin } from "./fonts";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import TopBanner from "@/components/TopBanner";

export const metadata: Metadata = {
  title: "Xstatic Fit",
  description: "Get everything you need to stay fit, be greater & live better.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${stencil.variable} ${cabin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TopBanner />
        <Header />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
