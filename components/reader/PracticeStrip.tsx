"use client";

import Link from "next/link";
import { progress } from "@/lib/storage";
import { useProgressValue } from "@/lib/hooks";
import { problemHref } from "@/lib/problemHref";
import { exercisesForLevel } from "@/lib/content";
import type { LevelId } from "@/content/types";
import styles from "./practiceStrip.module.css";

export interface PracticeLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
}

export function PracticeStrip({
  exercises,
  topicId,
  level,
}: {
  exercises: PracticeLink[];
  topicId?: string;
  level?: LevelId;
}) {
  const solvedKey = useProgressValue(
    () =>
      exercises
        .filter((ex) => progress.isExerciseSolved(ex.id))
        .map((ex) => ex.id)
        .join(","),
    ""
  );
  const solved = solvedKey ? solvedKey.split(",") : [];

  if (!exercises.length) return null;

  const levelTotal = topicId && level ? exercisesForLevel(level, topicId).length : 0;

  return (
    <div className="practice-strip" data-speech-exclude>
      <div className={styles.practiceHead}>
        <span className="practice-strip__title">Practice this chapter</span>
        <p className="practice-strip__note">Opens in the editor — write it, run it, and check it against real tests.</p>
      </div>
      <div className={styles.practiceGrid}>
        {exercises.map((ex) => (
          <Link className={styles.practiceCard} href={problemHref(ex.id)} key={ex.id}>
            <span className="practice__top">
              <span className="practice__title">{ex.title}</span>
              {solved.indexOf(ex.id) !== -1 && <span className="practice__tick">✓</span>}
            </span>
            <span className="practice__meta">
              {ex.testCount} {ex.testCount === 1 ? "test" : "tests"} · {ex.level}
            </span>
          </Link>
        ))}
      </div>
      {levelTotal > 0 && (
        <Link className={styles.practiceAll} href={`/path/${topicId}/${level}`}>
          All {levelTotal} for this level →
        </Link>
      )}
    </div>
  );
}
