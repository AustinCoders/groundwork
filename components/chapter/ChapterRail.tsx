"use client";

import Link from "next/link";
import { useState } from "react";
import { TopIcon } from "@/components/practice/TopIcon";
import type { SeriesCard, SeriesPart } from "./types";
import styles from "@/components/series/chapter.module.css";

export function useRailParts(chapter: SeriesCard<string>) {
  const currentPart = chapter.level;
  const [opened, setOpened] = useState<{ at: string; parts: Set<string> }>(() => ({
    at: chapter.id,
    parts: new Set([currentPart]),
  }));
  const openParts = opened.at === chapter.id ? opened.parts : new Set([currentPart]);
  const togglePart = (level: string) => {
    const next = new Set(openParts);
    if (next.has(level)) next.delete(level);
    else next.add(level);
    setOpened({ at: chapter.id, parts: next });
  };
  return { openParts, togglePart };
}

export function ChapterRail({
  parts,
  chapters,
  chapter,
  basePath,
  homeLabel,
  done,
  mounted,
  openParts,
  onTogglePart,
  onNavigate,
}: {
  parts: SeriesPart<string>[];
  chapters: SeriesCard<string>[];
  chapter: SeriesCard<string>;
  basePath: string;
  homeLabel: string;
  done: Set<string>;
  mounted: boolean;
  openParts: Set<string>;
  onTogglePart: (level: string) => void;
  onNavigate: () => void;
}) {
  return (
    <nav className={styles.rail} aria-label="Chapters">
      <Link className={styles.railHome} href={basePath} onClick={onNavigate}>
        <TopIcon name="prev" size={15} />
        {homeLabel}
      </Link>
      {parts.map((p, pi) => {
        const list = chapters.filter((c) => c.level === p.level);
        const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
        return (
          <section key={p.level} className={styles.railPart} data-open={openParts.has(p.level) || undefined}>
            <button
              type="button"
              className={styles.railHead}
              aria-expanded={openParts.has(p.level)}
              aria-controls={`rail-${p.level}`}
              onClick={() => onTogglePart(p.level)}
            >
              <span className={styles.railChevron} aria-hidden="true" />
              <span className={styles.railPartName}>
                Part {pi + 1} · {p.title}
              </span>
              <span className={styles.railCount}>
                {read}/{list.length}
              </span>
            </button>
            <div className={styles.railFold} id={`rail-${p.level}`} inert={!openParts.has(p.level)}>
              <ol className={styles.railList}>
                {list.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`${basePath}/${c.id}`}
                      aria-current={c.id === chapter.id ? "page" : undefined}
                      className={styles.railLink}
                      onClick={onNavigate}
                    >
                      <span className={styles.railNum}>{c.num}</span>
                      <span className={styles.railTitle}>{c.short || c.title}</span>
                      {mounted && done.has(c.id) && (
                        <span className={styles.railDone} aria-label="read">
                          ✓
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}
    </nav>
  );
}
