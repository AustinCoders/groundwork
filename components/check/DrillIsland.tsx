import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/MenuKit";
import styles from "@/components/topic/reader.module.css";
import { chapters } from "@/lib/content";
import { loadDrill } from "@/lib/designDrill";
import { withHeadingIds } from "@/lib/headingToc";
import { DrillCard } from "./DrillCardLoader";

export async function DrillIsland({ topicId, chapterId }: { topicId: string; chapterId: string }): Promise<ReactNode> {
  const drill = await loadDrill(chapterId);
  if (!drill) return null;
  const chapter = chapters(topicId).find((item) => item.id === chapterId);
  const titles: Record<string, string> = {};
  for (const heading of withHeadingIds(chapter?.body ?? "").toc) titles[heading.id] = heading.text;
  return (
    <section
      id="drill"
      className={`${styles.island} ${styles.checkIsland}`}
      data-island="drill"
      data-speech-exclude=""
      aria-label="Design drill"
    >
      <Eyebrow no="✎" as="p">
        Design drill
      </Eyebrow>
      <DrillCard key={chapterId} chapterId={chapterId} drill={drill} titles={titles} />
    </section>
  );
}
