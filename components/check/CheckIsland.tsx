import { loadPool } from "@/lib/quizPool";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "@/components/topic/reader.module.css";
import { CheckRunner } from "./CheckRunnerLoader";

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
      <Eyebrow no="✓" as="p">
        Check yourself
      </Eyebrow>
      <CheckRunner key={chapterId} chapterId={chapterId} basePath={basePath} questions={pool?.questions ?? []} />
    </section>
  );
}
