"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { accentVar } from "@/lib/accent";
import { formatSpan, plural } from "@/lib/format";
import { problemHref } from "@/lib/problemHref";
import { progress, rememberLevel } from "@/lib/storage";
import { useMounted, useProgressValue } from "@/lib/hooks";
import type { LevelRow } from "@/lib/levelRows";
import type { Level, Topic } from "@/content/types";
import styles from "./level.module.css";

export interface ExerciseLink {
  id: string;
  title: string;
  testCount: number;
  level: string;
  chapterShort: string | null;
}

export function TopicPath({
  topic,
  level,
  basePath,
  entries,
  chapterExercises,
  levelExerciseList,
}: {
  topic: Topic;
  level: Level;
  basePath: string;
  entries: LevelRow[];
  chapterExercises: Record<string, ExerciseLink[]>;
  levelExerciseList: ExerciseLink[];
}) {
  const mounted = useMounted();

  useEffect(() => {
    rememberLevel(level.id);
  }, [level.id]);

  const chapters = useMemo(() => entries.filter((entry) => entry.ready).map((entry) => entry.chapter), [entries]);

  const doneKey = useProgressValue(
    () => chapters.map((ch) => (progress.isChapterDone(ch.id) ? "1" : "0")).join(""),
    ""
  );
  const done = useMemo(() => {
    const set = new Set<string>();
    chapters.forEach((ch, i) => {
      if (doneKey[i] === "1") set.add(ch.id);
    });
    return set;
  }, [doneKey, chapters]);

  const doneCount = mounted ? done.size : 0;
  const pct = chapters.length ? (doneCount / chapters.length) * 100 : 0;
  const next = mounted ? (chapters.find((ch) => !done.has(ch.id)) ?? null) : (chapters[0] ?? null);

  const continueHref = next ? `${basePath}/${next.id}` : basePath;
  const continueLabel = !mounted || doneCount === 0 ? "Start reading" : next ? `Continue — ${next.short}` : "Review";
  const totalMinutes = chapters.reduce((sum, ch) => sum + ch.readMinutes, 0);

  return (
    <TopicFrame
      topic={{ name: topic.name, href: basePath, mark: topic.mark, accent: topic.accent }}
      back={{ href: `/level/${topic.id}`, label: topic.name }}
      skip={{ label: "Skip to the path" }}
    >
      <div className={styles.page} style={{ "--accent": accentVar(topic.accent) } as React.CSSProperties}>
        <div className={styles.heroRow} data-fx="stagger">
          <section className={styles.hero}>
            <p className={styles.kicker} id="path-kicker">
              <span className={styles.kickerMark} aria-hidden="true">
                {topic.mark}
              </span>
              Step 2 of 2 · your path
            </p>
            <h1 className={styles.title} id="path-title">
              {topic.name} — {level.name}
            </h1>
            <p className={styles.lead} id="path-blurb">
              {level.blurb}
            </p>

            <div className={styles.meter}>
              <div className={styles.meterTrack}>
                <div className={styles.meterFill} id="path-meter-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.meterLabel} id="path-meter-label">
                {doneCount} / {chapters.length} done
              </span>
            </div>

            <div className={styles.heroActions}>
              <Link className="btn btn--primary btn--big" id="start-btn" href={continueHref}>
                {continueLabel} →
              </Link>
              <Link className="btn btn--big" id="change-level" href={`/level/${topic.id}`}>
                <span aria-hidden="true">⇄</span> Change level
              </Link>
              <Link className="btn btn--big" id="all-chapters" href={basePath}>
                All chapters
              </Link>
            </div>
          </section>

          <aside className={styles.statPanel} aria-label={`${topic.name} ${level.name} path in numbers`}>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{chapters.length - doneCount}</span>
              <span className={styles.statLabel}>{plural(chapters.length - doneCount, "chapter")} left</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{formatSpan(totalMinutes)}</span>
              <span className={styles.statLabel}>of reading in this path</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statNum}>{levelExerciseList.length}</span>
              <span className={styles.statLabel}>{plural(levelExerciseList.length, "exercise")} to practice</span>
            </div>
          </aside>
        </div>

        <div className={styles.sectionHead} data-fx="up">
          <h2 className={styles.sectionTitle}>The order I&apos;d read them in</h2>
          <p className={styles.sectionNote} id="path-note">
            {plural(chapters.length, "chapter")}, about {formatSpan(totalMinutes)} of reading. Tick off what you&apos;ve
            read — it is remembered on this device.
          </p>
        </div>

        <ol className={styles.path} id="steps" data-fx="up">
          {entries.map((entry, i) => {
            if (!entry.ready) {
              const section = entry.section;
              return (
                <li className={styles.step} key={`planned-${i}`}>
                  <span className={styles.stepNode} aria-hidden="true">
                    ○
                  </span>
                  <div className={styles.stepBody}>
                    <div className={styles.stepMain}>
                      {entry.chapter ? (
                        <Link className={styles.stepTitle} href={`${basePath}/${entry.chapter.id}`} prefetch={false}>
                          {section.title}
                        </Link>
                      ) : (
                        <span className={styles.stepTitle}>{section.title}</span>
                      )}
                      <p className={styles.stepSub} title={section.items.join(" · ")}>
                        {section.items.join(" · ")}
                      </p>
                      <div className={styles.stepMeta}>
                        <span className="tag tag--soon">coming soon</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            }

            const chapter = entry.chapter;
            const chapterExerciseList = chapterExercises[chapter.id] ?? [];
            const chapterDone = mounted && done.has(chapter.id);
            const checkClass = chapterDone ? `${styles.stepCheck} ${styles.stepCheckOn}` : styles.stepCheck;

            return (
              <li
                className={styles.step}
                id={`step-${chapter.id}`}
                data-step={chapter.id}
                data-done={chapterDone ? "true" : "false"}
                key={chapter.id}
              >
                <span className={styles.stepNode} aria-hidden="true">
                  {chapter.num}
                </span>
                <div className={styles.stepBody}>
                  <div className={styles.stepMain}>
                    <Link className={styles.stepTitle} href={`${basePath}/${chapter.id}`} prefetch={false}>
                      {chapter.title}
                    </Link>
                    <p className={styles.stepSub} title={chapter.subtitle}>
                      {chapter.subtitle}
                    </p>
                    <div className={styles.stepRow}>
                      <div className={styles.stepMeta}>
                        <span className="tag">{chapter.readMinutes} min read</span>
                        {chapterExerciseList.length > 0 && (
                          <span className="tag">{plural(chapterExerciseList.length, "exercise")}</span>
                        )}
                        {(chapter.levels || []).map((l) => (
                          <span key={l} className={`tag tag--${l}`}>
                            {l}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={checkClass}
                        aria-pressed={chapterDone}
                        onClick={() => progress.setChapterDone(chapter.id, !chapterDone)}
                      >
                        <span className={styles.stepCheckMark} data-role="check-mark" aria-hidden="true">
                          {chapterDone ? "✓" : ""}
                        </span>
                        {chapterDone ? "Mark as unread" : "Mark as read"}
                      </button>
                    </div>
                  </div>
                  {chapterExerciseList.length > 0 && (
                    <details className={styles.exerciseDetails} open={mounted && next?.id === chapter.id}>
                      <summary>
                        {plural(chapterExerciseList.length, "exercise")} <span aria-hidden="true">▾</span>
                      </summary>
                      <div className="practice-list">
                        {chapterExerciseList.map((ex) => {
                          const solved = mounted && progress.isExerciseSolved(ex.id);
                          return (
                            <Link className="practice" href={problemHref(ex.id)} prefetch={false} key={ex.id}>
                              <span className="practice__top">
                                <span className="practice__title">{ex.title}</span>
                                {solved && <span className="practice__tick">✓</span>}
                              </span>
                              <span className="practice__meta">
                                {plural(ex.testCount, "test")} · {ex.level}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.sectionHead} data-fx="up">
          <h2 className={styles.sectionTitle}>Practice at this level</h2>
          <p className={styles.sectionNote}>Every exercise opens in the editor with tests you can run.</p>
        </div>
        <div className="practice-list" id="practice-list">
          {!levelExerciseList.length && (
            <p className={styles.sectionNote}>
              No exercises tagged for this level yet — the ones on each chapter above still work.
            </p>
          )}
          {levelExerciseList.map((ex) => {
            const solved = mounted && progress.isExerciseSolved(ex.id);
            return (
              <Link className="practice" href={problemHref(ex.id)} prefetch={false} key={ex.id}>
                <span className="practice__top">
                  <span className="practice__title">{ex.title}</span>
                  {solved && <span className="practice__tick">✓</span>}
                </span>
                <span className="practice__meta">
                  {ex.chapterShort ? `${ex.chapterShort} · ` : ""}
                  {plural(ex.testCount, "test")}
                </span>
              </Link>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <Link href="/">All topics</Link>
          <Link href={basePath}>{topic.name} notes</Link>
          <div className={styles.resetRow}>
            <p className={styles.resetNote}>Clears every chapter and exercise on this device.</p>
            <button
              type="button"
              className="btn"
              id="reset-progress"
              onClick={() => {
                if (!window.confirm("Clear every tick and solved exercise on this device?")) return;
                progress.reset();
              }}
            >
              Reset my progress
            </button>
          </div>
        </footer>
      </div>
    </TopicFrame>
  );
}
