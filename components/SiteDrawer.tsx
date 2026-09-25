"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AppearancePicker } from "@/components/AppearancePicker";
import { NarrationSettings } from "@/components/reader/NarrationSettings";
import { ZOOM_STEPS, useReaderZoom } from "@/lib/readerZoom";
import { FONT_ITEMS, THEME_ITEMS } from "@/lib/storage";
import { SITE_NAME } from "@/lib/site";
import styles from "./SiteDrawer.module.css";

const LINKS: { href: string; label: string; mark: string }[] = [
  { href: "/", label: "Home", mark: "⌂" },
  { href: "/practice?id=free", label: "Playground", mark: "✎" },
  { href: "/problems", label: "Problems", mark: "⌘" },
  { href: "/whiteboard", label: "Whiteboard", mark: "▱" },
  { href: "/mock", label: "Mock interview", mark: "⏱" },
  { href: "/review", label: "Review", mark: "↻" },
  { href: "/progress", label: "Progress", mark: "▤" },
  { href: "/architecture", label: "How this is built", mark: "▤" },
];

type Section = "go" | "theme" | "font" | "reading" | "narrator";

const OPEN_KEY = "groundwork:drawer:open";
const DEFAULT_OPEN: Section[] = ["go", "theme"];

function readOpen(): Set<Section> {
  try {
    const raw = localStorage.getItem(OPEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as Section[]) : DEFAULT_OPEN);
  } catch {
    return new Set(DEFAULT_OPEN);
  }
}

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
    <details className={styles.fold} open={open} onToggle={(e) => onToggle(id, e.currentTarget.open)}>
      <summary className={styles.foldHead}>
        <span className={styles.foldTitle}>{title}</span>
        {summary && <span className={styles.foldSummary}>{summary}</span>}
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.foldBody}>{children}</div>
    </details>
  );
}

function DrawerBody({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Set<Section>>(readOpen);
  const theme = useHtmlAttr("data-theme");
  const font = useHtmlAttr("data-font");
  const [zoom, stepZoom] = useReaderZoom();

  function toggle(id: Section, isOpen: boolean) {
    setOpen((prev) => {
      if (prev.has(id) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      try {
        localStorage.setItem(OPEN_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  const themeName = plain(THEME_ITEMS.find((t) => t.value === theme)?.label ?? "");
  const fontName = plain(FONT_ITEMS.find((f) => f.value === font)?.label ?? "");

  return (
    <>
      <Fold id="go" title="Go to" open={open.has("go")} onToggle={toggle}>
        <nav aria-label="Site">
          <ul className={styles.links}>
            {LINKS.map((l) => {
              const here = l.href.split("?")[0] === pathname;
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
      </Fold>
      <Fold id="theme" title="Theme" summary={themeName} open={open.has("theme")} onToggle={toggle}>
        <AppearancePicker idPrefix="site-look" only="theme" />
      </Fold>
      <Fold id="font" title="Handwriting" summary={fontName} open={open.has("font")} onToggle={toggle}>
        <AppearancePicker idPrefix="site-look" only="font" />
      </Fold>
      <Fold id="reading" title="Reading" summary={`${ZOOM_STEPS[zoom]}%`} open={open.has("reading")} onToggle={toggle}>
        <div className={styles.row} role="group" aria-label="Text size">
          <span className={styles.rowLabel}>Text size</span>
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
      <Fold id="narrator" title="Narrator" summary="Listen" open={open.has("narrator")} onToggle={toggle}>
        <div className={styles.narrator}>
          <NarrationSettings />
        </div>
        <p className={styles.note}>Used by the Listen button on every chapter.</p>
      </Fold>
    </>
  );
}

export function SiteDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, a, summary")?.focus();
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
        <div className={styles.folds}>
          <DrawerBody onClose={onClose} />
        </div>
        <div className={styles.foot}>
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
        </div>
      </aside>
    </div>,
    document.body
  );
}
