"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { arrivedAtCheck } from "@/lib/checkBanner";
import { requestCheck } from "@/lib/checkOpen";
import { END_POPUP_DWELL_MS, END_POPUP_LOOKAHEAD, reachedEnd, shouldOpenEndPopup } from "@/lib/endPopup";
import { useMounted } from "@/lib/hooks";
import { quizStore, useQuizRecord } from "@/lib/quizStore";

const loadDialog = () => import("./EndPopupDialog").then((module) => ({ default: module.EndPopupDialog }));
const EndPopupDialog = lazy(loadDialog);

const QUESTION_ON_SCREEN = '[data-island="check"] fieldset[data-question]';
const END_CARD = "[data-end-card]";
const OTHER_MODAL = '[aria-modal="true"], [role="dialog"], dialog[open]';

export function EndPopup({
  chapterId,
  title,
  done,
  hasCheck,
}: {
  chapterId: string;
  title: string;
  done: boolean;
  hasCheck: boolean;
}) {
  const mounted = useMounted();
  const dismissed = useQuizRecord(chapterId)?.popupDismissed === true;
  const [open, setOpen] = useState(false);
  const arrived = useRef(false);
  const eligible = mounted && hasCheck && !done && !dismissed;

  useEffect(() => {
    arrived.current = arrivedAtCheck(window.location.hash);
  }, []);

  useEffect(() => {
    const target = document.querySelector(END_CARD);
    if (!eligible || !target || typeof IntersectionObserver === "undefined") return;
    void loadDialog();
    let timer = 0;
    let firstReport = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        window.clearTimeout(timer);
        const reached = reachedEnd(
          { isIntersecting: entry.isIntersecting, top: entry.boundingClientRect.top },
          firstReport
        );
        firstReport = false;
        if (!reached) return;
        timer = window.setTimeout(() => {
          const ask = shouldOpenEndPopup({
            mounted: true,
            hasCheck: true,
            done: false,
            dismissed: false,
            hash: window.location.hash,
            arrivedAtCheck: arrived.current,
            checking: document.querySelector(QUESTION_ON_SCREEN) !== null,
            modalOpen: document.querySelector(OTHER_MODAL) !== null,
          });
          if (ask) setOpen(true);
        }, END_POPUP_DWELL_MS);
      },
      { rootMargin: END_POPUP_LOOKAHEAD }
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [eligible]);

  const close = useCallback(() => {
    quizStore.recordPopupDismissed(chapterId);
    setOpen(false);
  }, [chapterId]);

  const accept = useCallback(() => {
    quizStore.recordPopupDismissed(chapterId);
    setOpen(false);
    window.setTimeout(() => {
      requestCheck();
      window.location.hash = "check";
    }, 0);
  }, [chapterId]);

  return open ? (
    <Suspense fallback={null}>
      <EndPopupDialog title={title} onYes={accept} onClose={close} />
    </Suspense>
  ) : null;
}
