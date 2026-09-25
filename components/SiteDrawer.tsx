"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import styles from "./SiteDrawer.module.css";

const LINKS: { href: string; label: string; mark: string }[] = [
  { href: "/", label: "Home", mark: "⌂" },
  { href: "/practice?id=free", label: "Playground", mark: "✎" },
  { href: "/problems", label: "Problems", mark: "⌘" },
  { href: "/whiteboard", label: "Whiteboard", mark: "▱" },
  { href: "/git", label: "Git", mark: "⑂" },
  { href: "/mock", label: "Mock interview", mark: "⏱" },
  { href: "/review", label: "Review", mark: "↻" },
  { href: "/progress", label: "Progress", mark: "▤" },
  { href: "/architecture", label: "How this is built", mark: "▤" },
];

type Section = "go" | "theme" | "font" | "reading" | "narrator";

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
  go: null,
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

function DrawerBody({ onClose, reading }: { onClose: () => void; reading: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Set<Section>>(() => new Set());
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

  return (
    <>
      <ProgressCard onClose={onClose} />
      <section className={styles.go} aria-label="Go to">
        <p className={styles.goHead}>Go to</p>
        <nav aria-label="Site">
          <ul className={styles.links}>
            {LINKS.map((l) => {
              const base = l.href.split("?")[0];
              const here = base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
              return (
                <li key={l.href}>
                  <Link href={l.href} aria-current={here ? "page" : undefined} onClick={onClose} prefetch={false}>
                    <span aria-hidden="true">{l.mark}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>
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
