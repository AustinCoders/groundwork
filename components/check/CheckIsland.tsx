import { loadPool } from "@/lib/quizPool";
import styles from "@/components/topic/reader.module.css";
import { CheckRunner } from "./CheckRunner";

export async function CheckIsland({ chapterId, basePath }: { chapterId: string; basePath: string }) {
  const pool = await loadPool(chapterId);
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
      <CheckRunner key={chapterId} chapterId={chapterId} basePath={basePath} questions={pool?.questions ?? []} />
    </section>
  );
}
