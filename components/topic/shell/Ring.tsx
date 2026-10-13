"use client";

import { useEffect, useState } from "react";
import styles from "./shell.module.css";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function Ring({ read, total, label }: { read: number; total: number; label: string }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const share = total > 0 ? Math.min(1, read / total) : 0;
  const offset = filled ? CIRCUMFERENCE * (1 - share) : CIRCUMFERENCE;

  return (
    <span className={styles.ring} data-ring role="img" aria-label={`${read} of ${total} ${label}`}>
      <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
        <circle className={styles.ringTrack} cx="50" cy="50" r={RADIUS} />
        {read > 0 && (
          <circle
            className={styles.ringFill}
            cx="50"
            cy="50"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <span className={styles.ringText} aria-hidden="true">
        <span className={styles.ringRead}>{read}</span>
        <span className={styles.ringOf}>of {total}</span>
      </span>
    </span>
  );
}
