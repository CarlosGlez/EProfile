import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

// Los paneles privados no deben indexarse; las EProfiles públicas sí.
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/api/", "/*/admin"],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
