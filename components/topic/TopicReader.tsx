"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import {
  activateScripts,
  enhanceCodeBlocks,
  enhanceTables,
  enhanceTryBlocks,
  markNoSmooth,
} from "@/components/reader/enhancements";
import { makeScrollRegions } from "@/components/reader/scrollRegions";
import { setupNarration } from "@/components/reader/narration";
import { PracticeStrip, type PracticeLink } from "@/components/reader/PracticeStrip";
import { quizStore } from "@/lib/quizStore";
import { progress, REVIEW_GAPS_DAYS } from "@/lib/storage";
import { requiresCheck, tickHref, type Completion } from "@/lib/completion";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { ChapterEnd } from "@/components/chapter/ChapterEnd";
import { ChapterHeaderPager } from "@/components/chapter/ChapterHeaderPager";
import { ChapterPager } from "@/components/chapter/ChapterPager";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChapterSearch } from "@/components/chapter/ChapterSearch";
import { useChapterSearch } from "@/components/chapter/useChapterSearch";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart, TocItem } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";
import styles from "@/components/series/chapter.module.css";
import { CodeLanguageSwitch } from "@/components/dsa/CodeLanguageSwitch";
import type { BodySegment } from "@/lib/chapterIslands";
import readerStyles from "./reader.module.css";

export function TopicReader({
  topicId,
  topicName,
  mark,
  accent,
  basePath,
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
}: {
  topicId: string;
  topicName: string;
  mark: string;
  accent: string;
  basePath: string;
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
}) {
  const mounted = useMounted();
  const [railOpen, setRailOpen] = useState(false);
  const sheetSearchInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRail = useCallback(() => setRailOpen(false), []);

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
  const isDone = done.has(chapter.id);
  const toggleRead = () => {
    if (isDone && requiresCheck(completion)) quizStore.unmark(chapter.id);
    progress.setChapterDone(chapter.id, !isDone);
  };
  const tick = tickHref(completion, basePath, chapter.id, true, isDone, (checkChapterIds ?? []).includes(chapter.id));

  const reviews = useProgressValue(() => {
    const mark = progress.all().chapters[chapter.id];
    return mark && mark !== true ? mark.reviews : 0;
  }, 0);
  const reviewDays = mounted && isDone && reviews < REVIEW_GAPS_DAYS.length ? REVIEW_GAPS_DAYS[reviews] : undefined;

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    activateScripts(el);
    enhanceCodeBlocks(el);
    enhanceTables(el);
    enhanceTryBlocks(el);
    markNoSmooth(el);
    const stopNarration = setupNarration(el.parentElement ?? el);
    const stopScrollRegions = makeScrollRegions(el);
    return () => {
      stopNarration();
      stopScrollRegions();
    };
  }, [chapter.id]);

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

  return (
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      back={{ href: basePath, label: topicName }}
      reading
      layout="reader"
      skip={{ label: "Skip to the chapter", href: `#${chapter.id}` }}
      scan={chapter.id}
      actions={
        <>
          <ChaptersSheetButton open={railOpen} onOpen={() => setRailOpen(true)} />
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href={basePath}>{topicName}</Link>
            <span aria-hidden="true">/</span>
            <span>{part?.title}</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{chapter.num}</span>
          </nav>
          <ChapterHeaderPager index={index} total={chapters.length} prev={prev} next={next} basePath={basePath} />
        </>
      }
    >
      <div className={`${styles.page} ${readerStyles.page}`}>
        <div className={styles.body}>
          <aside className={styles.left}>
            <ChapterRail
              parts={parts}
              chapters={chapters}
              chapter={chapter}
              basePath={basePath}
              homeLabel="The cover"
              done={done}
              mounted={mounted}
              openParts={openParts}
              onTogglePart={togglePart}
              onNavigate={closeRail}
              searching={search.searching}
              matchInfo={search.matches}
              search={
                <ChapterSearch
                  value={search.query}
                  onChange={search.setQuery}
                  matches={search.matches}
                  otherMatches={search.otherMatches}
                  chapterIds={chapters.map((c) => c.id)}
                  basePath={basePath}
                  inputRef={search.searchInputRef}
                />
              }
            />
          </aside>

          <div className={styles.main}>
            <article
              className={`chapter${isDone ? " is-done" : ""} ${styles.article} ${readerStyles.article}`}
              id={chapter.id}
            >
              <header className={styles.head}>
                <p className={styles.kicker}>
                  Part {partIndex + 1} · {part?.title}
                </p>
                <div className={styles.titleRow}>
                  <span className={styles.badge} aria-hidden="true">
                    {chapter.num}
                  </span>
                  <h1 className={styles.title}>{chapter.title}</h1>
                </div>
                {chapter.subtitle && <p className={styles.subtitle}>{chapter.subtitle}</p>}
                <div className={styles.meta}>
                  <span>{chapter.minutes} min read</span>
                  <span>
                    {diagrams} {diagrams === 1 ? "diagram" : "diagrams"}
                  </span>
                  <span>{toc.length} sections</span>
                  <span>
                    {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
                  </span>
                  <button className={`${styles.chip} listenbtn`} type="button" data-listen={chapter.id}>
                    🔊 Listen
                  </button>
                  {codeBlocks && <CodeLanguageSwitch chapterId={chapter.id} bodyRef={bodyRef} />}
                </div>
              </header>

              {toc.length > 0 && (
                <details className={`${styles.inlineToc} ${readerStyles.inlineToc}`}>
                  <summary>On this page</summary>
                  <ol>
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`}>{t.text}</a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              {segments ? (
                <div key="segments" id="chapters" ref={bodyRef} className={styles.content} suppressHydrationWarning>
                  {segments.map((segment, i) =>
                    segment.kind === "island" ? (
                      <Fragment key={i}>{islands?.[i]}</Fragment>
                    ) : (
                      <div
                        key={i}
                        className={readerStyles.segment}
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: segment.html }}
                      />
                    )
                  )}
                </div>
              ) : (
                <div
                  key="html"
                  id="chapters"
                  ref={bodyRef}
                  className={styles.content}
                  suppressHydrationWarning
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}

              <PracticeStrip
                exercises={exercises}
                topicId={topicId}
                level={chapter.levels[0]}
                levelTotal={levelExerciseTotal}
              />

              {check}

              <ChapterEnd
                num={chapter.num}
                read={mounted && isDone}
                readCount={mounted ? done.size : 0}
                total={chapters.length}
                onToggleRead={toggleRead}
                reviewDays={reviewDays}
                tickHref={tick}
              />

              <ChapterPager prev={prev} next={next} basePath={basePath} homeLabel="The cover" />
            </article>
          </div>

          <TocCard
            toc={toc}
            active={active}
            pct={pct}
            read={mounted && isDone}
            onToggleRead={toggleRead}
            tickHref={tick}
          />
        </div>
      </div>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        <ChapterRail
          parts={parts}
          chapters={chapters}
          chapter={chapter}
          basePath={basePath}
          homeLabel="The cover"
          done={done}
          mounted={mounted}
          openParts={openParts}
          onTogglePart={togglePart}
          onNavigate={closeRail}
          searching={search.searching}
          matchInfo={search.matches}
          navListId="nav-list-sheet"
          search={
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
          }
        />
      </ChaptersSheet>
    </TopicFrame>
  );
}
