import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicChapterMetadata, topicChapterParams } from "@/components/reader/topicPages";
import { chapterMetas, chapters, notesHref } from "@/lib/content";
import { ChapterView, type TocItem } from "./ChapterView";
import type { ChapterCard } from "../ArchitectureView";

const TOPIC = "architecture";

export function generateStaticParams() {
  return topicChapterParams(TOPIC);
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  return topicChapterMetadata(TOPIC, chapter);
}

function slug(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>();
  const out = html.replace(/<h3>([\s\S]*?)<\/h3>/g, (_, inner: string) => {
    let id = slug(inner) || "section";
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    const text = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&rarr;/g, "→")
      .replace(/&mdash;/g, "—")
      .replace(/&middot;/g, "·")
      .replace(/&[a-z]+;/g, " ")
      .trim();
    toc.push({ id, text });
    return `<h3 id="${id}">${inner}</h3>`;
  });
  return { html: out, toc };
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
      basePath={notesHref(TOPIC)}
      chapter={cards[index]}
      html={html}
      toc={toc}
      chapters={cards}
      diagrams={(chapter.body.match(/<svg[^>]*class="dg"/g) ?? []).length}
    />
  );
}
