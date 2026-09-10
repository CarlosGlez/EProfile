import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { listPublishedSlugs } from "@/lib/public-profile";

// Sitemap dinámico: la portada + una entrada por cada EProfile publicada.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const slugs = await listPublishedSlugs();

  return [
    {
      url: site,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...slugs.map((s) => ({
      url: `${site}/${s.slug}`,
      lastModified: s.published_at ? new Date(s.published_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
