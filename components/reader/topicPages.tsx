import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReaderShell } from "@/components/reader/ReaderShell";
import { CoverSheet } from "@/components/reader/CoverSheet";
import { ChapterSheet } from "@/components/reader/ChapterSheet";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { TopicReader } from "@/components/topic/TopicReader";
import { TopicCover, type CoverCard } from "@/components/topic/TopicCover";
import { bookRound } from "@/lib/interviewBook";
import { chapterMetas, chapters, exercisesForChapter, notesData, notesHref } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { curriculumNotes, levels, levelsNav, relatedInterviewRound, topic } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";
import { plural } from "@/lib/format";
import { withHeadingIds } from "@/lib/headingToc";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";

export function TopicCoverPage({ topicId }: { topicId: string }) {
  const basePath = notesHref(topicId);
  const stats = topicStats()[topicId];

  if (stats && stats.written > 0) {
    const t = topic(topicId);
    const data = notesData(topicId);
    const cards: CoverCard[] = chapterMetas(topicId).map((c) => ({
      id: c.id,
      num: c.num,
      title: c.title,
      short: c.short,
      subtitle: c.subtitle,
      levels: c.levels.length ? c.levels : (["beginner"] as LevelId[]),
      minutes: c.readMinutes,
      ready: c.ready,
      exercises: c.practice.length,
    }));
    const parts: SeriesPart<LevelId>[] = levels(topicId).map((l) => ({ level: l.id, title: l.name, blurb: l.blurb }));
    const roundId = relatedInterviewRound(topicId);
    const round = roundId ? bookRound(roundId) : null;

    return (
      <TopicCover
        topicId={topicId}
        topicName={t?.name || data.meta.title}
        mark={t?.mark || ""}
        accent={t?.accent || "ink"}
        basePath={basePath}
        lead={data.meta.lead}
        parts={parts}
        cards={cards}
        relatedRoundHref={round ? `/interview/${roundId}` : null}
        relatedRoundLabel={round ? `${round.code} · ${round.navTitle}` : null}
        curriculumNotes={curriculumNotes(topicId)}
      />
    );
  }

  const data = notesData(topicId);

  return (
    <ReaderShell
      topicId={topicId}
      levels={levelsNav(topicId)}
      chapters={chapterMetas(topicId)}
      basePath={basePath}
      activeId={null}
    >
      <HashRedirect basePath={basePath} />
      <CoverSheet data={data} basePath={basePath} topicId={topicId} />
    </ReaderShell>
  );
}

export function topicChapterParams(topicId: string) {
  return chapters(topicId).map((ch) => ({ chapter: ch.id }));
}

export function topicCoverMetadata(topicId: string): Metadata {
  const t = topic(topicId);
  const data = notesData(topicId);
  const all = chapters(topicId);
  const written = all.filter((c) => c.ready).length;
  const name = t?.name || data.meta.title;

  const description = written
    ? `${data.meta.subtitle} ${plural(written, "chapter")} written, free to read.`
    : `${data.meta.subtitle} Still an outline — ${plural(all.length, "chapter")} planned.`;

  return pageMetadata({
    title: name,
    description: description.trim(),
    path: notesHref(topicId),
    index: written > 0,
  });
}

export function topicChapterMetadata(topicId: string, chapterId: string): Metadata {
  const list = chapters(topicId);
  const ch = list.find((c) => c.id === chapterId);
  if (!ch) return {};

  const t = topic(topicId);
  const data = notesData(topicId);
  const name = t?.name || data.meta.title;
  const description = ch.subtitle || `${ch.title} — part of ${data.meta.title}.`;

  return pageMetadata({
    title: `${ch.title} — ${name}`,
    description,
    path: `${notesHref(topicId)}/${ch.id}`,
    type: "article",
    index: ch.ready,
    authors: data.meta.author ? [data.meta.author] : undefined,
  });
}

export function TopicChapterPage({ topicId, chapterId }: { topicId: string; chapterId: string }) {
  const list = chapters(topicId);
  const index = list.findIndex((c) => c.id === chapterId);
  if (index === -1) notFound();

  const chapter = list[index];
  const prev = list[index - 1];
  const next = list[index + 1];
  const basePath = notesHref(topicId);

  if (chapter.ready) {
    const t = topic(topicId);
    const data = notesData(topicId);
    const { html, toc } = withHeadingIds(chapter.body);
    const diagrams = (chapter.body.match(/<svg[^>]*class="dg"/g) ?? []).length;
    const parts: SeriesPart<LevelId>[] = levelsNav(topicId).map((l) => ({ level: l.id, title: l.name }));
    const cards: SeriesCard<LevelId>[] = chapterMetas(topicId)
      .filter((c) => c.ready)
      .map((c) => ({
        id: c.id,
        num: c.num,
        title: c.title,
        short: c.short,
        subtitle: c.subtitle,
        levels: c.levels.length ? c.levels : (["beginner"] as LevelId[]),
        minutes: c.readMinutes,
      }));
    const exercises = exercisesForChapter(chapter.id, topicId).map((ex) => ({
      id: ex.id,
      title: ex.title,
      testCount: ex.tests.length,
      level: ex.level,
    }));
    const cardIndex = cards.findIndex((c) => c.id === chapter.id);

    return (
      <TopicReader
        topicId={topicId}
        topicName={t?.name || data.meta.title}
        mark={t?.mark || ""}
        accent={t?.accent || "ink"}
        basePath={basePath}
        parts={parts}
        chapter={cards[cardIndex]}
        chapters={cards}
        html={html}
        toc={toc}
        diagrams={diagrams}
        exercises={exercises}
      />
    );
  }

  return (
    <ReaderShell
      topicId={topicId}
      levels={levelsNav(topicId)}
      chapters={chapterMetas(topicId)}
      basePath={basePath}
      activeId={chapter.id}
    >
      <ChapterSheet
        chapter={chapter}
        topicId={topicId}
        basePath={basePath}
        prev={prev && { id: prev.id, short: prev.short }}
        next={next && { id: next.id, short: next.short }}
      />
    </ReaderShell>
  );
}
