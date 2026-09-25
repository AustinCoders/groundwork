import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicChapterMetadata, topicChapterParams } from "@/components/reader/topicPages";
import { chapterMetas, chapters, notesHref } from "@/lib/content";
import { ChapterView } from "@/components/series/ChapterView";
import { withHeadingIds } from "@/lib/headingToc";
import { ARCH_PARTS } from "@/lib/architectureParts";
import type { ChapterCard } from "../ArchitectureView";

const TOPIC = "architecture";

export function generateStaticParams() {
  return topicChapterParams(TOPIC);
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  return topicChapterMetadata(TOPIC, chapter);
}

export default async function Page({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: id } = await params;
  const list = chapters(TOPIC);
  const index = list.findIndex((c) => c.id === id);
  if (index === -1) notFound();
  const chapter = list[index];
  const { html, toc } = withHeadingIds(chapter.body);
  const cards: ChapterCard[] = chapterMetas(TOPIC).map((c) => ({
    id: c.id,
    num: c.num,
    title: c.title,
    short: c.short,
    subtitle: c.subtitle ?? "",
    level: (c.levels?.[0] ?? "beginner") as ChapterCard["level"],
    minutes: c.readMinutes,
  }));
  return (
    <ChapterView
      seriesTitle="How this is built"
      homeLabel="The system map"
      parts={ARCH_PARTS}
      basePath={notesHref(TOPIC)}
      chapter={cards[index]}
      html={html}
      toc={toc}
      chapters={cards}
      diagrams={(chapter.body.match(/<svg[^>]*class="dg"/g) ?? []).length}
    />
  );
}
