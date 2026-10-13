import Link from "next/link";
import { plural } from "@/lib/format";
import { StateMark } from "./StateMark";
import type { ShellChapter } from "./types";
import styles from "./shell.module.css";

export function ChapterRow({ chapter }: { chapter: ShellChapter }) {
  const minutes = chapter.minutes > 0 ? `${chapter.minutes} min` : null;
  const exercises = chapter.exercises > 0 ? plural(chapter.exercises, "exercise") : null;
  return (
    <li className={styles.row} data-kind={chapter.mark.kind} data-next={chapter.next || undefined}>
      <Link
        className={styles.rowLink}
        href={chapter.href}
        prefetch={false}
        aria-current={chapter.next ? "step" : undefined}
      >
        <StateMark mark={chapter.mark} />
        <span className={styles.rowCode}>{chapter.code}</span>
        <span className={styles.rowMain}>
          <span className={styles.rowTitle}>{chapter.title}</span>
          {chapter.tag && <span className={styles.rowTag}>{chapter.tag}</span>}
        </span>
        <span className={styles.rowMeta}>
          {minutes && <span className={styles.rowTime}>{minutes}</span>}
          {exercises && <span className={styles.rowEx}>{exercises}</span>}
        </span>
      </Link>
    </li>
  );
}
