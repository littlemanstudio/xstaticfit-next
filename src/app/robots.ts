import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // One group: crawlers that find several "User-agent: *" groups may only honor the first.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/checkout/success", "/checkout/cancel"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
