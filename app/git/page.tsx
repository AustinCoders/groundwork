import type { Metadata } from "next";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { SeriesLanding } from "@/components/series/SeriesLanding";
import { GIT_CHAPTERS, GIT_HERO_FIGURE, GIT_PARTS } from "@/content/git-body";
import { GIT_BASE, GIT_PROGRESS_PREFIX, gitCards, gitFacts } from "@/lib/gitSeries";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Git",
  description: `Git from first commit to reflog rescue, in ${GIT_CHAPTERS.length} chapters — the mental model, the everyday commands, working in a team, and how to undo anything without panic.`,
  path: GIT_BASE,
});

export default function GitPage() {
  return (
    <>
      <HashRedirect basePath={GIT_BASE} />
      <SeriesLanding
        crumb="Git"
        kicker="A working reference · fresher to senior"
        title="Git, from first commit to reflog rescue"
        lead="Most people learn Git as a list of commands to memorise, and that breaks the moment something goes wrong. This guide teaches the model underneath — commits are nodes in a graph, branches are labels pointing at them — and everything else follows from it."
        figureHtml={GIT_HERO_FIGURE}
        facts={gitFacts()}
        parts={GIT_PARTS}
        chapters={gitCards()}
        basePath={GIT_BASE}
        progressPrefix={GIT_PROGRESS_PREFIX}
      />
    </>
  );
}
