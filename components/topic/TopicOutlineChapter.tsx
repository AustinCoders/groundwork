"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { ChapterHeaderPager } from "@/components/chapter/ChapterHeaderPager";
import { ChapterPager } from "@/components/chapter/ChapterPager";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";
import styles from "@/components/series/chapter.module.css";
import readerStyles from "./reader.module.css";

const NO_DONE = new Set<string>();

export function TopicOutlineChapter({
  topicName,
  mark,
  accent,
  basePath,
  parts,
  chapter,
  chapters,
  sectionTitle,
  items,
  relatedHref,
  relatedLabel,
  relatedRoundHref,
  relatedRoundLabel,
}: {
  topicName: string;
  mark: string;
  accent: string;
  basePath: string;
  parts: SeriesPart<LevelId>[];
  chapter: SeriesCard<LevelId>;
  chapters: SeriesCard<LevelId>[];
  sectionTitle: string;
  items: string[];
  relatedHref: string;
  relatedLabel: string;
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
}) {
  const [railOpen, setRailOpen] = useState(false);
  const closeRail = useCallback(() => setRailOpen(false), []);

  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const partIndex = parts.findIndex((p) => p.level === chapter.levels[0]);
  const part = parts[partIndex];

  useChapterKeys({
    prevHref: prev && `${basePath}/${prev.id}`,
    nextHref: next && `${basePath}/${next.id}`,
  });

  const { openParts, togglePart } = useRailParts(chapter);

  const rail = (
    <ChapterRail
      parts={parts}
      chapters={chapters}
      chapter={chapter}
      basePath={basePath}
      homeLabel="The cover"
      done={NO_DONE}
      mounted={false}
      openParts={openParts}
      onTogglePart={togglePart}
      onNavigate={closeRail}
    />
  );

  return (
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      back={{ href: basePath, label: topicName }}
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
          <aside className={styles.left}>{rail}</aside>

          <main className={styles.main}>
            <article className={`${styles.article} ${readerStyles.article}`} id={chapter.id}>
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
                <p className={readerStyles.status}>Not written yet.</p>
              </header>

              <section className={readerStyles.roadmap} aria-labelledby={`${chapter.id}-roadmap`}>
                <p className={readerStyles.roadmapKicker}>This chapter will cover</p>
                <h2 id={`${chapter.id}-roadmap`} className={readerStyles.roadmapTitle}>
                  {sectionTitle}
                </h2>
                <ul className={readerStyles.roadmapList}>
                  {items.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </section>

              <ChapterPager prev={prev} next={next} basePath={basePath} homeLabel="The cover" />
            </article>
          </main>

          <aside className={styles.right} aria-label="Meanwhile">
            <div className={styles.rightInner}>
              <section className={readerStyles.meanwhile}>
                <p className={readerStyles.meanwhileKicker}>Meanwhile</p>
                <Link className={readerStyles.meanwhileLink} href={relatedHref}>
                  {relatedLabel} is written — start there
                </Link>
                {relatedRoundHref && relatedRoundLabel && (
                  <Link className={readerStyles.meanwhileLink} href={relatedRoundHref}>
                    {relatedRoundLabel} covers this in the interview book
                  </Link>
                )}
              </section>
            </div>
          </aside>
        </div>
      </div>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        <ChapterRail
          parts={parts}
          chapters={chapters}
          chapter={chapter}
          basePath={basePath}
          homeLabel="The cover"
          done={NO_DONE}
          mounted={false}
          openParts={openParts}
          onTogglePart={togglePart}
          onNavigate={closeRail}
          navListId="nav-list-sheet"
        />
      </ChaptersSheet>
    </TopicFrame>
  );
}
