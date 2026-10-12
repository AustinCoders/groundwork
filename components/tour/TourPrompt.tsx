"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { focusLeftBehind, focusMenuPill } from "@/components/tour/menuPill";
import { rememberTourSeen } from "@/components/tour/tourStore";
import { isEditableTarget } from "@/lib/menuShortcut";
import styles from "./tour.module.css";

export function TourPrompt({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  const skip = useCallback(() => {
    const hadFocus = document.activeElement?.closest("[data-tour-prompt]") != null;
    rememberTourSeen();
    onClose();
    if (hadFocus) requestAnimationFrame(() => focusLeftBehind() && focusMenuPill());
  }, [onClose]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (isEditableTarget(event.target) || document.querySelector("[aria-modal=true]")) return;
      skip();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [skip]);

  return createPortal(
    <aside className={styles.prompt} role="region" aria-label="First visit tour" data-tour-prompt>
      <span className={styles.promptTape} aria-hidden="true" />
      <p className={styles.promptTitle}>First time here?</p>
      <p className={styles.promptText}>Take a 30-second tour of what is here and where everything lives.</p>
      <div className={styles.promptActions}>
        <button type="button" className={styles.primary} onClick={onStart}>
          Start the tour
        </button>
        <button type="button" className={styles.ghost} aria-label="Skip the tour" onClick={skip}>
          Skip
        </button>
      </div>
    </aside>,
    document.body
  );
}
