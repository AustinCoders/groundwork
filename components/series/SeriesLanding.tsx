"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { BackButton } from "@/components/practice/BackButton";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { ChapterCard } from "@/components/chapter/ChapterCard";
import { DiagramDefs } from "@/components/chapter/DiagramDefs";
import { PartSection } from "@/components/chapter/PartSection";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import styles from "./landing.module.css";

export function SeriesLanding({
  crumb,
  kicker,
  title,
  lead,
  figureHtml,
  facts,
  factsNote,
  parts,
  chapters,
  basePath,
  progressPrefix = "",
}: {
  crumb: string;
  kicker: string;
  title: string;
  lead: string;
  figureHtml?: string;
  facts: [string, string][];
  factsNote?: string;
  parts: SeriesPart<string>[];
  chapters: SeriesCard<string>[];
  basePath: string;
  progressPrefix?: string;
}) {
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(progressPrefix + c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const next = chapters.find((c) => !done.has(c.id)) ?? chapters[0];
  const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the chapters
      </a>
      <DiagramDefs />
      <div className={styles.page}>
        <header className={styles.top}>
          <div className={styles.topLeft}>
            <BackButton variant="icon" className={styles.iconBtn} fallbackHref="/" fallbackLabel="Home" />
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
            <span className={styles.crumb}>{crumb}</span>
          </div>
          {next && (
            <Link className={`${styles.btn} ${styles.primary}`} href={`${basePath}/${next.id}`}>
              {mounted && done.size ? "Continue reading" : "Start reading"}
              <TopIcon name="next" size={16} />
            </Link>
          )}
        </header>

        <main id="main" className={styles.main}>
          <section className={styles.hero}>
            <p className={styles.kicker}>{kicker}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.heroMeta}>
              <span>{chapters.length} chapters</span>
              <span>
                about {totalMinutes >= 90 ? `${Math.round(totalMinutes / 60)} hours` : `${totalMinutes} minutes`} of
                reading
              </span>
              {mounted && (
                <span>
                  {done.size} of {chapters.length} read
                </span>
              )}
            </div>
          </section>

          {figureHtml && (
            <div className={styles.figure} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: figureHtml }} />
          )}

          {facts.length > 0 && (
            <section className={styles.facts} aria-label="In numbers">
              {facts.map(([n, label]) => (
                <div key={label} className={styles.fact}>
                  <strong>{n}</strong>
                  <span>{label}</span>
                </div>
              ))}
              {factsNote && <p className={styles.factsNote}>{factsNote}</p>}
            </section>
          )}

          {parts.map((part, pi) => {
            const list = chapters.filter((c) => c.level === part.level);
            if (!list.length) return null;
            const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
            return (
              <PartSection
                key={part.level}
                id={part.level}
                index={pi}
                title={part.title}
                blurb={part.blurb}
                read={read}
                total={list.length}
              >
                {list.map((c) => (
                  <ChapterCard key={c.id} chapter={c} href={`${basePath}/${c.id}`} read={mounted && done.has(c.id)} />
                ))}
              </PartSection>
            );
          })}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
