import type { MetadataRoute } from "next";
import { topics, notesHref, chapterHref, chapters, exercises } from "@/lib/content";
import { problemHref } from "@/lib/practiceLinks";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/practice`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const problemRoutes: MetadataRoute.Sitemap = exercises().map((ex) => ({
    url: `${SITE_URL}${problemHref(ex.id)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const topicRoutes: MetadataRoute.Sitemap = [];
  const levelRoutes: MetadataRoute.Sitemap = [];
  const chapterRoutes: MetadataRoute.Sitemap = [];

  topics()
    .filter((t) => t.status === "ready")
    .forEach((t) => {
      const written = chapters(t.id).filter((c) => c.ready);
      const isSinglePage = !t.levels;
      if (!written.length && !isSinglePage) return;

      topicRoutes.push({
        url: `${SITE_URL}${notesHref(t.id)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      if (t.levels && written.length) {
        levelRoutes.push({
          url: `${SITE_URL}/level/${t.id}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      written.forEach((ch) => {
        chapterRoutes.push({
          url: `${SITE_URL}${chapterHref(t.id, ch.id)}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    });

  return [...staticRoutes, ...topicRoutes, ...levelRoutes, ...chapterRoutes, ...problemRoutes];
}
