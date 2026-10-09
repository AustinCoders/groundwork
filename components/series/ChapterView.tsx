"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
import {
  activateScripts,
  enhanceCodeBlocks,
  enhanceTables,
  enhanceTryBlocks,
  markNoSmooth,
} from "@/components/reader/enhancements";
import { makeScrollRegions } from "@/components/reader/scrollRegions";
import { setupNarration } from "@/components/reader/narration";
import { progress } from "@/lib/storage";
import { writeResume } from "@/lib/resume";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { ChapterEnd } from "@/components/chapter/ChapterEnd";
import { ChapterHeaderPager } from "@/components/chapter/ChapterHeaderPager";
import { ChapterPager } from "@/components/chapter/ChapterPager";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart, TocItem } from "@/components/chapter/types";
import readerStyles from "@/components/topic/reader.module.css";
import styles from "./chapter.module.css";

export function ChapterView({
  topic,
  seriesTitle,
  homeLabel,
  parts: PARTS,
  progressPrefix = "",
  basePath,
  chapter,
  html,
  toc,
  chapters,
  diagrams,
}: {
  topic: FrameTopic;
  seriesTitle: string;
  homeLabel: string;
  parts: SeriesPart<string>[];
  progressPrefix?: string;
  basePath: string;
  chapter: SeriesCard<string>;
  html: string;
  toc: TocItem[];
  chapters: SeriesCard<string>[];
  diagrams: number;
}) {
  const mounted = useMounted();
  const [railOpen, setRailOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRail = useCallback(() => setRailOpen(false), []);

  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const partIndex = PARTS.findIndex((p) => p.level === chapter.levels[0]);
  const part = PARTS[partIndex];

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(progressPrefix + c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const isDone = done.has(chapter.id);
  const toggleRead = () => progress.setChapterDone(progressPrefix + chapter.id, !isDone);

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

  useEffect(() => {
    writeResume({
      topic: basePath.replace(/^\//, ""),
      topicName: topic.name,
      chapter: chapter.id,
      num: chapter.num,
      title: chapter.short ?? chapter.title,
      href: `${basePath}/${chapter.id}`,
      index: index + 1,
      total: chapters.length,
    });
  }, [basePath, topic.name, chapter.id, chapter.num, chapter.short, chapter.title, index, chapters.length]);

  const { active, pct } = useActiveHeading(toc);

  useChapterKeys({
    prevHref: prev && `${basePath}/${prev.id}`,
    nextHref: next && `${basePath}/${next.id}`,
  });

  const { openParts, togglePart } = useRailParts(chapter);

  const rail = (
    <ChapterRail
      parts={PARTS}
      chapters={chapters}
      chapter={chapter}
      basePath={basePath}
      homeLabel={homeLabel}
      done={done}
      mounted={mounted}
      openParts={openParts}
      onTogglePart={togglePart}
      onNavigate={closeRail}
    />
  );

  return (
    <TopicFrame
      topic={topic}
      back={{ href: basePath, label: seriesTitle }}
      reading
      layout="reader"
      skip={{ label: "Skip to the chapter", href: `#${chapter.id}` }}
      scan={chapter.id}
      actions={
        <>
          <ChaptersSheetButton open={railOpen} onOpen={() => setRailOpen(true)} />
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href={basePath}>{seriesTitle}</Link>
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
          <aside className={styles.left} id="arch-rail">
            {rail}
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
                  <button className={`${styles.chip} listenbtn`} type="button" data-listen={chapter.id}>
                    🔊 Listen
                  </button>
                </div>
              </header>

              {toc.length > 2 && (
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

              <div
                ref={bodyRef}
                className={styles.content}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: html }}
              />

              <ChapterEnd
                num={chapter.num}
                read={mounted && isDone}
                readCount={mounted ? done.size : 0}
                total={chapters.length}
                onToggleRead={toggleRead}
              />

              <ChapterPager prev={prev} next={next} basePath={basePath} homeLabel={homeLabel} />
            </article>
          </div>

          <TocCard toc={toc} active={active} pct={pct} read={mounted && isDone} onToggleRead={toggleRead} />
        </div>
      </div>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        {rail}
      </ChaptersSheet>
    </TopicFrame>
  );
}
