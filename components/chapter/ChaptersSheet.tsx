"use client";

import { useEffect } from "react";
import { FocusTrap } from "@/components/FocusTrap";
import { CloseButton } from "@/components/ui/MenuKit";
import { ChaptersButton } from "./ChapterKit";
import styles from "./rail.module.css";

const SHEET_ID = "chapters-sheet";

export function ChaptersSheetButton({ open, onOpen, label }: { open: boolean; onOpen: () => void; label?: string }) {
  return <ChaptersButton open={open} controls={SHEET_ID} onOpen={onOpen} label={label} />;
}

export function ChaptersSheet({
  open,
  onClose,
  label = "Chapters",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label?: string;
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
        <div className={styles.sheet} id={SHEET_ID} role="dialog" aria-modal="true" aria-label={label}>
          <div className={styles.sheetHead}>
            <p className={styles.sheetTitle}>{label}</p>
            <CloseButton label={`Close ${label.toLowerCase()}`} onClose={onClose} />
          </div>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}
