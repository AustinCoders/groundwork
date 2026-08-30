import type { MetadataRoute } from "next";
import { topics, notesHref, chapters } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/practice`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics()
    .filter((t) => t.status === "ready")
    .map((t) => {
      // A topic with written chapters is worth more to a crawler than an
      // empty shelf, so weight priority by how much is actually readable.
      const chs = chapters(t.id);
      const written = chs.filter((c) => c.ready).length;
      return {
        url: `${SITE_URL}${notesHref(t.id)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: written > 0 ? 0.9 : 0.4,
      };
    });

  return [...staticRoutes, ...topicRoutes];
}
