import styles from "@/components/topic/reader.module.css";

export function CheckIsland() {
  return (
    <section
      id="check"
      className={`${styles.island} ${styles.checkIsland}`}
      data-island="check"
      data-speech-exclude=""
      aria-label="Chapter check"
      tabIndex={-1}
    >
      <p className={styles.islandKicker}>Check yourself</p>
      <p className={styles.islandText}>
        The chapter check is not built yet, so marking a chapter done is paused here until it is.
      </p>
    </section>
  );
}
