"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackButton } from "@/components/practice/BackButton";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { activateScripts, enhanceCodeBlocks, enhanceTables, enhanceTryBlocks } from "@/components/reader/enhancements";
import { setupNarration } from "@/components/reader/narration";
import { progress } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { PARTS, type ChapterCard } from "../ArchitectureView";
import styles from "./chapter.module.css";

export interface TocItem {
  id: string;
  text: string;
}

function DiagramDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="wob">
        <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={3} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {(
        [
          ["arrow", "var(--ink)"],
          ["arrow-green", "var(--green)"],
          ["arrow-red", "var(--red)"],
        ] as const
      ).map(([id, fill]) => (
        <marker
          key={id}
          id={id}
          viewBox="0 0 10 10"
          refX="8.5"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" style={{ fill }} />
        </marker>
      ))}
    </svg>
  );
}

function prefersMotion() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ChapterView({
  basePath,
  chapter,
  html,
  toc,
  chapters,
  diagrams,
}: {
  basePath: string;
  chapter: ChapterCard;
  html: string;
  toc: TocItem[];
  chapters: ChapterCard[];
  diagrams: number;
}) {
  const router = useRouter();
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const index = chapters.findIndex((c) => c.id === chapter.id);
  const prev = chapters[index - 1];
  const next = chapters[index + 1];
  const partIndex = PARTS.findIndex((p) => p.level === chapter.level);
  const part = PARTS[partIndex];

  const doneKey = useProgressValue(
    () =>
      chapters
        .filter((c) => progress.isChapterDone(c.id))
        .map((c) => c.id)
        .join(","),
    ""
  );
  const done = useMemo(() => new Set(doneKey ? doneKey.split(",") : []), [doneKey]);
  const isDone = done.has(chapter.id);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    activateScripts(el);
    enhanceCodeBlocks(el);
    enhanceTables(el);
    enhanceTryBlocks(el);
    return setupNarration(el.parentElement ?? el);
  }, [chapter.id]);

  useEffect(() => {
    let ticking = false;
    function update() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const frac = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${frac})`;
      setPct(Math.round(frac * 100));
      const line = Math.min(window.innerHeight * 0.3, 260);
      const atEnd = max > 0 && window.scrollY >= max - 4;
      let current: string | null = null;
      for (const item of toc) {
        const h = document.getElementById(item.id);
        if (!h) continue;
        const top = h.getBoundingClientRect().top;
        if (top < line || (atEnd && top < window.innerHeight - 40)) current = item.id;
      }
      setActive(current);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === "]" || e.key === "n") && next) router.push(`${basePath}/${next.id}`);
      if ((e.key === "[" || e.key === "p") && prev) router.push(`${basePath}/${prev.id}`);
      if (e.key === "t") window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" });
      if (e.key === "Escape") setRailOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, basePath, next, prev]);

  const rail = (
    <nav className={styles.rail} aria-label="Chapters">
      <Link className={styles.railHome} href={basePath} onClick={() => setRailOpen(false)}>
        <TopIcon name="prev" size={15} />
        The system map
      </Link>
      {PARTS.map((p, pi) => {
        const list = chapters.filter((c) => c.level === p.level);
        const read = mounted ? list.filter((c) => done.has(c.id)).length : 0;
        return (
          <section key={p.level} className={styles.railPart}>
            <p className={styles.railHead}>
              <span>
                Part {pi + 1} · {p.title}
              </span>
              <span className={styles.railCount}>
                {read}/{list.length}
              </span>
            </p>
            <ol className={styles.railList}>
              {list.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`${basePath}/${c.id}`}
                    aria-current={c.id === chapter.id ? "page" : undefined}
                    className={styles.railLink}
                    onClick={() => setRailOpen(false)}
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
          </section>
        );
      })}
    </nav>
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
            <BackButton
              variant="icon"
              className={styles.iconBtn}
              fallbackHref={basePath}
              fallbackLabel="The system map"
            />
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
            <button
              type="button"
              className={`${styles.btn} ${styles.railBtn}`}
              aria-expanded={railOpen}
              aria-controls="arch-rail"
              onClick={() => setRailOpen(true)}
            >
              <TopIcon name="list" size={16} />
              Chapters
            </button>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={basePath}>How this is built</Link>
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

              <section className={`${styles.end}${mounted && isDone ? ` ${styles.endDone}` : ""}`} aria-label="Finish">
                <div className={styles.endStatus}>
                  <span className={styles.endMark} aria-hidden="true">
                    {mounted && isDone ? "✓" : chapter.num}
                  </span>
                  <div>
                    <p className={styles.endTitle}>{mounted && isDone ? "Chapter read" : "Finished reading?"}</p>
                    <p className={styles.endSub}>
                      {mounted ? done.size : 0} of {chapters.length} chapters read in this series
                    </p>
                    <span className={styles.endBar} aria-hidden="true">
                      <span style={{ width: `${((mounted ? done.size : 0) / chapters.length) * 100}%` }} />
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.endBtn}
                  aria-pressed={mounted && isDone}
                  onClick={() => progress.setChapterDone(chapter.id, !isDone)}
                >
                  {mounted && isDone ? "Mark as unread" : "Mark as read"}
                </button>
              </section>

              <nav className={styles.pager} aria-label="Chapter navigation">
                <Link className={styles.pageCard} href={prev ? `${basePath}/${prev.id}` : basePath}>
                  <span className={styles.pageArrow} aria-hidden="true">
                    <TopIcon name="prev" size={18} />
                  </span>
                  <span className={styles.pageText}>
                    <span className={styles.pageHint}>{prev ? `Previous · ${prev.num}` : "Back to"}</span>
                    <span className={styles.pageTitle}>{prev ? prev.title : "The system map"}</span>
                  </span>
                </Link>
                <Link
                  className={`${styles.pageCard} ${styles.pageNext}`}
                  href={next ? `${basePath}/${next.id}` : basePath}
                >
                  <span className={styles.pageText}>
                    <span className={styles.pageHint}>{next ? `Next · ${next.num}` : "The end"}</span>
                    <span className={styles.pageTitle}>{next ? next.title : "Back to the system map"}</span>
                  </span>
                  <span className={styles.pageArrow} aria-hidden="true">
                    <TopIcon name="next" size={18} />
                  </span>
                </Link>
              </nav>
            </article>
          </main>

          <aside className={styles.right} aria-label="On this page">
            <div className={styles.rightInner}>
              {toc.length > 0 && (
                <section className={styles.tocCard} aria-label="Sections">
                  <div className={styles.tocTop}>
                    <svg className={styles.ring} viewBox="0 0 36 36" aria-hidden="true">
                      <circle cx="18" cy="18" r="15" className={styles.ringTrack} />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        className={styles.ringFill}
                        strokeDasharray={`${(pct / 100) * 94.25} 94.25`}
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div>
                      <p className={styles.tocHead}>On this page</p>
                      <p className={styles.tocMeta}>
                        {active
                          ? `Section ${toc.findIndex((t) => t.id === active) + 1} of ${toc.length}`
                          : `${toc.length} sections`}{" "}
                        · {pct}%
                      </p>
                    </div>
                  </div>
                  <ol className={styles.toc}>
                    {toc.map((t, i) => {
                      const at = toc.findIndex((x) => x.id === active);
                      const state = i === at ? "now" : i < at ? "past" : "next";
                      return (
                        <li key={t.id} data-state={state}>
                          <a href={`#${t.id}`} aria-current={state === "now" ? "location" : undefined}>
                            <span className={styles.tocNum}>{String(i + 1).padStart(2, "0")}</span>
                            <span className={styles.tocText}>{t.text}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}
              <button
                type="button"
                className={`${styles.readBtn}${mounted && isDone ? ` ${styles.readBtnOn}` : ""}`}
                aria-pressed={mounted && isDone}
                onClick={() => progress.setChapterDone(chapter.id, !isDone)}
              >
                <span className={styles.readTick} aria-hidden="true">
                  {mounted && isDone ? "✓" : ""}
                </span>
                {mounted && isDone ? "Read" : "Mark as read"}
              </button>
              <div className={styles.sideFoot}>
                <button
                  type="button"
                  className={styles.topBtn}
                  onClick={() => window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" })}
                  disabled={pct === 0}
                >
                  <TopIcon name="prev" size={14} />
                  Back to top
                </button>
                <p className={styles.keys}>
                  <kbd>[</kbd>
                  <kbd>]</kbd> chapters · <kbd>t</kbd> top
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {railOpen && (
        <div className={styles.sheetRoot}>
          <div className={styles.sheetBackdrop} onClick={() => setRailOpen(false)} aria-hidden="true" />
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-label="Chapters">
            <div className={styles.sheetHead}>
              <p className={styles.sheetTitle}>Chapters</p>
              <button
                type="button"
                className={styles.iconBtn}
                aria-label="Close chapters"
                onClick={() => setRailOpen(false)}
              >
                ×
              </button>
            </div>
            {rail}
          </div>
        </div>
      )}
      <SiteDrawer open={menuOpen} onClose={closeMenu} reading />
    </>
  );
}
