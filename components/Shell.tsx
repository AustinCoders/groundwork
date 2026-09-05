"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ClockWeather } from "@/components/ClockWeather";
import { DailyRecap } from "@/components/DailyRecap";
import { FontPicker, ThemePicker } from "@/components/ThemeFontPicker";
import { StreakMini } from "@/components/StreakMini";
import { TopicOfDay } from "@/components/TopicOfDay";
import { levels, notesHref, topic as topicById, topicHref, topics } from "@/lib/topics";
import { escapeHtml } from "@/lib/format";
import { progress, rememberLevel, store } from "@/lib/storage";
import { useReadyTopicIds } from "@/lib/topicReadiness";
import { SITE_NAME } from "@/lib/site";

const SIDEBAR_KEY = "jsnotes:sidebar-collapsed";
import { useClientValue, useLastLevel, useMounted, useProgressValue } from "@/lib/hooks";

// Split out of the main bundle — it's dead weight on every page (including
// the homepage's LCP-critical first paint) until someone actually opens the
// mobile drawer, which is the only time it's used.
const FocusScope = dynamic(() => import("@radix-ui/react-focus-scope").then((m) => m.FocusScope));

/**
 * Radix's FocusScope pulls focus to its first tabbable child as soon as it
 * mounts. The sidebar is always in the DOM, so mounting it unconditionally
 * meant every page load — and, once chapters became routes, every chapter
 * navigation — parked the caret in the sidebar search box, swallowing the
 * reader's keyboard shortcuts. Mount the trap only while the mobile drawer
 * is open, which is the only time focus should be captured.
 */
function MaybeFocusTrap({ active, children }: { active: boolean; children: React.ReactElement }) {
  if (!active) return children;
  return (
    <FocusScope asChild trapped loop>
      {children}
    </FocusScope>
  );
}

export interface ShellProps {
  children: React.ReactNode;

  skipLabel: string;

  skipHref?: string;

  sidebarExtra?: React.ReactNode;

  footBefore?: React.ReactNode;

  footAfter?: React.ReactNode;

  progressBar?: React.ReactNode;

  backToTop?: React.ReactNode;

  playgroundNav?: React.ReactNode;

  /** Which topic's progress the sidebar reports. Defaults to JavaScript. */
  topicId?: string;

  /**
   * Chapter list for the progress meter. Passed in rather than looked up,
   * because looking it up here would pull every chapter body into the
   * client bundle. Omit it to hide the progress block.
   */
  progressChapters?: { id: string; short: string }[];
}

export function Shell({
  children,
  skipLabel,
  skipHref = "#main",
  sidebarExtra,
  footBefore,
  footAfter,
  progressBar,
  backToTop,
  playgroundNav,
  topicId,
  progressChapters,
}: ShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Desktop collapse. Read through useClientValue — the same shape the zoom
  // control uses — so the server render stays expanded and hydration agrees,
  // without setting state inside an effect.
  const savedCollapsed = useClientValue(() => store.get<boolean>(SIDEBAR_KEY, false), false);
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);
  const collapsed = collapsedOverride ?? savedCollapsed;
  function toggleCollapsed() {
    const next = !collapsed;
    store.set(SIDEBAR_KEY, next);
    setCollapsedOverride(next);
  }
  const asideRef = useRef<HTMLElement>(null);
  const mounted = useMounted();
  const savedLevel = useLastLevel();
  const chs = useMemo(() => progressChapters || [], [progressChapters]);
  const topicName = useMemo(() => (topicId && topicById(topicId)?.name) || "JavaScript", [topicId]);
  const readerHref = useMemo(() => notesHref(topicId), [topicId]);
  const readyTopicIds = useReadyTopicIds();
  const [readyTopics, plannedTopics] = useMemo(() => {
    const all = topics();
    // Fall back to route status if the readiness context is ever missing —
    // still correct, just doesn't split out topics that are routable but
    // still empty outlines.
    if (!readyTopicIds) return [all.filter((t) => t.status === "ready"), all.filter((t) => t.status !== "ready")];
    return [all.filter((t) => readyTopicIds.has(t.id)), all.filter((t) => !readyTopicIds.has(t.id))];
  }, [readyTopicIds]);
  const done = useProgressValue(() => progress.countDone(chs), 0);
  // Only the chapters this shell knows about — enough for a nudge in the
  // sidebar; /review computes the real, cross-topic list.
  const dueCount = useProgressValue(() => progress.dueForReview(chs.map((c) => c.id)).length, 0);
  const progressState: { done: number; total: number; chapters: { id: string; short: string }[] } | null =
    mounted && chs.length ? { done, total: chs.length, chapters: chs } : null;

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) asideRef.current?.focus();
  }, [drawerOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 900) setDrawerOpen(false);
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKeydown);
    };
  }, []);

  function closeOnMobileNav() {
    if (window.innerWidth <= 900) setDrawerOpen(false);
  }

  const nextChapter = progressState && progressState.chapters.find((ch) => !progress.isChapterDone(ch.id));

  return (
    <>
      <a className="skip-link" href={skipHref}>
        {skipLabel}
      </a>

      {progressBar}

      <DailyRecap topics={readyTopics} />

      <header className="topbar">
        <button
          className="btn btn--icon btn--ghost js-drawer-toggle"
          type="button"
          aria-label="Open menu"
          aria-controls="site-sidenav"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          ☰
        </button>
        <Link className="brand" href="/">
          <span className="brand__mark" aria-hidden="true">
            JS
          </span>
          <span className="brand__name">{SITE_NAME}</span>
        </Link>
      </header>

      <div className={`shell-body${collapsed ? " is-collapsed" : ""}`}>
        <button
          className="backdrop"
          id="backdrop"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          style={{ display: drawerOpen ? undefined : "none" }}
          onClick={() => setDrawerOpen(false)}
        />

        <MaybeFocusTrap active={drawerOpen}>
          <aside
            ref={asideRef}
            className={`site-sidenav${drawerOpen ? " is-open" : ""}${collapsed ? " is-collapsed" : ""}`}
            id="site-sidenav"
            aria-label="Site navigation"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) closeOnMobileNav();
            }}
          >
            <button
              className="btn btn--icon sidenav-collapse"
              type="button"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-controls="site-sidenav"
              title={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
              aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
            >
              {collapsed ? "»" : "«"}
            </button>

            <Link className="brand site-sidenav__brand" href="/">
              <span className="brand__mark" aria-hidden="true">
                JS
              </span>
              <span>
                <span className="brand__name">{SITE_NAME}</span> <span className="brand__meta">handwritten · web dev</span>
              </span>
            </Link>

            <ClockWeather />
            <StreakMini />
            <TopicOfDay topics={readyTopics} />

            {playgroundNav ?? (
              <nav className="site-sidenav__section" aria-label="Playground">
                <Link className="site-navlink site-navlink--accent" href="/practice?id=free" title="Playground">
                  <span className="site-navlink__icon" aria-hidden="true">
                    ✎
                  </span>
                  <span className="site-navlink__name">Playground</span>
                  <span className="site-navlink__go" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link className="site-navlink" href="/problems" title="All problems">
                  <span className="site-navlink__icon" aria-hidden="true">
                    ⌘
                  </span>
                  <span className="site-navlink__name">Problems</span>
                </Link>
                <Link className="site-navlink" href="/review" title="Review — spaced repetition">
                  <span className="site-navlink__icon" aria-hidden="true">
                    ↻
                  </span>
                  <span className="site-navlink__name">Review</span>
                  {dueCount > 0 && <span className="site-navlink__hits">{dueCount}</span>}
                </Link>
                <Link className="site-navlink" href="/progress" title="Your progress — streaks, XP, badges">
                  <span className="site-navlink__icon" aria-hidden="true">
                    🔥
                  </span>
                  <span className="site-navlink__name">Progress</span>
                </Link>
              </nav>
            )}

            {sidebarExtra}

            {/* Only for topics with their own beginner/intermediate/advanced
                ladder — topicId alone isn't enough, since single-page readers
                like Git and Interview prep pass it too (for the progress
                block and page title) but have no such ladder to link to. */}
            {topicId && topicById(topicId)?.levels && (
              <nav className="site-sidenav__section" aria-label="Levels">
                <h2 className="site-sidenav__heading">{topicName} levels</h2>
                <div id="sidenav-levels">
                  {levels(topicId).map((level) => (
                    <Link
                      key={level.id}
                      className="site-navlink"
                      href={`/path?topic=${topicId}&level=${level.id}`}
                      onClick={() => rememberLevel(level.id)}
                    >
                      <span className="site-navlink__num" aria-hidden="true">
                        {level.mark}
                      </span>
                      <span className="site-navlink__name">{level.name}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            )}

            <nav className="site-sidenav__section" aria-label="Topics">
              {readyTopics.length > 0 && (
                <>
                  <h2 className="site-sidenav__heading">Ready to read</h2>
                  <div id="sidenav-topics-ready">
                    {readyTopics.map((t) => (
                      <Link
                        key={t.id}
                        className="site-navlink"
                        href={topicHref(t, mounted ? savedLevel : null)}
                        title={`${t.name} — ready to read`}
                      >
                        <span
                          className="site-navlink__mark"
                          aria-hidden="true"
                          dangerouslySetInnerHTML={{ __html: escapeHtml(t.mark) }}
                        />
                        <span className="site-navlink__name">{t.name}</span>
                        <span className="site-navlink__dot" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {plannedTopics.length > 0 && (
                <details className="nav-group" open={false}>
                  <summary className="nav-group__summary">
                    <span className="nav-group__name">More topics</span>
                    <span className="nav-group__count">{plannedTopics.length}</span>
                    <span className="nav-group__arrow" aria-hidden="true">
                      ›
                    </span>
                  </summary>
                  <div id="sidenav-topics-planned">
                    {plannedTopics.map((t) => (
                      <Link
                        key={t.id}
                        className="site-navlink site-navlink--muted"
                        href={topicHref(t, mounted ? savedLevel : null)}
                        title={`${t.name} — coming soon`}
                      >
                        <span
                          className="site-navlink__mark"
                          aria-hidden="true"
                          dangerouslySetInnerHTML={{ __html: escapeHtml(t.mark) }}
                        />
                        <span className="site-navlink__name">{t.name}</span>
                        <span className="site-navlink__dot is-soon" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                </details>
              )}
            </nav>

            <div className="site-sidenav__section" id="sidenav-progress">
              {progressState && (
                <>
                  <h2 className="site-sidenav__heading">Your progress</h2>
                  {progressState.done === 0 ? (
                    <>
                      <p className="sidenav-progress__label">
                        Nothing ticked off yet — start the first chapter and it&apos;ll show up here.
                      </p>
                      <Link className="btn sidenav-progress__cta" href={`/level?topic=${topicId || "js"}`}>
                        Start with {topicName} →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="sidenav-progress__label">
                        <b>
                          {progressState.done} / {progressState.total}
                        </b>{" "}
                        {topicName} chapters read
                      </p>
                      <div className="meter">
                        <div className="meter__track">
                          <div
                            className="meter__fill"
                            style={{ width: `${Math.round((progressState.done / progressState.total) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        className="btn sidenav-progress__cta"
                        href={nextChapter ? `${readerHref}/${nextChapter.id}` : readerHref}
                      >
                        {nextChapter ? `Continue: ${nextChapter.short}` : `All of ${topicName} read →`}
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            <div className="site-sidenav__foot">
              {footBefore}
              <div id="theme-picker">
                <ThemePicker />
              </div>
              <div id="font-picker">
                <FontPicker />
              </div>
              {footAfter}
            </div>
          </aside>
        </MaybeFocusTrap>

        <main className="shell-main" id="main">
          {children}
        </main>
      </div>

      {backToTop}
    </>
  );
}
