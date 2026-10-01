"use client";

import { useEffect } from "react";
import { FocusTrap } from "@/components/FocusTrap";
import { TopIcon } from "@/components/practice/TopIcon";
import styles from "@/components/series/chapter.module.css";

const SHEET_ID = "chapters-sheet";

export function ChaptersSheetButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles.railBtn}`}
      aria-expanded={open}
      aria-controls={SHEET_ID}
      onClick={onOpen}
    >
      <TopIcon name="list" size={16} />
      Chapters
    </button>
  );
}

export function ChaptersSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const field = e.target as HTMLInputElement | null;
      if (field?.type === "search" && field.value) return;
      onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.sheetRoot}>
      <div className={styles.sheetBackdrop} onClick={onClose} aria-hidden="true" />
      <FocusTrap>
        <div className={styles.sheet} id={SHEET_ID} role="dialog" aria-modal="true" aria-label="Chapters">
          <div className={styles.sheetHead}>
            <p className={styles.sheetTitle}>Chapters</p>
            <button type="button" className={styles.iconBtn} aria-label="Close chapters" onClick={onClose}>
              ×
            </button>
          </div>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}
