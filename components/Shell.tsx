"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ClockWeather } from "@/components/ClockWeather";
import { DailyRecap } from "@/components/DailyRecap";
import { FontPicker, ThemePicker } from "@/components/ThemeFontPicker";
import { StreakMini } from "@/components/StreakMini";
import { TopicOfDay } from "@/components/TopicOfDay";
import { INTERVIEW_TOPIC_ID } from "@/lib/topicIds";
import { findNav, navHref, navNotesHref, useTopicsNav } from "@/lib/topicNav";
import { escapeHtml } from "@/lib/format";
import { progress, store } from "@/lib/storage";
import { useReadyTopicIds } from "@/lib/topicReadiness";
import { SITE_NAME } from "@/lib/site";
import type { TopicNav } from "@/content/types";

const SIDEBAR_KEY = "jsnotes:sidebar-collapsed";
import { useClientValue, useLastLevel, useMounted, useProgressValue } from "@/lib/hooks";

const FocusScope = dynamic(() => import("@radix-ui/react-focus-scope").then((m) => m.FocusScope));

function MaybeFocusTrap({ active, children }: { active: boolean; children: React.ReactElement }) {
  if (!active) return children;
  return (
    <FocusScope asChild trapped loop>
      {children}
    </FocusScope>
  );
}

function TopicLink({
  topic,
  href,
  active,
  muted,
}: {
  topic: TopicNav;
  href: string;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <Link
      className={`site-navlink${muted ? " site-navlink--muted" : ""}${active ? " is-active" : ""}`}
      href={href}
      title={muted ? `${topic.name} — coming soon` : `${topic.name} — ready to read`}
      prefetch={false}
    >
      <span
        className="site-navlink__mark"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: escapeHtml(topic.mark) }}
      />
      <span className="site-navlink__name">{topic.name}</span>
      <span className={`site-navlink__dot${muted ? " is-soon" : ""}`} aria-hidden="true" />
    </Link>
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

  contextNav?: React.ReactNode;

  variant?: "full" | "focused";

  topicId?: string;

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
  contextNav,
  variant = "full",
  topicId,
  progressChapters,
}: ShellProps) {
  const focused = variant === "focused" || Boolean(topicId);
  const [drawerOpen, setDrawerOpen] = useState(false);
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
  const navTopics = useTopicsNav();
  const topicName = useMemo(() => (topicId && findNav(navTopics, topicId)?.name) || "JavaScript", [navTopics, topicId]);
  const readerHref = useMemo(() => navNotesHref(navTopics, topicId), [navTopics, topicId]);
  const readyTopicIds = useReadyTopicIds();
  const [readyTopics, plannedTopics] = useMemo(() => {
    const all = navTopics;
    if (!readyTopicIds) return [all.filter((t) => t.status === "ready"), all.filter((t) => t.status !== "ready")];
    return [all.filter((t) => readyTopicIds.has(t.id)), all.filter((t) => !readyTopicIds.has(t.id))];
  }, [navTopics, readyTopicIds]);
  const shelfTopics = useMemo(() => readyTopics.filter((t) => t.id !== INTERVIEW_TOPIC_ID), [readyTopics]);
  const interviewReady = useMemo(() => readyTopics.some((t) => t.id === INTERVIEW_TOPIC_ID), [readyTopics]);
  const done = useProgressValue(() => progress.countDone(chs), 0);
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

            <Link className="brand site-sidenav__brand" href="/" prefetch={false}>
              <span className="brand__mark" aria-hidden="true">
                JS
              </span>
              <span>
                <span className="brand__name">{SITE_NAME}</span>{" "}
                <span className="brand__meta">handwritten · web dev</span>
              </span>
            </Link>

            <ClockWeather />
            <StreakMini />
            <TopicOfDay topics={readyTopics} />

            <nav className="site-sidenav__section" aria-label="Playground">
              <Link
                className="site-navlink site-navlink--accent"
                href="/practice?id=free"
                title="Playground"
                prefetch={false}
              >
                <span className="site-navlink__icon" aria-hidden="true">
                  ✎
                </span>
                <span className="site-navlink__name">Playground</span>
                <span className="site-navlink__go" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link className="site-navlink" href="/problems" title="All problems" prefetch={false}>
                <span className="site-navlink__icon" aria-hidden="true">
                  ⌘
                </span>
                <span className="site-navlink__name">Problems</span>
              </Link>
              <Link className="site-navlink" href="/architecture" title="How this site is built" prefetch={false}>
                <span className="site-navlink__icon" aria-hidden="true">
                  ▤
                </span>
                <span className="site-navlink__name">How this is built</span>
              </Link>
              {interviewReady && (
                <Link
                  className="site-navlink"
                  href={navNotesHref(navTopics, INTERVIEW_TOPIC_ID)}
                  title="Interview book — every round of the loop"
                  prefetch={false}
                >
                  <span className="site-navlink__icon" aria-hidden="true">
                    ◎
                  </span>
                  <span className="site-navlink__name">Interview book</span>
                </Link>
              )}
              <Link className="site-navlink" href="/review" title="Review — spaced repetition" prefetch={false}>
                <span className="site-navlink__icon" aria-hidden="true">
                  ↻
                </span>
                <span className="site-navlink__name">Review</span>
                {dueCount > 0 && <span className="site-navlink__hits">{dueCount}</span>}
              </Link>
              <Link
                className="site-navlink"
                href="/progress"
                title="Your progress — streaks, XP, badges"
                prefetch={false}
              >
                <span className="site-navlink__icon" aria-hidden="true">
                  🔥
                </span>
                <span className="site-navlink__name">Progress</span>
              </Link>
            </nav>

            {contextNav}

            {sidebarExtra}

            <nav className="site-sidenav__section" aria-label="Topics">
              {focused ? (
                shelfTopics.length > 0 && (
                  <details className="nav-group" open={false}>
                    <summary className="nav-group__summary">
                      <span className="nav-group__name">Switch topic</span>
                      <span className="nav-group__count">{shelfTopics.length}</span>
                      <span className="nav-group__arrow" aria-hidden="true">
                        ›
                      </span>
                    </summary>
                    <div id="sidenav-topics-ready">
                      {shelfTopics.map((t) => (
                        <TopicLink
                          key={t.id}
                          topic={t}
                          href={navHref(t, mounted ? savedLevel : null)}
                          active={t.id === topicId}
                        />
                      ))}
                    </div>
                  </details>
                )
              ) : (
                <>
                  {shelfTopics.length > 0 && (
                    <>
                      <h2 className="site-sidenav__heading">Ready to read</h2>
                      <div id="sidenav-topics-ready">
                        {shelfTopics.map((t) => (
                          <TopicLink key={t.id} topic={t} href={navHref(t, mounted ? savedLevel : null)} />
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
                          <TopicLink key={t.id} topic={t} href={navHref(t, mounted ? savedLevel : null)} muted />
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </nav>

            <div className="site-sidenav__section" id="sidenav-progress">
              {progressState && !(focused && progressState.done === 0) && (
                <>
                  <h2 className="site-sidenav__heading">Your progress</h2>
                  {progressState.done === 0 ? (
                    <>
                      <p className="sidenav-progress__label">
                        Nothing ticked off yet — start the first chapter and it&apos;ll show up here.
                      </p>
                      <Link className="btn sidenav-progress__cta" href={`/level/${topicId || "js"}`} prefetch={false}>
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
                      {!focused && (
                        <Link
                          className="btn sidenav-progress__cta"
                          href={nextChapter ? `${readerHref}/${nextChapter.id}` : readerHref}
                        >
                          {nextChapter ? `Continue: ${nextChapter.short}` : `All of ${topicName} read →`}
                        </Link>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="site-sidenav__foot">
              <section className="setgroup" aria-label="Display settings">
                <h2 className="setgroup__title">
                  <span aria-hidden="true">⚙</span> Display
                </h2>
                {footBefore}
                <div className="setrow">
                  <span className="setrow__label">Theme</span>
                  <div className="setrow__ctl" id="theme-picker">
                    <ThemePicker />
                  </div>
                </div>
                <div className="setrow">
                  <span className="setrow__label">Style</span>
                  <div className="setrow__ctl" id="font-picker">
                    <FontPicker />
                  </div>
                </div>
              </section>
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
