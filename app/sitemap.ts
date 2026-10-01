import type { MetadataRoute } from "next";
import { topics, notesData, notesHref, chapterHref, chapters, exercises } from "@/lib/content";
import { problemHref } from "@/lib/practiceLinks";
import { SITE_URL, UNDATED_CONTENT_LAST_CHANGED } from "@/lib/site";
import { GIT_CHAPTERS } from "@/content/git-body";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function topicLastModified(topicId: string): Date {
  const updated = notesData(topicId).meta.updated;
  const match = /^(\w+)\s+(\d{4})$/.exec(updated);
  const month = match ? MONTH_NAMES.indexOf(match[1].toLowerCase()) : -1;
  if (month === -1) return new Date(UNDATED_CONTENT_LAST_CHANGED);
  return new Date(Date.UTC(Number(match![2]), month, 1));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const stale = new Date(UNDATED_CONTENT_LAST_CHANGED);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: stale, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: stale, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mock`, lastModified: stale, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/interview/questions`, lastModified: stale, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: stale, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/whiteboard`, lastModified: stale, changeFrequency: "monthly", priority: 0.5 },
    ...GIT_CHAPTERS.map((s) => ({
      url: `${SITE_URL}/git/${s.id}`,
      lastModified: stale,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const problemRoutes: MetadataRoute.Sitemap = exercises().map((ex) => ({
    url: `${SITE_URL}${problemHref(ex.id)}`,
    lastModified: stale,
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
      const lastModified = topicLastModified(t.id);

      topicRoutes.push({
        url: `${SITE_URL}${notesHref(t.id)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      if (t.levels && written.length) {
        levelRoutes.push({
          url: `${SITE_URL}/level/${t.id}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }

      written.forEach((ch) => {
        chapterRoutes.push({
          url: `${SITE_URL}${chapterHref(t.id, ch.id)}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    });

  return [...staticRoutes, ...topicRoutes, ...levelRoutes, ...chapterRoutes, ...problemRoutes];
}
