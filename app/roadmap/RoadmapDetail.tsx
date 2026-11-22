"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { RoadmapStep } from "@/lib/roadmap";
import { statusLabel, type StepProgress } from "./roadmapModel";
import styles from "./detail.module.css";

export function Detail({
  step,
  progress,
  next,
  around,
  onClose,
  onKeyDown,
}: {
  step: RoadmapStep;
  progress: StepProgress;
  next: boolean;
  around: { before: RoadmapStep | null; after: RoadmapStep | null };
  onClose: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const verb = progress.status === "done" ? "Open again" : progress.done > 0 ? "Continue" : "Start";
  const sum = step.levels.reduce((total, level) => total + level.chapters, 0);
  return (
    <section className={styles.detail} aria-label={`${step.title} details`} onKeyDown={onKeyDown}>
      <header className={styles.detailHead}>
        <h3 className={styles.detailTitle}>{step.title}</h3>
        <button type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </header>
      <p className={styles.detailStatus} data-status={progress.status}>
        {statusLabel(progress)}
        {next && " · next up"}
      </p>
      {progress.status === "doing" && (
        <ProgressMeter done={progress.done} total={progress.total} label={`${progress.done} / ${progress.total}`} />
      )}
      {step.why && <p className={styles.detailWhy}>{step.why}</p>}
      {step.group && <p className={styles.detailMeta}>Interview round · {step.group}</p>}
      {(around.before || around.after) && (
        <p className={styles.detailMeta}>
          {around.before && <>Comes after: {around.before.title}</>}
          {around.before && around.after && " · "}
          {around.after && <>Leads to: {around.after.title}</>}
        </p>
      )}
      {step.written > 0 ? (
        <p className={styles.detailMeta}>
          {[
            step.kind === "topic" ? plural(step.written, "chapter") : null,
            step.exercises > 0 ? plural(step.exercises, "exercise") : null,
            `${formatSpan(step.minutes)} of reading`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : (
        <p className={styles.outlineNote}>
          Planned and outlined with {plural(step.planned, "chapter")}, but none are written yet. It stays on the route
          so you can see the whole way, and it does not count toward your progress.
        </p>
      )}
      {step.levels.length > 0 && (
        <>
          <ul className={styles.levels} aria-label="Levels">
            {step.levels.map((level) => (
              <li key={level.id}>
                <Link href={level.href} prefetch={false}>
                  <span>{level.name}</span>
                  <small>
                    {plural(level.chapters, "chapter")} · {formatSpan(level.minutes)}
                  </small>
                </Link>
              </li>
            ))}
          </ul>
          {sum !== step.written && <p className={styles.detailMeta}>Some chapters appear in more than one level.</p>}
        </>
      )}
      <Link href={step.href} className={styles.open} prefetch={false}>
        {step.written > 0 ? `${verb}: ${step.title}` : `See the outline: ${step.title}`}
      </Link>
    </section>
  );
}
