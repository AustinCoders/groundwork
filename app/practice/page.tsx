import type { Metadata } from "next";
import PracticeClient, { type ChapterLink } from "./PracticeClient";
import { chapterMetas, notesHref, topics } from "@/lib/content";

// Static metadata on purpose. Deriving the title from ?id= made this a server
// render on every visit for a page whose HTML never varies; PracticeClient sets
// the per-exercise title on the client instead.
export const metadata: Metadata = { title: "Playground — practice" };

export default function PracticePage() {
  const chapterLinks: Record<string, ChapterLink> = {};
  topics().forEach((t) => {
    if (!t.levels) return;
    const base = notesHref(t.id);
    chapterMetas(t.id).forEach((ch) => {
      chapterLinks[ch.id] = { id: ch.id, num: ch.num, short: ch.short, href: `${base}/${ch.id}` };
    });
  });

  return <PracticeClient chapterLinks={chapterLinks} />;
}
