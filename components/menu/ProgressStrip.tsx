"use client";

import Link from "next/link";
import { computeStats, type Stats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import styles from "../SiteDrawer.module.css";

export type MenuStats = Stats & { due: number };

export function useMenuStats(): MenuStats | null {
  const key = useProgressValue(() => {
    const due = progress.dueForReview(Object.keys(progress.all().chapters)).length;
    return JSON.stringify({ ...computeStats(), due });
  }, "");
  return key ? (JSON.parse(key) as MenuStats) : null;
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export function ProgressStrip({ stats, onClose }: { stats: MenuStats | null; onClose: () => void }) {
  if (!stats) return null;
  const share = stats.xpForNextLevel ? Math.min(100, (stats.xpIntoLevel / stats.xpForNextLevel) * 100) : 0;
  return (
    <section className={styles.strip} aria-labelledby="menu-progress">
      <span className={styles.levelBadge} aria-hidden="true">
        <small>lvl</small>
        <b>{stats.level}</b>
      </span>
      <div className={styles.stripMain}>
        <div className={styles.stripTop}>
          <h2 className={styles.level} id="menu-progress">
            Level {stats.level}
          </h2>
          <Link href="/progress" className={styles.stripLink} onClick={onClose} prefetch={false}>
            See all progress <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.xpRow}>
          <span className={styles.xpBar} aria-hidden="true">
            <span style={{ width: `${share}%` }} />
          </span>
          <span className={styles.xp}>
            {stats.xpIntoLevel} of {stats.xpForNextLevel} XP to level {stats.level + 1}
          </span>
        </div>
      </div>
      <ul className={styles.facts}>
        <li>
          <strong>{stats.streak}</strong>
          <span>day streak</span>
        </li>
        <li>
          <strong>{stats.chaptersRead}</strong>
          <span>{plural(stats.chaptersRead, "chapter read", "chapters read")}</span>
        </li>
        <li>
          <strong>{stats.exercisesSolved}</strong>
          <span>{plural(stats.exercisesSolved, "problem solved", "problems solved")}</span>
        </li>
      </ul>
    </section>
  );
}
