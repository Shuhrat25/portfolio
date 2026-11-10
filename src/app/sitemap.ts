import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/SeoProfile";

// One page; the three languages switch on the client, so there are no per-language URLs to list.
// No lastModified: new Date() would make the route request-time under cacheComponents and lie on every hit.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}
