import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/SeoProfile";

// Every page is open. /api/ only holds Yui's chat, voice and order endpoints: nothing to index there,
// and a crawler hitting them would only spend the Gemini quota.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
