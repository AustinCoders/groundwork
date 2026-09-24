import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

// /level with no topic is a chooser with nothing chosen; /level/<topic> below it
// sets its own. Only the ones with a topic belong in a search result.
export const metadata: Metadata = pageMetadata({
  title: "Pick your level",
  description: "Where are you with this topic? Pick a level and get a reading path through it.",
  path: "/level",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
