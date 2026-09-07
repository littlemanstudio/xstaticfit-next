import type { Metadata } from "next";
import { stencil, cabin } from "./fonts";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import TopBanner from "@/components/TopBanner";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const HOME_TITLE = "Xstatic Fit | Home Training Gear Built for Warriors";
const HOME_DESCRIPTION =
  "Shop Xstatic Fit's home training gear: carbon fiber grips, weighted jump ropes, and door pull-up bars built to help you stay fit, be greater, and live better.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: "/images/hero.jpg", width: 1417, height: 1080, alt: "Xstatic Fit athlete training" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/images/hero.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-white.png`,
  sameAs: [
    "https://instagram.com/xstaticfit",
    "https://facebook.com/xstaticfit",
    "https://youtube.com/xstaticfit",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${stencil.variable} ${cabin.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <SmoothScroll />
        <TopBanner />
        <Header />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
