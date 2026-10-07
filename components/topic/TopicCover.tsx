"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { ChapterCard } from "@/components/chapter/ChapterCard";
import { PartSection } from "@/components/chapter/PartSection";
import { BUDGET_STEPS, useReadingPlan, type Station } from "@/components/topic/useReadingPlan";
import { progress } from "@/lib/storage";
import { tickHref, type Completion } from "@/lib/completion";
import { formatSpan, plural } from "@/lib/format";
import type { SeriesCard, SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";
import styles from "./cover.module.css";

export interface CoverCard extends SeriesCard<LevelId> {
  ready: boolean;
  exercises: number;
}

export function TopicCover({
  topicId,
  topicName,
  mark,
  accent,
  basePath,
  lead,
  parts,
  cards,
  relatedRoundHref,
  relatedRoundLabel,
  curriculumNotes,
  completion,
  aside,
}: {
  topicId: string;
  topicName: string;
  mark: string;
  accent: string;
  basePath: string;
  lead: string;
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
  relatedRoundHref: string | null;
  relatedRoundLabel: string | null;
  curriculumNotes: string[];
  completion?: Completion;
  aside?: React.ReactNode;
}) {
  const stations: Station[] = useMemo(
    () =>
      cards.map((c) => ({
        id: c.id,
        num: c.num,
        short: c.short || c.title,
        subtitle: c.subtitle,
        minutes: c.minutes,
        exercises: c.exercises,
        ready: c.ready,
      })),
    [cards]
  );

  const plan = useReadingPlan(stations, topicId, completion);
  const written = cards.filter((c) => c.ready).length;
  const firstReadyId = cards.find((c) => c.ready)?.id;
  const totalExercises = cards.reduce((sum, c) => sum + c.exercises, 0);
  const dueCount = plan.mounted ? progress.dueForReview(plan.readable.map((s) => s.id)).length : 0;
  const totalMinutes = cards.reduce((sum, c) => sum + c.minutes, 0);

  const toggleRead = (id: string) => progress.setChapterDone(id, !plan.done.has(id));

  const continueHref = plan.next ? `${basePath}/${plan.next.id}` : "/review";
  const continueLabel = plan.next ? (plan.readCount === 0 ? "Start" : "Continue") : "Review";

  return (
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      reading
      skip={{ label: `Skip to ${topicName}` }}
      actions={
        plan.mounted ? (
          <Link className="btn btn--primary" href={continueHref}>
            {continueLabel} →
          </Link>
        ) : undefined
      }
    >
      <HashRedirect basePath={basePath} />
      <div className={styles.page} id="top">
        <section className={styles.hero} data-fx="stagger">
          <div className={styles.heroMain}>
            <p className={styles.kicker}>
              {plural(written, "chapter")} · {plural(parts.length, "level")} · {plural(totalExercises, "exercise")}
            </p>
            <h1 className={styles.title}>{topicName}</h1>
            <p className={styles.lead}>{lead}</p>
            <div className={styles.ctas}>
              <Link className="btn btn--primary" href={plan.mounted ? continueHref : `${basePath}/${firstReadyId}`}>
                {plan.mounted ? continueLabel : "Start"} →
              </Link>
              <Link className="btn" href={`/level/${topicId}`}>
                Pick your level
              </Link>
            </div>
            <div className={styles.statStrip}>
              <span className="chip">
                {plan.mounted ? plan.readCount : 0} / {written} read
              </span>
              <span className="chip">{plural(totalExercises, "exercise")}</span>
              <span className="chip">
                {plan.mounted && written > 0 && plan.readCount === written
                  ? "every chapter read"
                  : `${formatSpan(plan.mounted ? plan.minutesLeft : totalMinutes)} left`}
              </span>
              {plan.mounted && dueCount > 0 && (
                <Link className="chip" href="/review">
                  {plural(dueCount, "chapter")} due for review →
                </Link>
              )}
            </div>
          </div>

          <div className={styles.heroSide}>
            <aside className={styles.upNext} aria-label="Up next">
              {plan.next ? (
                <>
                  <span className={styles.upNextNum}>{plan.next.num}</span>
                  <h2 className={styles.upNextTitle}>{plan.next.short}</h2>
                  <p className={styles.upNextSub}>{plan.next.subtitle}</p>
                  <div className={styles.upNextMeta}>
                    <span className="chip">{plan.next.minutes} min read</span>
                    {plan.next.exercises > 0 && <span className="chip">{plural(plan.next.exercises, "exercise")}</span>}
                  </div>
                  <Link className="btn btn--primary" href={`${basePath}/${plan.next.id}`}>
                    Open this chapter →
                  </Link>

                  <div className={styles.budget} role="group" aria-label="Reading time budget">
                    <span className={styles.budgetQ}>I&apos;ve got</span>
                    <div className={styles.budgetSteps}>
                      {BUDGET_STEPS.map((step) => (
                        <button
                          key={step}
                          type="button"
                          className={styles.budgetStep}
                          aria-pressed={plan.budget === step}
                          onClick={() => plan.setBudget(step)}
                        >
                          {step}m
                        </button>
                      ))}
                    </div>
                    <span className={styles.budgetOut}>
                      {plan.mounted
                        ? plan.reach.size > 0
                          ? `→ ${plural(plan.reach.size, "chapter")}, up to ${plan.lastInReach?.short}`
                          : `→ not even ${plan.next.short} (${plan.next.minutes} min) fits`
                        : "→ pick a run for tonight"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className={styles.upNextTitle}>Every chapter read</h2>
                  <p className={styles.upNextSub}>The review page keeps it fresh from here.</p>
                  <Link className="btn btn--primary" href="/review">
                    Go to review →
                  </Link>
                </>
              )}
            </aside>
            {aside}
          </div>
        </section>

        <div className={styles.parts} data-fx="up">
          {parts.map((part, pi) => {
            const list = cards.filter((c) => c.levels.includes(part.level));
            if (!list.length) return null;
            const read = plan.mounted ? list.filter((c) => plan.done.has(c.id)).length : 0;
            return (
              <PartSection
                key={part.level}
                id={part.level}
                index={pi}
                title={part.title}
                blurb={part.blurb}
                read={read}
                total={list.length}
              >
                {list.map((c) => {
                  const cardTick =
                    plan.mounted && c.ready ? tickHref(completion, basePath, c.id, false, plan.done.has(c.id)) : null;
                  return (
                    <ChapterCard
                      key={c.id}
                      chapter={c}
                      href={`${basePath}/${c.id}`}
                      read={plan.mounted && plan.done.has(c.id)}
                      exercises={c.exercises}
                      tickHref={cardTick}
                      onToggleRead={plan.mounted && c.ready && !cardTick ? () => toggleRead(c.id) : undefined}
                    />
                  );
                })}
              </PartSection>
            );
          })}
        </div>

        {totalExercises > 0 && (
          <section className={styles.practice} aria-label={`Practice ${topicName}`}>
            <h2>Practice {topicName}</h2>
            <div className={styles.practiceLinks}>
              {parts.map((part) => {
                const count = cards
                  .filter((c) => c.levels.includes(part.level))
                  .reduce((sum, c) => sum + c.exercises, 0);
                if (!count) return null;
                return (
                  <Link key={part.level} className="btn" href={`/problems?topic=${topicId}&level=${part.level}`}>
                    {plural(count, "exercise")} at {part.title} →
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            {relatedRoundHref && (
              <Link href={relatedRoundHref}>Practise this as {relatedRoundLabel} in the interview book →</Link>
            )}
            <Link href="/">Switch topic</Link>
          </div>
          {curriculumNotes.length > 0 && (
            <div className="sticky mint">
              <span className="ttl">Three honest notes</span>
              <ul>
                {curriculumNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </footer>
      </div>
    </TopicFrame>
  );
}
