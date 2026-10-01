"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface SearchEntry {
  id: string;
  text: string;
}

export interface ChapterSearchMatch {
  id: string;
  topicName: string;
  href: string;
  num: string;
  short: string;
}

interface GlobalEntry extends ChapterSearchMatch {
  topicId: string;
  text: string;
}

export interface SearchableChapter {
  id: string;
  title: string;
  short?: string;
  subtitle: string;
}

export function useChapterSearch({
  topicId,
  basePath,
  chapters,
}: {
  topicId: string;
  basePath: string;
  chapters: SearchableChapter[];
}) {
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searching = query.trim().length > 0;

  const [fullIndex, setFullIndex] = useState<SearchEntry[] | null>(null);
  const [globalIndex, setGlobalIndex] = useState<GlobalEntry[] | null>(null);

  useEffect(() => {
    if (!searching) return;
    let cancelled = false;
    if (!fullIndex) {
      fetch(`${basePath}/search-index.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data) setFullIndex(data as SearchEntry[]);
        })
        .catch(() => {});
    }
    if (!globalIndex) {
      fetch("/search-index.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data) setGlobalIndex(data as GlobalEntry[]);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [searching, fullIndex, globalIndex, basePath]);

  const searchIndex = useMemo<SearchEntry[]>(() => {
    const ids = new Set(chapters.map((c) => c.id));
    if (fullIndex) return fullIndex.filter((e) => ids.has(e.id));
    return chapters.map((c) => ({ id: c.id, text: `${c.title} ${c.short ?? ""} ${c.subtitle}`.toLowerCase() }));
  }, [fullIndex, chapters]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Set<string>();
    const terms = q.split(/\s+/);
    const hits = new Set<string>();
    searchIndex.forEach((entry) => {
      if (terms.every((t) => entry.text.indexOf(t) !== -1)) hits.add(entry.id);
    });
    return hits;
  }, [query, searchIndex]);

  const otherMatches = useMemo<ChapterSearchMatch[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || !globalIndex) return [];
    const terms = q.split(/\s+/);
    return globalIndex
      .filter((e) => e.topicId !== topicId && terms.every((t) => e.text.indexOf(t) !== -1))
      .slice(0, 12);
  }, [query, globalIndex, topicId]);

  return { query, setQuery, searching, matches, otherMatches, searchInputRef };
}
