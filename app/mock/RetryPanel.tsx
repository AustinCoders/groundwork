"use client";

import { RETIRE_AT, RETRY_BELOW, type RetryEntry } from "@/lib/mock/storage";
import type { StageId, StageInfo } from "@/lib/mock/types";
import kit from "./mockKit.module.css";
import styles from "./plan.module.css";

export function RetryPanel({
  retry,
  stages,
  busy,
  error,
  onStart,
}: {
  retry: RetryEntry[];
  stages: Record<StageId, StageInfo>;
  busy: boolean;
  error: string | null;
  onStart: () => void;
}) {
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelKicker}>The ones that got away</p>
      {retry.length === 0 ? (
        <p className={styles.empty}>
          Nothing here yet. Any question you score under {Math.round(RETRY_BELOW * 100)}% on lands in this list, and
          comes off it once you answer it well.
        </p>
      ) : (
        <>
          <p className={styles.panelSub}>
            The next {Math.min(10, retry.length)} of {retry.length}, most recent first. Score{" "}
            {Math.round(RETIRE_AT * 100)}% or better and it comes off the list.
          </p>
          <ul className={styles.retryList}>
            {retry.slice(0, 10).map((r) => (
              <li key={r.id} className={styles.retryItem}>
                <span className={styles.retryTitle}>{r.title}</span>
                <span className={styles.retryMeta}>
                  {stages[r.stage]?.title} · {Math.round(r.score * 100)}%
                </span>
              </li>
            ))}
          </ul>
          <div className={styles.startBar}>
            <button type="button" className={kit.btn} disabled={busy} onClick={onStart}>
              {busy ? "Setting up the room…" : "Retry these"}
            </button>
          </div>
        </>
      )}
      {error && <p className="warn">{error}</p>}
    </div>
  );
}
