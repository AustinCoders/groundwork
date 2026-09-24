"use client";

import { useEffect, useRef } from "react";
import { useNow } from "@/app/mock/useStageBanks";
import { formatClock } from "@/lib/mockSession";
import styles from "./mock.module.css";

const R = 44;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function TimerRing({
  startedAt,
  seconds,
  label = "left",
  onExpire,
}: {
  startedAt: number;
  seconds: number;
  label?: string;
  onExpire?: () => void;
}) {
  const now = useNow(true);
  const elapsed = Math.max(0, (now - startedAt) / 1000);
  const left = Math.max(0, seconds - elapsed);
  const fraction = seconds > 0 ? left / seconds : 0;
  const state = left <= 0 ? "over" : left <= Math.min(30, seconds * 0.2) ? "low" : "ok";

  const fired = useRef(false);
  useEffect(() => {
    fired.current = false;
  }, [startedAt]);
  useEffect(() => {
    if (left <= 0 && !fired.current) {
      fired.current = true;
      onExpire?.();
    }
  }, [left, onExpire]);

  return (
    <div className={styles.timer} data-state={state} role="timer" aria-label={`${formatClock(left)} ${label}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.timerTrack} cx="50" cy="50" r={R} />
        <circle
          className={styles.timerArc}
          cx="50"
          cy="50"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        />
      </svg>
      <div className={styles.timerText}>
        <span className={styles.timerNum}>{formatClock(left)}</span>
        <span className={styles.timerLabel}>{state === "over" ? "time" : label}</span>
      </div>
    </div>
  );
}

export function InlineTimer({ startedAt, seconds }: { startedAt: number; seconds: number }) {
  const now = useNow(true);
  const left = seconds - (now - startedAt) / 1000;
  const state = left <= 0 ? "over" : left <= 120 ? "low" : "ok";
  return (
    <span className={styles.inlineTimer} data-state={state} role="timer" aria-label="Time left for this problem">
      {left <= 0 ? `+${formatClock(-left)}` : formatClock(left)}
    </span>
  );
}

export function Elapsed({ since, until }: { since: number; until: number | null }) {
  const now = useNow(until === null);
  const s = Math.max(0, Math.floor(((until ?? now) - since) / 1000));
  const h = Math.floor(s / 3600);
  const text = h ? `${h}:${formatClock(s % 3600).padStart(5, "0")}` : formatClock(s);
  return <span className={styles.clock}>{text}</span>;
}
