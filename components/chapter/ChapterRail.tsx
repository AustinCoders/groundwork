"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { TopIcon } from "@/components/practice/TopIcon";
import type { SeriesCard, SeriesPart } from "./types";
import styles from "@/components/series/chapter.module.css";

export function useRailParts(chapter: SeriesCard<string>) {
  const currentPart = chapter.levels[0];
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
  search,
  matchInfo = null,
  searching = false,
  navListId = "nav-list",
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
  search?: ReactNode;
  matchInfo?: Set<string> | null;
  searching?: boolean;
  navListId?: string;
}) {
  const effectiveOpenParts = searching ? new Set(parts.map((p) => p.level)) : openParts;

  return (
    <nav className={styles.rail} aria-label="Chapters">
      {search}
      <Link className={styles.railHome} href={basePath} onClick={onNavigate}>
        <TopIcon name="prev" size={15} />
        {homeLabel}
      </Link>
      <div id={search ? navListId : undefined}>
        {parts.map((p, pi) => {
          const list = chapters.filter((c) => c.levels.includes(p.level));
          const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
          const open = effectiveOpenParts.has(p.level);
          return (
            <section key={p.level} className={styles.railPart} data-open={open || undefined}>
              <button
                type="button"
                className={styles.railHead}
                aria-expanded={open}
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
              <div className={styles.railFold} id={`rail-${p.level}`} inert={!open}>
                <ol className={styles.railList}>
                  {list.map((c) => {
                    const matched = matchInfo ? matchInfo.has(c.id) : false;
                    const hidden = searching && !matched;
                    return (
                      <li key={c.id}>
                        <Link
                          href={`${basePath}/${c.id}`}
                          aria-current={c.id === chapter.id ? "page" : undefined}
                          className={`${styles.railLink}${hidden ? ` ${styles.railHidden}` : ""}`}
                          onClick={onNavigate}
                        >
                          <span className={styles.railNum}>{c.num}</span>
                          <span className={styles.railTitle}>{c.short || c.title}</span>
                          {mounted && done.has(c.id) && (
                            <span className={styles.railDone} aria-label="read">
                              ✓
                            </span>
                          )}
                          {matched && <span className="site-navlink__match" aria-hidden="true" />}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          );
        })}
      </div>
    </nav>
  );
}
