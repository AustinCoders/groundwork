"use client";

import { useEffect, useRef, useState } from "react";
import { topicKit } from "@/components/topic/TopicKit";
import styles from "./placement.module.css";

export function ResetPlan({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const resetRef = useRef<HTMLButtonElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (confirming) keepRef.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      resetRef.current?.focus();
    }
  }, [confirming]);

  if (!confirming) {
    return (
      <button
        type="button"
        className={styles.textButton}
        id="plan-reset"
        ref={resetRef}
        onClick={() => setConfirming(true)}
      >
        Reset my plan
      </button>
    );
  }

  return (
    <div className={styles.confirm} role="group" aria-label="Reset my plan">
      <p>Clear this plan from the device? Your ticks, XP and review queue stay as they are.</p>
      <button type="button" className={topicKit.btn} id="plan-reset-yes" onClick={onReset}>
        Yes, reset my plan
      </button>
      <button
        type="button"
        className={topicKit.btnGhost}
        id="plan-reset-no"
        ref={keepRef}
        onClick={() => {
          returnFocus.current = true;
          setConfirming(false);
        }}
      >
        Keep my plan
      </button>
    </div>
  );
}
