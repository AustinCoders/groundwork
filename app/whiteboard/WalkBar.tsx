"use client";

import styles from "./walk.module.css";

export function WalkBar({
  title,
  step,
  total,
  caption,
  onStep,
  onExit,
}: {
  title: string;
  step: number;
  total: number;
  caption: string;
  onStep: (next: number) => void;
  onExit: () => void;
}) {
  return (
    <section className={styles.bar} aria-label={`Walkthrough of ${title}`}>
      <p className={styles.count}>
        <span>{title}</span>
        <span>
          Step {step} of {total}
        </span>
      </p>
      <p className={styles.caption} role="status" aria-live="polite">
        {caption}
      </p>
      <div className={styles.row}>
        <button type="button" onClick={() => onStep(step - 1)} disabled={step <= 1}>
          ← Back
        </button>
        <button type="button" className={styles.next} onClick={() => onStep(step + 1)} disabled={step >= total}>
          Next →
        </button>
        <button type="button" className={styles.exit} onClick={onExit}>
          Show everything
        </button>
      </div>
    </section>
  );
}
