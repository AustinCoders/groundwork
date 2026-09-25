"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BackButton } from "@/components/practice/BackButton";
import { AppearancePicker } from "@/components/AppearancePicker";
import { SITE_NAME } from "@/lib/site";
import { Icon } from "./icons";
import type { BoardMeta } from "@/lib/whiteboard/storage";
import styles from "./whiteboard.module.css";

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

        <section className={styles.drawerSection} aria-labelledby="wb-look-theme">
          <AppearancePicker idPrefix="wb-look" headingClass={styles.menuH} />
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
