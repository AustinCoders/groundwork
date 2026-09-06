"use client";

import Link from "next/link";
import type { ChapterMeta, Level } from "@/content/types";

export interface ChapterNavProps {
  chapters: ChapterMeta[];
  levels: Level[];
  basePath: string;
  activeId?: string | null;
  openLevel: string | null;
  onOpenLevel: (levelId: string) => void;
  searching?: boolean;
  matchInfo?: Map<string, number> | null;
}

export function ChapterNav({
  chapters,
  levels,
  basePath,
  activeId = null,
  openLevel,
  onOpenLevel,
  searching = false,
  matchInfo = null,
}: ChapterNavProps) {
  return (
    <div id="nav-list">
      {levels.map((level) => {
        const chaptersInLevel = chapters.filter((ch) => (ch.levels || []).indexOf(level.id) !== -1);
        if (!chaptersInLevel.length) return null;
        const isOpen = searching || level.id === openLevel;
        return (
          <details
            key={level.id}
            className="nav-group"
            data-level={level.id}
            open={isOpen}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open && !searching) onOpenLevel(level.id);
            }}
          >
            <summary className="nav-group__summary">
              <span className="nav-group__name">{level.name}</span>
              <span className="nav-group__count">{chaptersInLevel.length}</span>
              <span className="nav-group__arrow" aria-hidden="true">
                ›
              </span>
            </summary>
            <div className="nav-group__body">
              {chaptersInLevel.map((ch) => {
                const isActive = !searching && ch.id === activeId;
                const hits = matchInfo?.get(ch.id);
                const isHidden = searching && hits === undefined;
                return (
                  <Link
                    key={ch.id}
                    className={`site-navlink${isActive ? " is-active" : ""}${isHidden ? " is-hidden" : ""}`}
                    href={`${basePath}/${ch.id}`}
                    data-target={ch.id}
                  >
                    <span className="site-navlink__num" aria-hidden="true">
                      {ch.num}
                    </span>
                    <span className="site-navlink__name">{ch.short}</span>
                    {hits !== undefined && <span className="site-navlink__hits">{hits}</span>}
                  </Link>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
