import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { topicChapterMetadata } from "@/components/reader/topicPages";
import { RoundView } from "@/app/interview/[chapter]/RoundView";
import { bookRounds, PARTS } from "@/lib/interviewBook";

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
  const link = (i: number) =>
    rounds[i] ? { id: rounds[i].id, code: rounds[i].code, navTitle: rounds[i].navTitle } : null;
  return (
    <RoundView
      round={round}
      partTitle={PARTS.find((p) => p.id === round.part)?.title ?? ""}
      prev={link(index - 1)}
      next={link(index + 1)}
    />
  );
}
