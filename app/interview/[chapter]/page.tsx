import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicChapterMetadata } from "@/components/reader/topicPages";
import { RoundView } from "@/app/interview/[chapter]/RoundView";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import { bookRounds, PARTS } from "@/lib/interviewBook";
import { frameTopic } from "@/lib/topics";

export function generateStaticParams() {
  return bookRounds().map((r) => ({ chapter: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  return topicChapterMetadata("interview", chapter);
}

export default async function Page({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  const rounds = bookRounds();
  const index = rounds.findIndex((r) => r.id === chapter);
  if (index === -1) notFound();
  const round = rounds[index];
  const parts: SeriesPart<string>[] = PARTS.map((p) => ({ level: p.id, title: p.title, blurb: p.blurb }));
  const cards: SeriesCard<string>[] = rounds.map((r) => ({
    id: r.id,
    num: r.code,
    title: r.navTitle,
    short: r.navTitle,
    subtitle: "",
    levels: [r.part],
    minutes: r.minutes,
  }));
  const partIndex = PARTS.findIndex((p) => p.id === round.part);
  return (
    <RoundView
      topic={frameTopic("interview", "/interview")}
      round={round}
      partIndex={partIndex}
      partTitle={PARTS[partIndex]?.title ?? ""}
      parts={parts}
      cards={cards}
    />
  );
}
