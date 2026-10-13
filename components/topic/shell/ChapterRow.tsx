import Link from "next/link";
import { plural } from "@/lib/format";
import { StateMark } from "./StateMark";
import type { ShellChapter } from "./types";
import styles from "./shell.module.css";

function metaOf(chapter: ShellChapter): string {
  const parts: string[] = [];
  if (chapter.minutes > 0) parts.push(`${chapter.minutes} min`);
  if (chapter.exercises > 0) parts.push(plural(chapter.exercises, "exercise"));
  return parts.join(" · ");
}

export function ChapterRow({ chapter }: { chapter: ShellChapter }) {
  const meta = metaOf(chapter);
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
        {meta && <span className={styles.rowMeta}>{meta}</span>}
      </Link>
    </li>
  );
}
