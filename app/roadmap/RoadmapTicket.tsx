"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { RoadmapStep } from "@/lib/roadmap";
import { levelProgress, statusLabel, upNext, type StepProgress } from "./roadmapModel";
import styles from "./ticket.module.css";

export function RoadmapTicket({
  step,
  platform,
  routeName,
  progress,
  done,
  next,
  before,
  after,
  onGo,
  onClose,
  closeLabel = "Close",
  onKeyDown,
}: {
  step: RoadmapStep;
  platform: number;
  routeName: string;
  progress: StepProgress;
  done: ReadonlySet<string>;
  next: boolean;
  before: RoadmapStep | null;
  after: RoadmapStep | null;
  onGo: (key: string) => void;
  onClose: () => void;
  closeLabel?: string;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const verb = progress.status === "done" ? "Ride again" : progress.done > 0 ? "Continue" : "Board";
  const unread = upNext(step, done, 3);
  const sum = step.levels.reduce((total, level) => total + level.chapters, 0);
  return (
    <section className={styles.ticket} aria-label={`${step.title} ticket`} onKeyDown={onKeyDown}>
      <header className={styles.stub}>
        <span>Platform {String(platform).padStart(2, "0")}</span>
        <span className={styles.route}>{routeName}</span>
        <button type="button" className={styles.close} onClick={onClose}>
          {closeLabel}
        </button>
      </header>

      <div className={styles.body}>
        <h3 className={styles.title}>{step.title}</h3>
        <p className={styles.status} data-status={progress.status}>
          {statusLabel(progress)}
          {next && " · next stop"}
        </p>
        {progress.status === "doing" && (
          <ProgressMeter done={progress.done} total={progress.total} label={`${progress.done} / ${progress.total}`} />
        )}
        {step.why && <p className={styles.why}>{step.why}</p>}
        {step.group && <p className={styles.meta}>Interview round · {step.group}</p>}
        {step.written > 0 ? (
          <dl className={styles.facts}>
            {step.kind === "topic" && (
              <div>
                <dt>Chapters</dt>
                <dd>{step.written}</dd>
              </div>
            )}
            {step.exercises > 0 && (
              <div>
                <dt>Exercises</dt>
                <dd>{step.exercises}</dd>
              </div>
            )}
            <div>
              <dt>Reading</dt>
              <dd>{formatSpan(step.minutes)}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.soon}>
            Planned and outlined with {plural(step.planned, "chapter")}, but none are written yet. The line is laid so
            you can see where it goes; it does not count toward your progress.
          </p>
        )}
      </div>

      <div className={styles.perforation} aria-hidden="true" />

      <div className={styles.body}>
        {step.levels.length > 0 && (
          <>
            <p className={styles.label}>Pick a level</p>
            <ul className={styles.levels}>
              {step.levels.map((level) => {
                const got = levelProgress(level, done);
                return (
                  <li key={level.id}>
                    <Link href={level.href} prefetch={false}>
                      <span className={styles.levelName}>{level.name}</span>
                      <small>
                        {got.done} of {got.total} chapters · {formatSpan(level.minutes)}
                      </small>
                      <span className={styles.bar} aria-hidden="true">
                        <i style={{ width: `${got.total ? (got.done / got.total) * 100 : 0}%` }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {sum !== step.written && <p className={styles.meta}>Some chapters appear in more than one level.</p>}
          </>
        )}

        {unread.length > 0 && (
          <>
            <p className={styles.label}>{progress.done > 0 ? "Up next" : "First chapters"}</p>
            <ol className={styles.chapters}>
              {unread.map((chapter) => (
                <li key={chapter.id}>
                  <Link href={chapter.href} prefetch={false}>
                    {chapter.title}
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}

        {(before || after) && (
          <>
            <p className={styles.label}>On the line</p>
            <div className={styles.around}>
              {before && (
                <button type="button" onClick={() => onGo(before.key)}>
                  <small>Comes after</small>
                  {before.title}
                </button>
              )}
              {after && (
                <button type="button" onClick={() => onGo(after.key)}>
                  <small>Leads to</small>
                  {after.title}
                </button>
              )}
            </div>
          </>
        )}

        <Link href={step.href} className={styles.board} prefetch={false}>
          {step.written > 0 ? `${verb}: ${step.title}` : `See the outline: ${step.title}`}
        </Link>
      </div>
    </section>
  );
}
