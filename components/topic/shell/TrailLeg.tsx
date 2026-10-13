import styles from "./shell.module.css";

const WAVE = "M50 0 C100 32 0 68 50 100";

export function TrailLeg({ walked }: { walked: boolean }) {
  return (
    <span className={styles.leg} aria-hidden="true" data-walked={walked ? "true" : undefined}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className={styles.legTrack} d={WAVE} />
        <path className={styles.legWalked} d={WAVE} />
      </svg>
    </span>
  );
}
