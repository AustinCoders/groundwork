"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AppearancePicker } from "@/components/AppearancePicker";
import { NarrationSettings } from "@/components/reader/NarrationSettings";
import { ZOOM_STEPS, useReaderZoom } from "@/lib/readerZoom";
import { computeStats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import { FONT_ITEMS, THEME_ITEMS } from "@/lib/storage";
import { SITE_NAME } from "@/lib/site";
import { navHref, useTopicsNav } from "@/lib/topicNav";
import type { TopicNav } from "@/content/types";
import styles from "./SiteDrawer.module.css";

const LINKS: { href: string; label: string; mark: string; accent: string }[] = [
  { href: "/", label: "Home", mark: "⌂", accent: "ink" },
  { href: "/practice?id=free", label: "Playground", mark: "✎", accent: "blue" },
  { href: "/problems", label: "Problems", mark: "⌘", accent: "purple" },
  { href: "/whiteboard", label: "Whiteboard", mark: "▱", accent: "teal" },
  { href: "/mock", label: "Mock interview", mark: "⏱", accent: "orange" },
  { href: "/review", label: "Review", mark: "↻", accent: "green" },
  { href: "/progress", label: "Progress", mark: "▤", accent: "yellow" },
];

const ACCENTS: Record<string, string> = { mint: "green" };

function accentVar(accent: string): string {
  const name = ACCENTS[accent] ?? accent;
  return name === "ink" ? "var(--ink)" : `var(--c-${name})`;
}

function topicBases(t: TopicNav): string[] {
  return [`/${(t.notes || "notes.html").replace(/\.html$/, "")}`, `/level/${t.id}`];
}

function isUnder(pathname: string, base: string): boolean {
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
}

interface Hit {
  href: string;
  label: string;
  mark: string;
  accent: string;
  meta: string;
}

type Section = "topics" | "theme" | "font" | "reading" | "narrator";

const plain = (label: string) => label.replace(/^\S+\s/, "");

function useHtmlAttr(name: string): string {
  return useSyncExternalStore(
    (cb) => {
      const mo = new MutationObserver(cb);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: [name] });
      return () => mo.disconnect();
    },
    () => document.documentElement.getAttribute(name) ?? "",
    () => ""
  );
}

const ICONS: Record<Section, React.ReactNode> = {
  topics: (
    <path d="M4 19.5v-15A1.5 1.5 0 015.5 3H20v15H5.5A1.5 1.5 0 004 19.5zm0 0A1.5 1.5 0 005.5 21H20M8 7h8M8 11h5" />
  ),
  theme: (
    <path d="M12 3a9 9 0 100 18c1.1 0 1.6-.9 1.2-1.8-.5-1.1.3-2.2 1.5-2.2H17a4 4 0 004-4c0-5-4-10-9-10zM7.5 12h.01M10 7.5h.01M15 8h.01" />
  ),
  font: <path d="M4 20l6-16 6 16M6.5 14h7M18 20c1.5-3 2-6 2-9" />,
  reading: <path d="M4 7V5h10v2M9 5v14M7 19h4M14 12h6M17 12v7M15.5 19h3" />,
  narrator: <path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />,
};

function Fold({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: Section;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: (id: Section, open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.fold} data-open={open || undefined}>
      <h2 className={styles.foldH}>
        <button
          type="button"
          className={styles.foldHead}
          aria-expanded={open}
          aria-controls={`fold-${id}`}
          onClick={() => onToggle(id, !open)}
        >
          <span className={styles.foldIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: 0 }}
            >
              {ICONS[id]}
            </svg>
          </span>
          <span className={styles.foldTitle}>{title}</span>
          {summary && <span className={styles.foldSummary}>{summary}</span>}
          <span className={styles.chevron} aria-hidden="true" />
        </button>
      </h2>
      <div className={styles.foldPanel} id={`fold-${id}`} role="region" aria-label={title} inert={!open}>
        <div className={styles.foldInner}>
          <div className={styles.foldBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ onClose }: { onClose: () => void }) {
  const key = useProgressValue(() => {
    const s = computeStats();
    const due = progress.dueForReview(Object.keys(progress.all().chapters)).length;
    return JSON.stringify({ ...s, due });
  }, "");
  if (!key) return null;
  const s = JSON.parse(key) as ReturnType<typeof computeStats> & { due: number };
  const pct = s.xpForNextLevel ? Math.min(100, (s.xpIntoLevel / s.xpForNextLevel) * 100) : 0;
  return (
    <section className={styles.stats} aria-label="Your progress">
      <div className={styles.statsTop}>
        <span className={styles.level}>Level {s.level}</span>
        <span className={styles.xp}>
          {s.xpIntoLevel} / {s.xpForNextLevel} XP
        </span>
      </div>
      <span className={styles.xpBar} aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <div className={styles.statGrid}>
        <div>
          <strong>{s.chaptersRead}</strong>
          <span>chapters read</span>
        </div>
        <div>
          <strong>{s.exercisesSolved}</strong>
          <span>problems solved</span>
        </div>
        <div>
          <strong>
            {s.streak}
            {s.streak > 0 && <span aria-hidden="true"> 🔥</span>}
          </strong>
          <span>day streak</span>
        </div>
      </div>
      {s.due > 0 ? (
        <Link className={styles.due} href="/review" onClick={onClose}>
          <span>
            <b>{s.due}</b> {s.due === 1 ? "chapter is" : "chapters are"} due for review
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <Link className={styles.statsLink} href="/progress" onClick={onClose}>
          See all progress <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}

function HitLink({ hit, here, onClose }: { hit: Hit; here: boolean; onClose: () => void }) {
  return (
    <Link
      href={hit.href}
      className={styles.hit}
      aria-current={here ? "page" : undefined}
      onClick={onClose}
      prefetch={false}
      style={{ "--accent": accentVar(hit.accent) } as React.CSSProperties}
    >
      <span className={styles.chip} aria-hidden="true">
        {hit.mark}
      </span>
      <span className={styles.hitLabel}>{hit.label}</span>
      <span className={styles.hitMeta}>{hit.meta}</span>
    </Link>
  );
}

function topicHit(t: TopicNav): Hit {
  const ready = t.status === "ready" && t.written > 0;
  return {
    href: navHref(t, null),
    label: t.name,
    mark: t.mark,
    accent: t.accent,
    meta: ready ? `${t.written} ${t.written === 1 ? "chapter" : "chapters"}` : "Soon",
  };
}

function TopicList({ topics, current, onClose }: { topics: TopicNav[]; current: string | null; onClose: () => void }) {
  const ready = topics.filter((t) => t.status === "ready" && t.written > 0);
  const soon = topics.filter((t) => !ready.includes(t));
  return (
    <nav aria-label="Topics" className={styles.topicNav}>
      <p className={styles.groupLabel}>Ready to read · {ready.length}</p>
      <ul className={styles.hits}>
        {ready.map((t) => (
          <li key={t.id}>
            <HitLink hit={topicHit(t)} here={t.id === current} onClose={onClose} />
          </li>
        ))}
      </ul>
      {soon.length > 0 && (
        <>
          <p className={styles.groupLabel}>Coming soon · {soon.length}</p>
          <ul className={`${styles.hits} ${styles.soon}`}>
            {soon.map((t) => (
              <li key={t.id}>
                <HitLink hit={topicHit(t)} here={t.id === current} onClose={onClose} />
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}

function DrawerBody({ onClose, reading }: { onClose: () => void; reading: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const topics = useTopicsNav();
  const [open, setOpen] = useState<Set<Section>>(() => new Set());
  const [query, setQuery] = useState("");
  const theme = useHtmlAttr("data-theme");
  const font = useHtmlAttr("data-font");
  const [zoom, stepZoom] = useReaderZoom();

  function toggle(id: Section, isOpen: boolean) {
    setOpen((prev) => {
      if (prev.has(id) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const themeName = plain(THEME_ITEMS.find((t) => t.value === theme)?.label ?? "");
  const fontName = plain(FONT_ITEMS.find((f) => f.value === font)?.label ?? "");
  const current = topics.find((t) => topicBases(t).some((b) => isUnder(pathname, b)))?.id ?? null;
  const currentName = topics.find((t) => t.id === current)?.name;
  const readyCount = topics.filter((t) => t.status === "ready" && t.written > 0).length;

  const q = query.trim().toLowerCase();
  const hits: Hit[] = q
    ? [...LINKS.map((l) => ({ ...l, meta: "Page" })), ...topics.map(topicHit)].filter((h) =>
        h.label.toLowerCase().includes(q)
      )
    : [];

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && hits[0]) {
      e.preventDefault();
      router.push(hits[0].href);
      onClose();
    }
    if (e.key === "Escape" && query) {
      setQuery("");
    }
  }

  return (
    <>
      <label className={styles.search}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ margin: 0 }}>
          <path
            d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={query}
          placeholder="Jump to a page or topic"
          aria-label="Jump to a page or topic"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
        />
        {query && (
          <button type="button" className={styles.clear} aria-label="Clear the search" onClick={() => setQuery("")}>
            ×
          </button>
        )}
      </label>
      {q ? (
        <section className={styles.results} aria-label="Results">
          {hits.length ? (
            <ul className={styles.hits}>
              {hits.map((h) => (
                <li key={h.href + h.label}>
                  <HitLink hit={h} here={false} onClose={onClose} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Nothing matches “{query.trim()}”.</p>
          )}
        </section>
      ) : (
        <>
          <ProgressCard onClose={onClose} />
          <section className={styles.go} aria-label="Go to">
            <p className={styles.goHead}>Go to</p>
            <nav aria-label="Site">
              <ul className={styles.links}>
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isUnder(pathname, l.href.split("?")[0]) ? "page" : undefined}
                      onClick={onClose}
                      prefetch={false}
                      style={{ "--accent": accentVar(l.accent) } as React.CSSProperties}
                    >
                      <span className={styles.chip} aria-hidden="true">
                        {l.mark}
                      </span>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </section>
          <p className={styles.goHead}>Learn</p>
          <div className={styles.folds}>
            <Fold
              id="topics"
              title="Topics"
              summary={currentName ?? `${readyCount} to read`}
              open={open.has("topics")}
              onToggle={toggle}
            >
              <TopicList topics={topics} current={current} onClose={onClose} />
            </Fold>
          </div>
          <p className={styles.goHead}>Customize</p>
          <div className={styles.folds}>
            <Fold id="theme" title="Theme" summary={themeName} open={open.has("theme")} onToggle={toggle}>
              <AppearancePicker idPrefix="site-look" only="theme" />
            </Fold>
            <Fold id="font" title="Handwriting" summary={fontName} open={open.has("font")} onToggle={toggle}>
              <AppearancePicker idPrefix="site-look" only="font" />
            </Fold>
            {reading && (
              <Fold
                id="reading"
                title="Text size"
                summary={`${ZOOM_STEPS[zoom]}%`}
                open={open.has("reading")}
                onToggle={toggle}
              >
                <div className={styles.row} role="group" aria-label="Text size">
                  <div className={styles.stepper}>
                    <button type="button" aria-label="Smaller text" disabled={zoom === 0} onClick={() => stepZoom(-1)}>
                      A−
                    </button>
                    <output aria-live="polite">{ZOOM_STEPS[zoom]}%</output>
                    <button
                      type="button"
                      aria-label="Larger text"
                      disabled={zoom === ZOOM_STEPS.length - 1}
                      onClick={() => stepZoom(1)}
                    >
                      A+
                    </button>
                  </div>
                </div>
                <p className={styles.note}>Changes the size of chapter text across the site.</p>
              </Fold>
            )}
            {reading && (
              <Fold id="narrator" title="Narrator" summary="Listen" open={open.has("narrator")} onToggle={toggle}>
                <div className={styles.narrator}>
                  <NarrationSettings />
                </div>
                <p className={styles.note}>Used by the Listen button on every chapter.</p>
              </Fold>
            )}
          </div>
        </>
      )}
    </>
  );
}

export function SiteDrawer({
  open,
  onClose,
  reading = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  reading?: boolean;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, a")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const field = e.target as HTMLInputElement | null;
      if (field?.type === "search" && field.value) return;
      if ((e.target as HTMLElement | null)?.closest?.("[role=listbox], [data-radix-popper-content-wrapper]")) return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      back?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <aside className={styles.drawer} ref={ref} role="dialog" aria-modal="true" aria-label={`${SITE_NAME} menu`}>
        <div className={styles.head}>
          <Link href="/" className={styles.brand} onClick={onClose}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <button type="button" className={styles.close} aria-label="Close the menu" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
        <DrawerBody onClose={onClose} reading={reading} />
        <div className={styles.foot}>
          {reading && (
            <button type="button" className={styles.action} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ margin: 0 }}>
                <path
                  d="M7 9V3h10v6M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v7H7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Print or save as PDF
            </button>
          )}
          <p className={styles.footNote}>
            Your progress stays in this browser.{" "}
            <Link href="/architecture" onClick={onClose}>
              How this is built
            </Link>
          </p>
        </div>
      </aside>
    </div>,
    document.body
  );
}
