import type { MetadataRoute } from "next";
import { getAllGameItems } from "@/lib/items-encyclopedia";
import { getLearnMoreSlugs } from "@/lib/learn-more";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const learnSlugs = new Set([
    ...getAllGameItems().map((item) => item.slug),
    ...getLearnMoreSlugs(),
  ]);
  const learnRoutes: MetadataRoute.Sitemap = [...learnSlugs].map((slug) => ({
    url: `${base}/learn/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...learnRoutes];
}
