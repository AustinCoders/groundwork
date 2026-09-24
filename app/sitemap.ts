import type { MetadataRoute } from "next";
import { topics, notesHref, chapterHref, chapters } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Only pages with something on them. A topic that is still an outline has a
 * cover and a syllabus but no chapters, and its chapter routes render "not
 * written yet" — listing 358 of those alongside 201 real ones taught Google
 * that most of the site is empty. Both are left out here and carry a noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/practice`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = [];
  const levelRoutes: MetadataRoute.Sitemap = [];
  const chapterRoutes: MetadataRoute.Sitemap = [];

  topics()
    .filter((t) => t.status === "ready")
    .forEach((t) => {
      const written = chapters(t.id).filter((c) => c.ready);
      // A single-page topic such as Git has no chapter list of its own; its
      // cover is the whole thing, so it belongs here on its own merits.
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

  return [...staticRoutes, ...topicRoutes, ...levelRoutes, ...chapterRoutes];
}
