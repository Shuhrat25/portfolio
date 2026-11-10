import type { MetadataRoute } from "next";
import { SITE_URL } from "@/components/SeoProfile";
import { PANELS } from "@/content/ui";

// The home page and a link per section; the three languages switch on the client, so there are no
// per-language URLs to list.
// No lastModified: new Date() would make the route request-time under cacheComponents and lie on every hit.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...PANELS.map((section) => ({ url: `${SITE_URL}/${section}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
