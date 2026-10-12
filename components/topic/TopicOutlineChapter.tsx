"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import {
  ChapterCrumbs,
  ChapterEndScene,
  ChapterHeaderPager,
  ChapterHero,
  ReaderAside,
  ReaderLayout,
  ReadingColumn,
} from "@/components/chapter/ChapterKit";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";
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
          <ChapterCrumbs href={basePath} label={topicName} part={part?.title} num={chapter.num} />
          <ChapterHeaderPager index={index} total={chapters.length} prev={prev} next={next} basePath={basePath} />
        </>
      }
    >
      <ReaderLayout
        accent={accent}
        rail={rail}
        aside={
          <ReaderAside label="Meanwhile">
            <section className={readerStyles.meanwhile}>
              <Eyebrow no="01" as="p">
                Meanwhile
              </Eyebrow>
              <ul className={kit.rows}>
                <li>
                  <Link className={kit.row} href={relatedHref}>
                    <span className={kit.title}>{relatedLabel} is written, start there</span>
                  </Link>
                </li>
                {relatedRoundHref && relatedRoundLabel && (
                  <li>
                    <Link className={kit.row} href={relatedRoundHref}>
                      <span className={kit.title}>{relatedRoundLabel} covers this in the interview book</span>
                    </Link>
                  </li>
                )}
              </ul>
            </section>
          </ReaderAside>
        }
      >
        <ReadingColumn id={chapter.id}>
          <ChapterHero
            mark={mark}
            num={chapter.num}
            partLabel={`Part ${partIndex + 1} · ${part?.title}`}
            title={chapter.title}
            facts={[]}
            position={{ index: index + 1, total: chapters.length }}
            status="Not written yet."
          />

          <section className={readerStyles.roadmap} aria-labelledby={`${chapter.id}-roadmap`}>
            <Eyebrow no="01" as="p">
              This chapter will cover
            </Eyebrow>
            <h2 id={`${chapter.id}-roadmap`} className={readerStyles.roadmapTitle}>
              {sectionTitle}
            </h2>
            <ul className={readerStyles.roadmapList}>
              {items.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          </section>

          <ChapterEndScene num={chapter.num} prev={prev} next={next} basePath={basePath} homeLabel="The cover" />
        </ReadingColumn>
      </ReaderLayout>

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
