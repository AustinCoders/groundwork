import styles from "@/components/topic/reader.module.css";

export function PlayIsland({ id }: { id: string }) {
  return (
    <section
      className={styles.island}
      data-island="play"
      data-play={id}
      data-no-smooth=""
      data-speech-exclude=""
      aria-label="Play it"
    >
      <p className={styles.islandKicker}>Play it</p>
      <p className={styles.islandText}>The step-by-step player for this chapter is not built yet.</p>
    </section>
  );
}
