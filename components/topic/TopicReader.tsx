"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CodeLanguageNote } from "@/components/dsa/CodeLanguageNote";
import { EndPopup } from "@/components/check/EndPopup";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { useChapterBody } from "@/components/reader/useChapterBody";
import { quizStore } from "@/lib/quizStore";
import { useChapterStates } from "@/lib/useChapterStates";
import { progress, REVIEW_GAPS_DAYS } from "@/lib/storage";
import { requiresCheck, tickHref, type Completion } from "@/lib/completion";
import { writeResume } from "@/lib/resume";
import { useMounted, useProgressValue } from "@/lib/hooks";
import {
  ChapterCrumbs,
  ChapterEndScene,
  ChapterHeaderPager,
  ChapterHero,
  ChapterInlineToc,
  ChapterPractice,
  codeLabelFor,
  Prose,
  ReaderLayout,
  ReadingColumn,
  type PracticeLink,
} from "@/components/chapter/ChapterKit";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChapterSearch } from "@/components/chapter/ChapterSearch";
import { useChapterSearch } from "@/components/chapter/useChapterSearch";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart, TocItem } from "@/components/chapter/types";
import type { BodySegment } from "@/lib/chapterIslands";
import type { LevelId } from "@/content/types";

const CodeLanguageSwitch = dynamic(() =>
  import("@/components/dsa/CodeLanguageSwitch").then((module) => module.CodeLanguageSwitch)
);

export function TopicReader({
  topicId,
  topicName,
  mark,
  accent,
  basePath,
  homeHref,
  parts,
  chapter,
  chapters,
  html,
  segments,
  islands,
  toc,
  diagrams,
  exercises,
  levelExerciseTotal,
  completion,
  check,
  checkChapterIds,
  codeBlocks,
  unwritten = 0,
}: {
  topicId: string;
  topicName: string;
  mark: string;
  accent: string;
  basePath: string;
  homeHref?: string;
  parts: SeriesPart<LevelId>[];
  chapter: SeriesCard<LevelId>;
  chapters: SeriesCard<LevelId>[];
  html: string;
  segments?: BodySegment[];
  islands?: ReactNode[];
  toc: TocItem[];
  diagrams: number;
  exercises: PracticeLink[];
  levelExerciseTotal: number;
  completion?: Completion;
  check?: ReactNode;
  checkChapterIds?: string[];
  codeBlocks?: boolean;
  unwritten?: number;
}) {
  const mounted = useMounted();
  const [railOpen, setRailOpen] = useState(false);
  const sheetSearchInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useChapterBody(chapter.id);
  const closeRail = useCallback(() => setRailOpen(false), []);

  const home = homeHref ?? basePath;
  const homeLabel = home === basePath ? "The cover" : "Levels and plan";
  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const partIndex = parts.findIndex((p) => p.level === chapter.levels[0]);
  const part = parts[partIndex];

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const states = useChapterStates(completion, chapters, checkChapterIds, done);
  const isDone = done.has(chapter.id);
  const toggleRead = () => {
    if (isDone && requiresCheck(completion)) quizStore.unmark(chapter.id);
    progress.setChapterDone(chapter.id, !isDone);
  };
  const hasCheck = (checkChapterIds ?? []).includes(chapter.id);
  const noCheck = requiresCheck(completion) && !hasCheck;
  const tick = tickHref(completion, basePath, chapter.id, true, isDone, hasCheck);

  const reviews = useProgressValue(() => {
    const mark = progress.all().chapters[chapter.id];
    return mark && mark !== true ? mark.reviews : 0;
  }, 0);
  const reviewDays = mounted && isDone && reviews < REVIEW_GAPS_DAYS.length ? REVIEW_GAPS_DAYS[reviews] : undefined;

  useEffect(() => {
    writeResume({
      topic: topicId,
      topicName,
      chapter: chapter.id,
      num: chapter.num,
      title: chapter.short ?? chapter.title,
      href: `${basePath}/${chapter.id}`,
      index: index + 1,
      total: chapters.length,
    });
  }, [topicId, topicName, chapter.id, chapter.num, chapter.short, chapter.title, basePath, index, chapters.length]);

  const { active, pct } = useActiveHeading(toc);

  const search = useChapterSearch({ topicId, basePath, chapters });

  useChapterKeys({
    prevHref: prev && `${basePath}/${prev.id}`,
    nextHref: next && `${basePath}/${next.id}`,
    onSlash: () => {
      search.searchInputRef.current?.focus();
      search.searchInputRef.current?.select();
    },
  });

  const { openParts, togglePart } = useRailParts(chapter);

  const rail = (extra: { navListId?: string; search: React.ReactNode }) => (
    <ChapterRail
      parts={parts}
      chapters={chapters}
      chapter={chapter}
      basePath={basePath}
      homeHref={home}
      homeLabel={homeLabel}
      done={done}
      mounted={mounted}
      states={states}
      openParts={openParts}
      onTogglePart={togglePart}
      onNavigate={closeRail}
      searching={search.searching}
      matchInfo={search.matches}
      navListId={extra.navListId}
      search={extra.search}
      unwritten={unwritten}
    />
  );

  return (
    <TopicFrame
      topic={{ name: topicName, href: home, mark, accent }}
      back={{ href: home, label: topicName }}
      reading
      layout="reader"
      skip={{ label: "Skip to the chapter", href: `#${chapter.id}` }}
      scan={chapter.id}
      actions={
        <>
          <ChaptersSheetButton open={railOpen} onOpen={() => setRailOpen(true)} />
          <ChapterCrumbs href={home} label={topicName} part={part?.title} num={chapter.num} />
          <ChapterHeaderPager index={index} total={chapters.length} prev={prev} next={next} basePath={basePath} />
        </>
      }
    >
      <ReaderLayout
        accent={accent}
        rail={rail({
          search: (
            <ChapterSearch
              value={search.query}
              onChange={search.setQuery}
              matches={search.matches}
              otherMatches={search.otherMatches}
              chapterIds={chapters.map((c) => c.id)}
              basePath={basePath}
              inputRef={search.searchInputRef}
            />
          ),
        })}
        aside={
          <TocCard
            toc={toc}
            active={active}
            pct={pct}
            read={mounted && isDone}
            onToggleRead={toggleRead}
            tickHref={tick}
          />
        }
      >
        <ReadingColumn id={chapter.id} read={isDone}>
          <ChapterHero
            mark={mark}
            num={chapter.num}
            partLabel={`Part ${partIndex + 1} · ${part?.title}`}
            title={chapter.title}
            subtitle={chapter.subtitle}
            facts={[
              `${chapter.minutes} min read`,
              ...(diagrams ? [`${diagrams} ${diagrams === 1 ? "diagram" : "diagrams"}`] : []),
              `${toc.length} sections`,
              `${exercises.length} ${exercises.length === 1 ? "exercise" : "exercises"}`,
            ]}
            listenId={chapter.id}
            learn={toc.map((t) => t.text)}
            minutes={chapter.minutes}
            position={{ index: index + 1, total: chapters.length }}
            read={mounted && isDone}
            extra={
              codeBlocks ? (
                <CodeLanguageSwitch chapterId={chapter.id} bodyRef={bodyRef} />
              ) : topicId === "dsa" ? (
                <CodeLanguageNote />
              ) : undefined
            }
          />

          {toc.length > 0 && <ChapterInlineToc toc={toc} />}

          <Prose
            id="chapters"
            html={html}
            segments={segments}
            islands={islands}
            bodyRef={bodyRef}
            codeLabel={codeLabelFor(topicId)}
          />

          <ChapterPractice
            exercises={exercises}
            topicId={topicId}
            level={chapter.levels[0]}
            levelTotal={levelExerciseTotal}
          />

          {check}

          <EndPopup
            key={chapter.id}
            chapterId={chapter.id}
            title={chapter.title}
            done={isDone}
            hasCheck={requiresCheck(completion) && hasCheck}
          />

          <ChapterEndScene
            num={chapter.num}
            finish={{
              num: chapter.num,
              read: mounted && isDone,
              readCount: mounted ? done.size : 0,
              total: chapters.length,
              onToggleRead: toggleRead,
              reviewDays,
              note: noCheck ? "There is no check for this chapter yet, so marking it read is all it takes." : undefined,
              tickHref: tick,
            }}
            prev={prev}
            next={next}
            basePath={basePath}
            homeHref={home}
            homeLabel={homeLabel}
          />
        </ReadingColumn>
      </ReaderLayout>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        {rail({
          navListId: "nav-list-sheet",
          search: (
            <ChapterSearch
              id="search-sheet"
              value={search.query}
              onChange={search.setQuery}
              matches={search.matches}
              otherMatches={search.otherMatches}
              chapterIds={chapters.map((c) => c.id)}
              basePath={basePath}
              inputRef={sheetSearchInputRef}
            />
          ),
        })}
      </ChaptersSheet>
    </TopicFrame>
  );
}
