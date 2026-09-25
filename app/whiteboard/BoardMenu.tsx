"use client";

import { useEffect, useRef, useState } from "react";
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
  const boxRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        setOpen(false);
      } else if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const act = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className={styles.menuWrap} ref={boxRef}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Boards and export"
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
      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.menuH}>Boards</p>
          <ul className={styles.boardList}>
            {boards.map((b) => (
              <li key={b.id} data-current={b.id === current?.id || undefined}>
                <button type="button" role="menuitem" onClick={act(() => onOpen(b.id))}>
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
                  onClick={() => {
                    if (window.confirm(`Delete “${b.name}”? This cannot be undone.`)) onDelete(b.id);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(onNew)}>
            + New board
          </button>
          <p className={styles.menuH}>Export</p>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(() => onExport("png"))}>
            PNG image
          </button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(() => onExport("svg"))}>
            SVG image
          </button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(() => onExport("json"))}>
            Board file (.json)
          </button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(onCopyPng)}>
            Copy as PNG
          </button>
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
          >
            Open a board file…
          </button>
          <button type="button" role="menuitem" className={styles.menuItem} onClick={act(onShare)}>
            Copy a share link
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.danger}`}
            onClick={act(onClear)}
          >
            Clear this board
          </button>
        </div>
      )}
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
