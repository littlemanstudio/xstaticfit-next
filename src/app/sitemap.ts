import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

// No lastModified: we don't track real per-page change dates, and a
// fake "always now" timestamp is worse for crawlers than omitting it.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/shop`, priority: 0.9 },
    { url: `${SITE_URL}/about`, priority: 0.6 },
    { url: `${SITE_URL}/guarantee`, priority: 0.5 },
    { url: `${SITE_URL}/shipping`, priority: 0.5 },
    { url: `${SITE_URL}/contact`, priority: 0.4 },
    { url: `${SITE_URL}/category/apparel`, priority: 0.7 },
    { url: `${SITE_URL}/category/training`, priority: 0.8 },
    { url: `${SITE_URL}/privacy`, priority: 0.2 },
    { url: `${SITE_URL}/terms`, priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${SITE_URL}/product/${p.slug}`,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
