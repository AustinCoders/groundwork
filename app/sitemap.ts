import type { MetadataRoute } from "next";
import { topics, notesHref, chapterHref, chapters } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/practice`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = [];
  const chapterRoutes: MetadataRoute.Sitemap = [];

  topics()
    .filter((t) => t.status === "ready")
    .forEach((t) => {
      // A topic with written chapters is worth more to a crawler than an
      // empty shelf, so weight priority by how much is actually readable.
      const chs = chapters(t.id);
      const written = chs.filter((c) => c.ready);
      topicRoutes.push({
        url: `${SITE_URL}${notesHref(t.id)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: written.length > 0 ? 0.9 : 0.4,
      });

      // Each chapter is its own crawlable page — listing them individually
      // is what actually gets them indexed and found by search, rather than
      // relying on the crawler to follow every in-page link from the cover.
      written.forEach((ch) => {
        chapterRoutes.push({
          url: `${SITE_URL}${chapterHref(t.id, ch.id)}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    });

  return [...staticRoutes, ...topicRoutes, ...chapterRoutes];
}
