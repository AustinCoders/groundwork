import { chapterMetas, notesHref, topics } from "@/lib/content";
import type { ChapterLink } from "@/app/practice/PracticeClient";

/** Where each chapter lives, for the "back to the chapter" link above an
 *  exercise. Built once and shared by /practice and /problems/[slug]. */
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

/** The canonical page for one exercise. */
export function problemHref(exerciseId: string): string {
  return `/problems/${exerciseId}`;
}
