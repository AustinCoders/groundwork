"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { lastLevel, store } from "@/lib/storage";
import { useClientValue, useMounted } from "@/lib/hooks";
import { activateScripts, enhanceCodeBlocks, enhanceTables, enhanceTryBlocks } from "@/components/reader/enhancements";
import { setupNarration } from "@/components/reader/narration";
import { NarrationSettings } from "@/components/reader/NarrationSettings";
import { ChapterNav } from "@/components/reader/ChapterNav";
import type { ChapterMeta, LevelNav } from "@/content/types";

const ZOOM_STEPS = [85, 92, 100, 110, 120, 132, 145, 160];
const ZOOM_KEY = "jsnotes:zoom";

function prefersMotion() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface SearchEntry {
  id: string;
  text: string;
}

interface GlobalEntry {
  id: string;
  topicId: string;
  topicName: string;
  href: string;
  num: string;
  short: string;
  text: string;
}

export interface ReaderShellProps {
  topicId: string;
  levels: LevelNav[];
  chapters: ChapterMeta[];
  basePath: string;
  activeId: string | null;
  children: React.ReactNode;
}

export function ReaderShell({ topicId, levels, chapters, basePath, activeId, children }: ReaderShellProps) {
  const router = useRouter();
  const mounted = useMounted();
  const [query, setQuery] = useState("");

  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeChapter = useMemo(() => chapters.find((c) => c.id === activeId) || null, [chapters, activeId]);

  // Which group opens is knowable on the server for a chapter page — the
  // chapter's own level — so open it in the first render. Deciding it after
  // mount grew the sidebar under the reader and was most of this page's
  // layout shift.
  const defaultLevel = activeChapter?.levels?.[0] || (levels.length ? levels[0].id : null);
  const [openLevel, setOpenLevel] = useState<string | null>(defaultLevel);

  const [levelForActive, setLevelForActive] = useState<string | null | undefined>(activeId);
  if (mounted && activeId !== levelForActive) {
    setLevelForActive(activeId);
    setOpenLevel(activeChapter?.levels?.[0] || lastLevel() || defaultLevel);
  }

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
    if (fullIndex) return fullIndex;
    return chapters.map((ch) => ({
      id: ch.id,
      text: `${ch.title} ${ch.short} ${ch.subtitle}`.toLowerCase(),
    }));
  }, [fullIndex, chapters]);

  const matchInfo = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const terms = q.split(/\s+/);
    const hits = new Map<string, number>();
    searchIndex.forEach((entry) => {
      if (terms.every((t) => entry.text.indexOf(t) !== -1)) {
        hits.set(entry.id, entry.text.split(terms[0]).length - 1);
      }
    });
    return hits;
  }, [query, searchIndex]);

  const otherTopicMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !globalIndex) return [];
    const terms = q.split(/\s+/);
    return globalIndex
      .filter((e) => e.topicId !== topicId && terms.every((t) => e.text.indexOf(t) !== -1))
      .slice(0, 12);
  }, [query, globalIndex, topicId]);

  const savedZoomIndex = useClientValue(() => {
    const saved = store.get<number | null>(ZOOM_KEY, null);
    const index = saved !== null ? ZOOM_STEPS.indexOf(saved) : -1;
    return index !== -1 ? index : ZOOM_STEPS.indexOf(100);
  }, ZOOM_STEPS.indexOf(100));
  const [zoomOverride, setZoomOverride] = useState<number | null>(null);
  const zoomIndex = zoomOverride ?? savedZoomIndex;
  const setZoomIndex = (updater: (i: number) => number) => setZoomOverride(updater(zoomIndex));

  useEffect(() => {
    if (!mounted) return;
    const pct = ZOOM_STEPS[zoomIndex];
    document.documentElement.style.setProperty("--reader-zoom", String(pct / 100));
    store.set(ZOOM_KEY, pct);
  }, [zoomIndex, mounted]);

  useEffect(() => {
    if (!mounted) return;
    let ticking = false;
    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progressRef.current) progressRef.current.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      if (fabRef.current) fabRef.current.classList.toggle("is-visible", window.scrollY > 600);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !contentRef.current) return;
    activateScripts(contentRef.current);
    enhanceCodeBlocks(contentRef.current);
    enhanceTables(contentRef.current);
    enhanceTryBlocks(contentRef.current);
    const teardown = setupNarration(contentRef.current);
    return teardown;
  }, [mounted, activeId]);

  const goToChapter = useMemo(
    () => (step: number) => {
      const index = chapters.findIndex((c) => c.id === activeId);
      const target = chapters[Math.min(chapters.length - 1, Math.max(0, index + step))];
      if (target && target.id !== activeId) router.push(`${basePath}/${target.id}`);
    },
    [chapters, activeId, router, basePath]
  );

  useEffect(() => {
    if (!mounted) return;
    function onKeydown(e: KeyboardEvent) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName);
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (typing) return;

      if (e.key === "]" || e.key === "n") goToChapter(1);
      if (e.key === "[" || e.key === "p") goToChapter(-1);
      if (e.key === "t") window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" });
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [mounted, goToChapter]);

  const matches = matchInfo ? chapters.filter((c) => matchInfo.has(c.id)) : [];

  return (
    <Shell
      skipLabel="Skip to the notes"
      variant="focused"
      topicId={topicId}
      progressChapters={chapters}
      progressBar={
        <>
          <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
            <filter id="wob">
              <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={3} seed={7} result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--ink)" }} />
            </marker>
            <marker
              id="arrow-green"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--green)" }} />
            </marker>
            <marker
              id="arrow-red"
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--red)" }} />
            </marker>
          </svg>
          <div className="progress" id="progress" role="presentation" ref={progressRef} />
        </>
      }
      backToTop={
        <button
          className="fab"
          id="to-top"
          type="button"
          aria-label="Back to top"
          title="Back to top"
          ref={fabRef}
          onClick={() => window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" })}
        >
          ↑
        </button>
      }
      sidebarExtra={
        <nav className="site-sidenav__section" aria-label="Chapters">
          <div className="site-sidenav__head">
            <h2 className="site-sidenav__heading">Chapters</h2>
            <span className="site-sidenav__count" id="nav-count">
              {chapters.length} chapters
            </span>
          </div>

          <div className={`search${query ? " has-value" : ""}`} id="search-wrap">
            <span className="search__icon" aria-hidden="true">
              ⌕
            </span>
            <input
              id="search"
              ref={searchInputRef}
              className="search__input"
              type="search"
              placeholder="Search…"
              aria-label="Search the notes"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
                if (e.key === "Enter" && matches.length) {
                  e.preventDefault();
                  setQuery("");
                  router.push(`${basePath}/${matches[0].id}`);
                }
              }}
            />
            <button
              className="search__clear"
              id="search-clear"
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
            >
              ✕
            </button>
          </div>

          <ChapterNav
            chapters={chapters}
            levels={levels}
            basePath={basePath}
            activeId={activeId}
            openLevel={openLevel}
            onOpenLevel={setOpenLevel}
            searching={searching}
            matchInfo={matchInfo}
          />

          <div className="keys keys--tight" style={{ marginTop: 10 }}>
            <span>
              <kbd>/</kbd> search
            </span>
            <span>
              <kbd>[</kbd> <kbd>]</kbd> chapter
            </span>
            <span>
              <kbd>t</kbd> top
            </span>
          </div>
        </nav>
      }
      footBefore={
        <div className="setrow" role="group" aria-label="Text size">
          <span className="setrow__label">Text size</span>
          <div className="stepper">
            <button
              className="stepper__btn stepper__btn--type"
              id="zoom-out"
              type="button"
              title="Smaller text"
              aria-label="Decrease text size"
              disabled={zoomIndex === 0}
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            >
              A−
            </button>
            <span className="stepper__val" id="zoom-pct">
              {ZOOM_STEPS[zoomIndex]}%
            </span>
            <button
              className="stepper__btn stepper__btn--type"
              id="zoom-in"
              type="button"
              title="Larger text"
              aria-label="Increase text size"
              disabled={zoomIndex === ZOOM_STEPS.length - 1}
              onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
            >
              A+
            </button>
          </div>
        </div>
      }
      footAfter={
        <>
          <NarrationSettings />
          <div className="site-sidenav__foot-row">
            <button
              className="btn btn--wide"
              id="print-btn"
              type="button"
              title="Print / save as PDF"
              aria-label="Print or save as PDF"
              onClick={() => window.print()}
            >
              <span aria-hidden="true">⎙</span>
              <span className="btn__label">Print</span>
            </button>
          </div>
        </>
      }
    >
      <div className={`searchbar${searching ? " is-visible" : ""}`} id="searchbar" role="status">
        <span className="searchbar__count" id="search-count">
          {matchInfo
            ? matchInfo.size === 0
              ? `No chapter matches "${query.trim()}"`
              : `${matchInfo.size} ${matchInfo.size === 1 ? "chapter matches" : "chapters match"} "${query.trim()}"`
            : ""}
        </span>
        <span className="chapter__foot-spacer" />
        <button className="btn" id="search-reset" type="button" onClick={() => setQuery("")}>
          Show all chapters
        </button>
      </div>

      {searching ? (
        <section className="sheet" aria-label="Search results">
          <h2>Search results</h2>
          {matches.length === 0 && otherTopicMatches.length === 0 ? (
            <p className="sub">
              Nothing matches “{query.trim()}”. Try a shorter term, or a pattern name like “sliding window”.
            </p>
          ) : (
            <>
              {matches.length > 0 && (
                <nav className="toc" aria-label="Matching chapters">
                  {matches.map((ch) => (
                    <Link key={ch.id} href={`${basePath}/${ch.id}`} onClick={() => setQuery("")}>
                      <b>{ch.num}</b>
                      {ch.short}
                    </Link>
                  ))}
                </nav>
              )}

              {otherTopicMatches.length > 0 && (
                <>
                  <h3 className="search-other__title">In other topics</h3>
                  <p className="sub">Matched on chapter titles — open one to search inside it.</p>
                  <nav className="toc" aria-label="Matching chapters in other topics">
                    {otherTopicMatches.map((e) => (
                      <Link key={`${e.topicId}:${e.id}`} href={e.href} onClick={() => setQuery("")}>
                        <b>{e.num}</b>
                        {e.short}
                        <span className="search-other__topic">{e.topicName}</span>
                      </Link>
                    ))}
                  </nav>
                </>
              )}
            </>
          )}
        </section>
      ) : (
        <div id="chapters" ref={contentRef}>
          {children}
        </div>
      )}
    </Shell>
  );
}
