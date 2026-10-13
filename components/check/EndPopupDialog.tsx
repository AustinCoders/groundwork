"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "@/components/FocusTrap";
import { PLAIN_KEYS } from "@/lib/endPopup";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "./endPopup.module.css";

export function EndPopupDialog({ title, onYes, onClose }: { title: string; onYes: () => void; onClose: () => void }) {
  const titleId = useId();
  const copyId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const leave = useCallback(() => {
    const back = opener.current;
    onClose();
    requestAnimationFrame(() => {
      if (back instanceof HTMLElement && back.isConnected && back !== document.body) back.focus();
    });
  }, [onClose]);

  useEffect(() => {
    if (!dialog.current?.contains(document.activeElement)) opener.current = document.activeElement;
    dialog.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const root = dialog.current;
    if (!root) return;
    const keepKeysHere = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (PLAIN_KEYS.has(event.key)) event.stopPropagation();
    };
    root.addEventListener("keydown", keepKeysHere);
    return () => root.removeEventListener("keydown", keepKeysHere);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      leave();
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [leave]);

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={leave} aria-hidden="true" />
      <FocusTrap>
        <div
          ref={dialog}
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={copyId}
          tabIndex={-1}
          data-end-popup
        >
          <span className={styles.tape} aria-hidden="true" />
          <Eyebrow no="✓" as="p">
            You reached the end
          </Eyebrow>
          <h2 id={titleId} className={styles.title}>
            Mark this chapter done?
          </h2>
          <p id={copyId} className={styles.text}>
            You have reached the end of {title}. A short check marks it done. Not yet is fine: the check waits at the
            end of the chapter.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onYes}>
              Yes, start the check
            </button>
            <button type="button" className={styles.ghost} onClick={leave}>
              Not yet
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
