import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PracticeClient from "@/app/practice/PracticeClient";
import { chapter as findChapter, exercise, exercises, topics } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { practiceChapterLinks } from "@/lib/practiceLinks";

const LEVEL_NAME: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function generateStaticParams() {
  return exercises().map((ex) => ({ slug: ex.id }));
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicOf(chapterId: string): string | null {
  const t = topics().find((x) => x.levels && findChapter(chapterId, x.id));
  return t ? t.name : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ex = exercise(slug);
  if (!ex) return {};

  const topicName = topicOf(ex.chapter);
  const level = LEVEL_NAME[ex.level] || ex.level;
  const brief = plainText(ex.brief);
  const description = `${brief.length > 150 ? `${brief.slice(0, 149).trimEnd()}…` : brief} ${level} · ${ex.tests.length} tests · run it in the browser.`;

  return pageMetadata({
    title: topicName ? `${ex.title} — ${topicName}` : ex.title,
    description,
    path: `/problems/${ex.id}`,
  });
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ex = exercise(slug);
  if (!ex) notFound();
  const all = exercises();
  const index = all.findIndex((e) => e.id === slug);
  const link = (e: (typeof all)[number] | undefined) => (e ? { id: e.id, title: e.title } : null);
  return (
    <PracticeClient
      exercise={ex}
      chapter={practiceChapterLinks()[ex.chapter] ?? null}
      prev={link(all[index - 1])}
      next={link(all[index + 1])}
    />
  );
}
