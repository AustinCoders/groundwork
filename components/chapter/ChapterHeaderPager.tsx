import Link from "next/link";
import { TopIcon } from "@/components/practice/TopIcon";
import type { SeriesCard } from "./types";
import styles from "@/components/series/chapter.module.css";

export function ChapterHeaderPager({
  index,
  total,
  prev,
  next,
  basePath,
}: {
  index: number;
  total: number;
  prev?: SeriesCard<string>;
  next?: SeriesCard<string>;
  basePath: string;
}) {
  return (
    <>
      {prev ? (
        <Link
          className={styles.iconBtn}
          href={`${basePath}/${prev.id}`}
          aria-label={`Previous: ${prev.title}`}
          data-tip={`${prev.num} · ${prev.short || prev.title} — [`}
        >
          <TopIcon name="prev" />
        </Link>
      ) : (
        <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
          <TopIcon name="prev" />
        </span>
      )}
      <span className={styles.position}>
        {index + 1} / {total}
      </span>
      {next ? (
        <Link
          className={styles.iconBtn}
          href={`${basePath}/${next.id}`}
          aria-label={`Next: ${next.title}`}
          data-tip={`${next.num} · ${next.short || next.title} — ]`}
        >
          <TopIcon name="next" />
        </Link>
      ) : (
        <span className={`${styles.iconBtn} ${styles.off}`} aria-hidden="true">
          <TopIcon name="next" />
        </span>
      )}
    </>
  );
}
