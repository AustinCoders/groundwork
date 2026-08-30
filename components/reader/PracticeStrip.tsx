"use client";

import Link from "next/link";
import { progress } from "@/lib/storage";
import { useProgressValue } from "@/lib/hooks";

export interface PracticeLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
}

/** Client-side only because each row shows whether you've solved it. */
export function PracticeStrip({ exercises }: { exercises: PracticeLink[] }) {
  // useSyncExternalStore compares snapshots with Object.is, so this has to
  // be a stable primitive — a fresh array every read would loop forever.
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

  return (
    <div className="practice-strip">
      <span className="practice-strip__title">Practice this layer</span>
      <p className="practice-strip__note">Opens in the editor — write it, run it, and check it against real tests.</p>
      <div className="practice-list">
        {exercises.map((ex) => (
          <Link className="practice" href={`/practice?id=${ex.id}`} key={ex.id}>
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
    </div>
  );
}
