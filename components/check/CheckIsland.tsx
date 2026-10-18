import { loadCheckQuestions } from "@/lib/checkPool";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "@/components/topic/reader.module.css";
import { CheckRunner } from "./CheckRunnerLoader";

export async function CheckIsland({
  chapterId,
  basePath,
  practice = false,
}: {
  chapterId: string;
  basePath: string;
  practice?: boolean;
}) {
  const questions = await loadCheckQuestions(chapterId);
  if (!questions || questions.length === 0) return null;
  return (
    <section
      id="check"
      className={`${styles.island} ${styles.checkIsland}`}
      data-island="check"
      data-speech-exclude=""
      aria-label={practice ? "Chapter practice" : "Chapter check"}
      tabIndex={-1}
    >
      <Eyebrow no="✓" as="p">
        {practice ? "Practise" : "Check yourself"}
      </Eyebrow>
      <CheckRunner
        key={chapterId}
        chapterId={chapterId}
        basePath={basePath}
        questions={questions}
        practice={practice}
      />
    </section>
  );
}
