"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { TopIcon } from "@/components/practice/TopIcon";
import { EyebrowToggle, kit } from "@/components/ui/MenuKit";
import { STATE_TEXT, type ChapterState } from "@/lib/chapterState";
import type { SeriesCard, SeriesPart } from "./types";
import styles from "./rail.module.css";

const HEAD_ROOM = 120;

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
  homeHref,
  homeLabel,
  done,
  mounted,
  states,
  openParts,
  onTogglePart,
  onNavigate,
  search,
  matchInfo = null,
  searching = false,
  navListId = "nav-list",
  label = "Chapters",
  unwritten = 0,
}: {
  parts: SeriesPart<string>[];
  chapters: SeriesCard<string>[];
  chapter: SeriesCard<string>;
  basePath: string;
  homeHref?: string;
  homeLabel: string;
  done: Set<string>;
  mounted: boolean;
  states?: ReadonlyMap<string, ChapterState>;
  openParts: Set<string>;
  onTogglePart: (level: string) => void;
  onNavigate: () => void;
  search?: ReactNode;
  matchInfo?: Set<string> | null;
  searching?: boolean;
  navListId?: string;
  label?: string;
  unwritten?: number;
}) {
  const effectiveOpenParts = searching ? new Set(parts.map((p) => p.level)) : openParts;
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    const link = rail.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    const box = link?.closest<HTMLElement>("aside, [role=dialog]");
    if (!link || !box) return;
    const offset = link.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    const shown =
      offset >= box.scrollTop + HEAD_ROOM && offset + link.offsetHeight <= box.scrollTop + box.clientHeight - 8;
    if (!shown) box.scrollTop = Math.max(0, offset - box.clientHeight / 2);
  }, [chapter.id]);

  return (
    <nav ref={rail} className={styles.rail} aria-label={label}>
      {search}
      <Link className={styles.cover} href={homeHref ?? basePath} onClick={onNavigate}>
        <TopIcon name="prev" size={15} />
        {homeLabel}
      </Link>
      <div id={search ? navListId : undefined} className={styles.parts}>
        {parts.map((p, pi) => {
          const list = chapters.filter((c) => c.levels.includes(p.level));
          const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
          const open = effectiveOpenParts.has(p.level);
          return (
            <section key={p.level} className={styles.part} data-open={open || undefined}>
              <EyebrowToggle
                as="div"
                no={String(pi + 1).padStart(2, "0")}
                summary={`${read}/${list.length}`}
                open={open}
                controls={`rail-${p.level}`}
                onToggle={() => onTogglePart(p.level)}
              >
                <span className="visually-hidden">Part {pi + 1} · </span>
                {p.title}
              </EyebrowToggle>
              <div className={styles.fold} id={`rail-${p.level}`} inert={!open}>
                <div className={styles.foldInner}>
                  <ol className={`${kit.rows} ${styles.list}`}>
                    {list.map((c) => {
                      const matched = matchInfo ? matchInfo.has(c.id) : false;
                      const hidden = searching && !matched;
                      return (
                        <li key={c.id} className={hidden ? styles.hidden : undefined}>
                          <Link
                            href={`${basePath}/${c.id}`}
                            prefetch={false}
                            aria-current={c.id === chapter.id ? "page" : undefined}
                            className={kit.row}
                            onClick={onNavigate}
                          >
                            <span className={kit.code}>{c.num}</span>
                            <span className={styles.main}>
                              <span className={kit.title}>{c.short || c.title}</span>
                              {mounted && states?.get(c.id) && (
                                <span className={styles.state} data-state={states.get(c.id)}>
                                  {STATE_TEXT[states.get(c.id) as ChapterState]}
                                </span>
                              )}
                            </span>
                            {mounted && done.has(c.id) && (
                              <span className={styles.done} aria-label="read">
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
              </div>
            </section>
          );
        })}
      </div>
      {unwritten > 0 && (
        <p className={styles.unwritten}>
          {chapters.length} written. {unwritten} more {unwritten === 1 ? "chapter is" : "chapters are"} still being
          written, so the numbers above skip.
        </p>
      )}
    </nav>
  );
}
