"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackButton } from "@/components/practice/BackButton";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { activateScripts, enhanceCodeBlocks, enhanceTables, enhanceTryBlocks } from "@/components/reader/enhancements";
import { makeScrollRegions } from "@/components/reader/scrollRegions";
import { setupNarration } from "@/components/reader/narration";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { ChapterEnd } from "@/components/chapter/ChapterEnd";
import { ChapterPager } from "@/components/chapter/ChapterPager";
import { ChapterRail, useRailParts } from "@/components/chapter/ChapterRail";
import { ChaptersSheet, ChaptersSheetButton } from "@/components/chapter/ChaptersSheet";
import { DiagramDefs } from "@/components/chapter/DiagramDefs";
import { TocCard } from "@/components/chapter/TocCard";
import { useActiveHeading } from "@/components/chapter/useActiveHeading";
import { useChapterKeys } from "@/components/chapter/useChapterKeys";
import type { SeriesCard, SeriesPart, TocItem } from "@/components/chapter/types";
import styles from "./chapter.module.css";

export function ChapterView({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
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
    const stopNarration = setupNarration(el.parentElement ?? el);
    const stopScrollRegions = makeScrollRegions(el);
    return () => {
      stopNarration();
      stopScrollRegions();
    };
  }, [chapter.id]);

  const { active, pct } = useActiveHeading(toc, barRef);

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
    <>
      <a className="skip-link" href={`#${chapter.id}`}>
        Skip to the chapter
      </a>
      <DiagramDefs />
      <div className={styles.page}>
        <header className={styles.top}>
          <div className={styles.topLeft}>
            <BackButton variant="icon" className={styles.iconBtn} fallbackHref={basePath} fallbackLabel={homeLabel} />
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              data-tip="Pages, theme and handwriting"
              onClick={() => setMenuOpen(true)}
            >
              <TopIcon name="menu" />
            </button>
            <ChaptersSheetButton open={railOpen} onOpen={() => setRailOpen(true)} />
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={basePath}>{seriesTitle}</Link>
              <span aria-hidden="true">/</span>
              <span>{part?.title}</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{chapter.num}</span>
            </nav>
          </div>
          <div className={styles.topRight}>
            {prev ? (
              <Link
                className={styles.iconBtn}
                href={`${basePath}/${prev.id}`}
                aria-label={`Previous: ${prev.title}`}
                data-tip={`${prev.num} · ${prev.short || prev.title} — [`}
              >
                <TopIcon name="prev" />
              </Link>
            ) : (
              <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
                <TopIcon name="prev" />
              </span>
            )}
            <span className={styles.position}>
              {index + 1} / {chapters.length}
            </span>
            {next ? (
              <Link
                className={styles.iconBtn}
                href={`${basePath}/${next.id}`}
                aria-label={`Next: ${next.title}`}
                data-tip={`${next.num} · ${next.short || next.title} — ]`}
              >
                <TopIcon name="next" />
              </Link>
            ) : (
              <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
                <TopIcon name="next" />
              </span>
            )}
          </div>
          <div className={styles.progress} aria-hidden="true">
            <div ref={barRef} />
          </div>
        </header>

        <div className={styles.body}>
          <aside className={styles.left} id="arch-rail">
            {rail}
          </aside>

          <main className={styles.main} id="main">
            <article className={`chapter${isDone ? " is-done" : ""} ${styles.article}`} id={chapter.id}>
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
                <details className={styles.inlineToc}>
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
          </main>

          <TocCard toc={toc} active={active} pct={pct} read={mounted && isDone} onToggleRead={toggleRead} />
        </div>
      </div>

      <ChaptersSheet open={railOpen} onClose={closeRail}>
        {rail}
      </ChaptersSheet>
      <SiteDrawer open={menuOpen} onClose={closeMenu} reading />
    </>
  );
}
