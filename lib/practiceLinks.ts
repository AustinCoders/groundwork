import { chapterMetas, notesHref, topics } from "@/lib/content";
import type { ChapterLink } from "@/app/practice/PracticeClient";

export function practiceChapterLinks(): Record<string, ChapterLink> {
  const links: Record<string, ChapterLink> = {};
  topics().forEach((t) => {
    if (!t.levels) return;
    const base = notesHref(t.id);
    chapterMetas(t.id).forEach((ch) => {
      links[ch.id] = { id: ch.id, num: ch.num, short: ch.short, href: `${base}/${ch.id}` };
    });
  });
  return links;
}

export function problemHref(exerciseId: string): string {
  return `/problems/${exerciseId}`;
}
