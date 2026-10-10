"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/menu/Eyebrow";
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
    <section className={styles.block} aria-labelledby="menu-progress">
      <Eyebrow no="02">Progress</Eyebrow>
      <div className={styles.stripTop}>
        <h2 className={styles.h2} id="menu-progress">
          Level {stats.level}
        </h2>
        <Link href="/progress" className={styles.textLink} onClick={onClose} prefetch={false}>
          See all progress <span aria-hidden="true">→</span>
        </Link>
      </div>
      <span className={styles.trail} aria-hidden="true">
        <span style={{ width: `${share}%` }} />
      </span>
      <p className={styles.xp}>
        {stats.xpIntoLevel} of {stats.xpForNextLevel} XP to level {stats.level + 1}
      </p>
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
