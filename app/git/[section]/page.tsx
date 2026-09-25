import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterView } from "@/components/series/ChapterView";
import { GIT_CHAPTERS, GIT_PARTS } from "@/content/git-body";
import { GIT_BASE, GIT_PROGRESS_PREFIX, gitCards } from "@/lib/gitSeries";
import { withHeadingIds } from "@/lib/headingToc";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return GIT_CHAPTERS.map((s) => ({ section: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const s = GIT_CHAPTERS.find((c) => c.id === section);
  if (!s) return {};
  return pageMetadata({
    title: `${s.title} · Git`,
    description: s.subtitle || `${s.title}: part of the Git guide, fresher to senior.`,
    path: `${GIT_BASE}/${s.id}`,
    type: "article",
  });
}

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const index = GIT_CHAPTERS.findIndex((s) => s.id === section);
  if (index === -1) notFound();
  const s = GIT_CHAPTERS[index];
  const { html, toc } = withHeadingIds(s.body);
  const cards = gitCards();
  return (
    <ChapterView
      seriesTitle="Git"
      homeLabel="All Git chapters"
      parts={GIT_PARTS}
      progressPrefix={GIT_PROGRESS_PREFIX}
      basePath={GIT_BASE}
      chapter={cards[index]}
      html={html}
      toc={toc}
      chapters={cards}
      diagrams={(s.body.match(/<svg[^>]*class="dg"/g) ?? []).length}
    />
  );
}
