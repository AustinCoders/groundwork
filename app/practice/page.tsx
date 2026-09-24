import type { Metadata } from "next";
import PracticeClient, { type ChapterLink } from "./PracticeClient";
import { chapterMetas, notesHref, topics } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

// Static metadata on purpose. Deriving the title from ?id= made this a server
// render on every visit for a page whose HTML never varies; PracticeClient sets
// the per-exercise title on the client instead.
export const metadata: Metadata = pageMetadata({
  title: "Playground",
  description: "Write JavaScript, TypeScript, Python or SQL in the browser, run it, and check it against real tests.",
  path: "/practice",
});

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
