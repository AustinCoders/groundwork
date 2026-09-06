"use client";

import { useState } from "react";
import { ChapterNav } from "@/components/reader/ChapterNav";
import type { ChapterMeta, Level } from "@/content/types";

export interface ChapterNavSectionProps {
  chapters: ChapterMeta[];
  levels: Level[];
  basePath: string;
  defaultLevel: string | null;
}

export function ChapterNavSection({ chapters, levels, basePath, defaultLevel }: ChapterNavSectionProps) {
  const [openLevel, setOpenLevel] = useState<string | null>(defaultLevel ?? (levels.length ? levels[0].id : null));

  if (!chapters.length || !levels.length) return null;

  return (
    <nav className="site-sidenav__section" aria-label="Chapters">
      <div className="site-sidenav__head">
        <h2 className="site-sidenav__heading">Chapters</h2>
        <span className="site-sidenav__count">{chapters.length} chapters</span>
      </div>
      <ChapterNav
        chapters={chapters}
        levels={levels}
        basePath={basePath}
        openLevel={openLevel}
        onOpenLevel={setOpenLevel}
      />
    </nav>
  );
}
