import Link from "next/link";
import { TopIcon } from "@/components/practice/TopIcon";
import type { SeriesCard } from "./types";
import styles from "@/components/series/chapter.module.css";

export function ChapterPager({
  prev,
  next,
  basePath,
  homeLabel,
}: {
  prev?: SeriesCard<string>;
  next?: SeriesCard<string>;
  basePath: string;
  homeLabel: string;
}) {
  return (
    <nav className={styles.pager} aria-label="Chapter navigation">
      <Link className={styles.pageCard} href={prev ? `${basePath}/${prev.id}` : basePath}>
        <span className={styles.pageArrow} aria-hidden="true">
          <TopIcon name="prev" size={18} />
        </span>
        <span className={styles.pageText}>
          <span className={styles.pageHint}>{prev ? `Previous · ${prev.num}` : "Back to"}</span>
          <span className={styles.pageTitle}>{prev ? prev.title : homeLabel}</span>
        </span>
      </Link>
      <Link className={`${styles.pageCard} ${styles.pageNext}`} href={next ? `${basePath}/${next.id}` : basePath}>
        <span className={styles.pageText}>
          <span className={styles.pageHint}>{next ? `Next · ${next.num}` : "The end"}</span>
          <span className={styles.pageTitle}>{next ? next.title : `Back to ${homeLabel.toLowerCase()}`}</span>
        </span>
        <span className={styles.pageArrow} aria-hidden="true">
          <TopIcon name="next" size={18} />
        </span>
      </Link>
    </nav>
  );
}
