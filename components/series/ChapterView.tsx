"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { TopicFrame, type FrameTopic } from "@/components/topic/TopicFrame";
import { useChapterBody } from "@/components/reader/useChapterBody";
import { progress } from "@/lib/storage";
import { writeResume } from "@/lib/resume";
import { useMounted, useProgressValue } from "@/lib/hooks";
import {
  ChapterCrumbs,
  ChapterEndScene,
  ChapterHeaderPager,
  ChapterHero,
  ChapterInlineToc,
  codeLabelFor,
  Prose,
  ReaderLayout,
  ReadingColumn,
} from "@/components/chapter/ChapterKit";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart, TocItem } from "@/components/chapter/types";

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
  const bodyRef = useChapterBody(chapter.id);
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
          <ChapterCrumbs href={basePath} label={seriesTitle} part={part?.title} num={chapter.num} />
          <ChapterHeaderPager index={index} total={chapters.length} prev={prev} next={next} basePath={basePath} />
        </>
      }
    >
      <ReaderLayout
        accent={topic.accent}
        rail={rail}
        railId="arch-rail"
        aside={<TocCard toc={toc} active={active} pct={pct} read={mounted && isDone} onToggleRead={toggleRead} />}
      >
        <ReadingColumn id={chapter.id} read={isDone}>
          <ChapterHero
            mark={topic.mark}
            num={chapter.num}
            partLabel={`Part ${partIndex + 1} · ${part?.title}`}
            title={chapter.title}
            subtitle={chapter.subtitle}
            facts={[
              `${chapter.minutes} min read`,
              ...(diagrams ? [`${diagrams} ${diagrams === 1 ? "diagram" : "diagrams"}`] : []),
              `${toc.length} sections`,
            ]}
            listenId={chapter.id}
            learn={toc.map((t) => t.text)}
            minutes={chapter.minutes}
            position={{ index: index + 1, total: chapters.length }}
            read={mounted && isDone}
          />

          {toc.length > 2 && <ChapterInlineToc toc={toc} />}

          <Prose html={html} bodyRef={bodyRef} codeLabel={codeLabelFor(basePath.replace(/^\//, ""))} />

          <ChapterEndScene
            num={chapter.num}
            finish={{
              num: chapter.num,
              read: mounted && isDone,
              readCount: mounted ? done.size : 0,
              total: chapters.length,
              onToggleRead: toggleRead,
            }}
            prev={prev}
            next={next}
            basePath={basePath}
            homeLabel={homeLabel}
          />
        </ReadingColumn>
      </ReaderLayout>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        {rail}
      </ChaptersSheet>
    </TopicFrame>
  );
}
