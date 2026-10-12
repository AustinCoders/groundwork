"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FocusTrap } from "@/components/FocusTrap";
import { focusLeftBehind, focusMenuPill } from "@/components/tour/menuPill";
import { SLIDES } from "@/components/tour/slides";
import { rememberTourSeen } from "@/components/tour/tourStore";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "./tour.module.css";

const LAST = SLIDES.length - 1;

export function TourDialog({ onClose }: { onClose: () => void }) {
  const copyId = useId();
  const [at, setAt] = useState(0);
  const opener = useRef<Element | null>(null);
  const next = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const slide = SLIDES[at];

  const leave = useCallback(() => {
    rememberTourSeen();
    onClose();
    requestAnimationFrame(() => {
      const back = opener.current;
      if (back instanceof HTMLElement && back.isConnected && back !== document.body) back.focus();
      if (focusLeftBehind()) focusMenuPill();
    });
  }, [onClose]);

  const finish = useCallback(() => {
    opener.current = null;
    leave();
  }, [leave]);

  const go = useCallback((to: number) => setAt(Math.min(LAST, Math.max(0, to))), []);

  useEffect(() => {
    opener.current = document.activeElement;
    next.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [at]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        leave();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setAt((index) => Math.min(LAST, index + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setAt((index) => Math.max(0, index - 1));
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [leave]);

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={leave} aria-hidden="true" />
      <FocusTrap>
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-label="Tour of Groundwork"
          aria-describedby={copyId}
          data-tour-dialog
        >
          <header className={styles.head}>
            <p className={styles.headTitle}>A quick tour</p>
            <button type="button" className={styles.skip} onClick={leave}>
              Skip tour
            </button>
          </header>
          <div className={styles.body} ref={body} role="region" aria-label="Tour step" tabIndex={0}>
            <div className={styles.copy} id={copyId}>
              <Eyebrow no={String(at + 1).padStart(2, "0")} as="p">
                {slide.label}
              </Eyebrow>
              <h2 className={styles.title}>{slide.title}</h2>
              <p className={styles.lead}>{slide.lead}</p>
              {slide.action && (
                <Link href={slide.action.href} className={styles.primary} prefetch={false} onClick={finish}>
                  {slide.action.label} →
                </Link>
              )}
            </div>
            <div className={styles.stage} key={slide.id} data-tour-stage={slide.id}>
              {slide.stage}
            </div>
          </div>
          <footer className={styles.foot}>
            <ol className={styles.dots} aria-hidden="true">
              {SLIDES.map((item, index) => (
                <li key={item.id} className={styles.dot} data-here={index === at || undefined} />
              ))}
            </ol>
            <div className={styles.steps}>
              <button type="button" className={styles.ghost} disabled={at === 0} onClick={() => go(at - 1)}>
                Back
              </button>
              <button
                type="button"
                className={styles.primary}
                ref={next}
                onClick={at === LAST ? finish : () => go(at + 1)}
              >
                {at === LAST ? "Done" : "Next"}
              </button>
            </div>
          </footer>
          <p className="visually-hidden" role="status" aria-live="polite">
            Step {at + 1} of {SLIDES.length}: {slide.label}
          </p>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}
