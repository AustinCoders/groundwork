import type { Metadata } from "next";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { GIT_CHAPTERS, GIT_HERO_FIGURE, GIT_PARTS } from "@/content/git-body";
import { GIT_BASE, GIT_PROGRESS_PREFIX, gitCards, gitFacts } from "@/lib/gitSeries";
import { pageMetadata } from "@/lib/metadata";
import { frameTopic } from "@/lib/topics";
import { GitView } from "./GitView";

export const metadata: Metadata = pageMetadata({
  title: "Git",
  description: `Git from first commit to reflog rescue, in ${GIT_CHAPTERS.length} chapters — the mental model, the everyday commands, working in a team, and how to undo anything without panic.`,
  path: GIT_BASE,
});

export default function GitPage() {
  return (
    <>
      <HashRedirect basePath={GIT_BASE} />
      <GitView
        topic={frameTopic("git", GIT_BASE)}
        basePath={GIT_BASE}
        progressPrefix={GIT_PROGRESS_PREFIX}
        parts={GIT_PARTS}
        chapters={gitCards()}
        facts={gitFacts()}
        figureHtml={GIT_HERO_FIGURE}
        lead="Most people learn Git as a list of commands, and that breaks the moment something goes wrong. This guide teaches the model underneath: commits are nodes in a graph, and branches are labels pointing at them."
      />
    </>
  );
}
