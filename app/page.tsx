import type { Metadata } from "next";
import { HomeView } from "@/app/HomeView";
import { INTERVIEW_TOTAL_QUESTIONS, INTERVIEW_TOTAL_ROUNDS } from "@/lib/interviewContent";
import { LANG_ORDER, LANGUAGES } from "@/lib/codeLanguages";
import { exercises } from "@/lib/content";
import { onShelf } from "@/lib/topicIds";
import type { TopicNav } from "@/content/types";
import { siteStats, topicStats, topicsNavWithStats } from "@/lib/topicStats";

export const metadata: Metadata = { alternates: { canonical: "/" } };

function hrefFor(t: TopicNav): string {
  if (t.status !== "ready" || t.written === 0) return `/soon?topic=${t.id}`;
  return t.levelIds ? `/level/${t.id}` : `/${(t.notes || "notes.html").replace(/\.html$/, "")}`;
}

export default function HomePage() {
  const perTopic = topicStats();
  const all = topicsNavWithStats();
  const shelf = all.filter((t) => onShelf(t.id));
  const card = (t: (typeof all)[number]) => ({
    id: t.id,
    name: t.name,
    mark: t.mark,
    accent: t.accent,
    tagline: t.tagline,
    href: hrefFor(t),
    chapters: perTopic[t.id]?.written || perTopic[t.id]?.planned || 0,
    exercises: perTopic[t.id]?.exercises ?? 0,
    minutes: perTopic[t.id]?.minutes ?? 0,
  });
  return (
    <HomeView
      stats={siteStats()}
      ready={shelf.filter((t) => t.written > 0).map(card)}
      soon={shelf.filter((t) => t.written === 0).map(card)}
      problems={exercises().length}
      languages={{ total: LANG_ORDER.length, runnable: LANG_ORDER.filter((k) => LANGUAGES[k].runnable).length }}
      interview={{ rounds: INTERVIEW_TOTAL_ROUNDS, questions: INTERVIEW_TOTAL_QUESTIONS }}
    />
  );
}
