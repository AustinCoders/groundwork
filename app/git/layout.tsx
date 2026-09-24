import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { GIT_SECTIONS } from "@/content/git-body";

export const metadata: Metadata = pageMetadata({
  title: "Git",
  description: `Git from first commit to reflog rescue, in ${GIT_SECTIONS.length} sections — the mental model, the everyday commands, and how to undo anything without panic.`,
  path: "/git",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
