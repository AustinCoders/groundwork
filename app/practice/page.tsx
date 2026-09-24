import type { Metadata } from "next";
import PracticeClient from "./PracticeClient";
import { pageMetadata } from "@/lib/metadata";
import { practiceChapterLinks } from "@/lib/practiceLinks";

// Static metadata on purpose. Deriving the title from ?id= made this a server
// render on every visit for a page whose HTML never varies; PracticeClient sets
// the per-exercise title on the client instead. Every exercise also has its own
// prerendered page at /problems/<id>, which is the one search results point at.
export const metadata: Metadata = pageMetadata({
  title: "Playground",
  description: "Write JavaScript, TypeScript, Python or SQL in the browser, run it, and check it against real tests.",
  path: "/practice",
});

export default function PracticePage() {
  return <PracticeClient chapterLinks={practiceChapterLinks()} />;
}
