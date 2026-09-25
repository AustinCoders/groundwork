"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BackButton } from "@/components/practice/BackButton";
import { useFontChoice, useThemeChoice } from "@/components/ThemeFontPicker";
import { FONT_ITEMS, THEME_ITEMS, type FontValue, type ThemeValue } from "@/lib/storage";
import { SITE_NAME } from "@/lib/site";
import { Icon } from "./icons";
import type { BoardMeta } from "@/lib/whiteboard/storage";
import styles from "./whiteboard.module.css";

const THEME_COLOURS: Record<ThemeValue, [string, string, string]> = {
  light: ["#fffdf6", "#1f3a73", "#1f7a55"],
  dark: ["#191d25", "#d9e5fb", "#64dfa6"],
  kraft: ["#ecdfc0", "#3b2a14", "#2f6b4a"],
  blueprint: ["#1c3c5e", "#eaf4ff", "#7fe0b8"],
  sepia: ["#faf1dc", "#4a3221", "#4c7a52"],
  forest: ["#f8fbf2", "#2c4a24", "#2f7d4f"],
  rose: ["#241823", "#f7dbe8", "#7fe0b8"],
  mono: ["#ffffff", "#111111", "#276b38"],
  lavender: ["#faf7fe", "#402a63", "#2f8a6f"],
};

const FONT_FAMILIES: Record<FontValue, string> = {
  classic: "var(--font-caveat), cursive",
  marker: "var(--font-patrick-hand), cursive",
  sketch: "var(--font-architects-daughter), cursive",
  pen: "var(--font-gochi-hand), cursive",
  script: "var(--font-dancing-script), cursive",
  serif: "var(--font-literata), Georgia, serif",
  roboto: "var(--font-roboto), system-ui, sans-serif",
};

const plain = (label: string) => label.replace(/^\S+\s/, "");

export function BoardMenu({
  boards,
  current,
  onOpen,
  onNew,
  onRename,
  onDelete,
  onExport,
  onCopyPng,
  onImport,
  onShare,
  onClear,
}: {
  boards: BoardMeta[];
  current: BoardMeta | undefined;
  onOpen: (id: string) => void;
  onNew: () => void;
  onRename: (name: string) => void;
  onDelete: (id: string) => void;
  onExport: (kind: "png" | "svg" | "json") => void;
  onCopyPng: () => void;
  onImport: (text: string) => void;
  onShare: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [theme, chooseTheme] = useThemeChoice();
  const [font, chooseFont] = useFontChoice();
  const drawerRef = useRef<HTMLElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    drawerRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const act = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  const host = typeof document === "undefined" ? null : document.getElementById("board");

  const drawer = (
    <>
      <div className={styles.drawerBackdrop} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={styles.drawer} ref={drawerRef} aria-label="Board menu" data-overlay>
        <div className={styles.drawerHead}>
          <p className={styles.drawerTitle}>{SITE_NAME}</p>
          <button
            type="button"
            className={styles.panelClose}
            aria-label="Close the menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <button type="button" className={styles.shareCard} onClick={act(onShare)}>
          <Icon name="share" />
          <span>
            <strong>Share this board</strong>
            <small>Copies a link. Whoever opens it gets their own copy of everything drawn so far.</small>
          </span>
        </button>

        <section className={styles.drawerSection} aria-labelledby="wb-boards">
          <h2 id="wb-boards" className={styles.menuH}>
            Boards
          </h2>
          <ul className={styles.boardList}>
            {boards.map((b) => (
              <li key={b.id} data-current={b.id === current?.id || undefined}>
                <button
                  type="button"
                  onClick={act(() => onOpen(b.id))}
                  aria-current={b.id === current?.id || undefined}
                >
                  <span>{b.name}</span>
                  <span className={styles.boardMeta}>
                    {b.count} ·{" "}
                    {new Date(b.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.boardDelete}
                  aria-label={`Delete ${b.name}`}
                  title={`Delete ${b.name}`}
                  onClick={act(() => onDelete(b.id))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.newBoard} onClick={act(onNew)}>
            + New board
          </button>
        </section>

        <section className={styles.drawerSection} aria-labelledby="wb-look">
          <h2 id="wb-look" className={styles.menuH}>
            Theme
          </h2>
          <div className={styles.themeGrid} role="radiogroup" aria-labelledby="wb-look">
            {THEME_ITEMS.map((t) => {
              const [sheet, ink, accent] = THEME_COLOURS[t.value];
              return (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === t.value}
                  className={styles.themeOpt}
                  onClick={() => chooseTheme(t.value)}
                >
                  <span className={styles.themeSwatch} style={{ background: sheet }} aria-hidden="true">
                    <span style={{ background: ink }} />
                    <span style={{ background: accent }} />
                  </span>
                  <span>{plain(t.label)}</span>
                </button>
              );
            })}
          </div>
          <h2 id="wb-font" className={styles.menuH}>
            Handwriting
          </h2>
          <div className={styles.fontGrid} role="radiogroup" aria-labelledby="wb-font">
            {FONT_ITEMS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="radio"
                aria-checked={font === f.value}
                className={styles.fontOpt}
                onClick={() => chooseFont(f.value)}
              >
                <span className={styles.fontSample} style={{ fontFamily: FONT_FAMILIES[f.value] }} aria-hidden="true">
                  Aa
                </span>
                <span>{plain(f.label)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.drawerSection} aria-labelledby="wb-export">
          <h2 id="wb-export" className={styles.menuH}>
            Export and files
          </h2>
          <div className={styles.exportGrid}>
            <button type="button" onClick={act(() => onExport("png"))}>
              PNG image
            </button>
            <button type="button" onClick={act(() => onExport("svg"))}>
              SVG image
            </button>
            <button type="button" onClick={act(onCopyPng)}>
              Copy as PNG
            </button>
            <button type="button" onClick={act(() => onExport("json"))}>
              Board file
            </button>
            <button
              type="button"
              className={styles.exportWide}
              onClick={() => {
                setOpen(false);
                fileRef.current?.click();
              }}
            >
              Open a board file…
            </button>
          </div>
        </section>

        <button type="button" className={styles.clearBtn} onClick={act(onClear)}>
          Clear this board
        </button>
      </aside>
    </>
  );

  return (
    <div className={styles.menuWrap}>
      <BackButton variant="icon" className={styles.menuBtn} fallbackHref="/" fallbackLabel="Back to Groundwork" />
      <span className={styles.islandSep} aria-hidden="true" />
      <button
        ref={toggleRef}
        type="button"
        className={styles.menuBtn}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Boards and export"
        data-tip="Boards, theme and export"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="menu" />
      </button>
      <input
        className={styles.boardName}
        aria-label="Board name"
        key={current?.id}
        defaultValue={current?.name ?? ""}
        onBlur={(e) => {
          if (!e.target.value.trim()) e.target.value = current?.name ?? "";
          else onRename(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
      {open && host && createPortal(drawer, host)}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void f.text().then(onImport);
          e.target.value = "";
        }}
      />
    </div>
  );
}
