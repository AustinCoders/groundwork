"use client";

import Link from "next/link";
import { Card, Remark, Tag } from "@/components/topic/Compose";
import { Button, Chips, topicKit } from "@/components/topic/TopicKit";
import { SoonTag } from "@/components/topic/Journey";
import { BUDGET_STEPS } from "@/components/topic/useReadingPlan";
import type { CoverCard, CoverProgress } from "@/components/topic/useCoverProgress";
import { countStates, STATE_ORDER, STATE_TEXT, summarizeStates } from "@/lib/chapterState";
import { openCheckOnClick } from "@/lib/checkOpen";
import { tickHref, type Completion } from "@/lib/completion";
import { formatSpan, plural } from "@/lib/format";
import type { SeriesPart } from "@/components/chapter/types";
import type { LevelId } from "@/content/types";
import styles from "./cover.module.css";

export function UpNextAndBudget({ progress, basePath }: { progress: CoverProgress; basePath: string }) {
  const { plan, nextState } = progress;

  if (!plan.next) {
    return (
      <Card at="a" tilt={-1} taped aria-label="Up next">
        <Tag tone="success">{plan.mounted && plan.readCount > 0 ? `★ ${plan.readCount} read` : "★ free to read"}</Tag>
        <h2 className={styles.upNextTitle}>{plan.skipped > 0 ? "Plan complete" : "Every chapter read"}</h2>
        <p className={styles.upNextSub}>The review page keeps it fresh from here.</p>
        <div className={styles.upNextGo}>
          <Button href="/review">
            Go to review <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card at="a" tilt={-1} taped aria-label="Up next">
        <Tag tone="success">{plan.mounted && plan.readCount > 0 ? `★ ${plan.readCount} read` : "★ free to read"}</Tag>
        <p className={styles.cardKicker}>Up next</p>
        <div className={styles.upNextHead}>
          <span className={styles.upNextNum} aria-hidden="true">
            {plan.next.num}
          </span>
          <h2 className={styles.upNextTitle}>
            <span className={topicKit.highlight}>{plan.next.short}</span>
          </h2>
        </div>
        <p className={styles.upNextSub}>{plan.next.subtitle}</p>
        <div className={styles.upNextMeta}>
          <span className={topicKit.chip}>{plan.next.minutes} min read</span>
          {plan.next.exercises > 0 && <span className={topicKit.chip}>{plural(plan.next.exercises, "exercise")}</span>}
          {plan.mounted && nextState && <span className={topicKit.chip}>{STATE_TEXT[nextState]}</span>}
        </div>
        <div className={styles.upNextGo}>
          <Button href={`${basePath}/${plan.next.id}`}>
            Open this chapter <span aria-hidden="true">→</span>
          </Button>
        </div>
      </Card>
      <Card at="b" tone="note" tilt={1}>
        <div role="group" aria-label="Reading time budget">
          <p className={styles.budgetQ}>I&apos;ve got</p>
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
          <p className={styles.budgetOut}>
            {plan.mounted
              ? plan.reach.size > 0
                ? `→ ${plural(plan.reach.size, "chapter")}, up to ${plan.lastInReach?.short}`
                : `→ not even ${plan.next.short} (${plan.next.minutes} min) fits`
              : "→ pick a run for tonight"}
          </p>
        </div>
        <Remark>what fits tonight?</Remark>
      </Card>
    </>
  );
}

export function ProgressChips({ progress }: { progress: CoverProgress }) {
  const { plan, stateTotals, written, totalExercises, totalMinutes, dueCount } = progress;
  return (
    <Chips>
      <span className={topicKit.chip}>
        {plan.mounted ? plan.readCount : 0} / {written} read
      </span>
      <span className={topicKit.chip}>{plural(totalExercises, "exercise")}</span>
      <span className={topicKit.chip}>
        {plan.mounted && written > 0 && plan.readCount === written
          ? "every chapter read"
          : `${formatSpan(plan.mounted ? plan.minutesLeft : totalMinutes)} left`}
      </span>
      {plan.mounted &&
        STATE_ORDER.map(
          (state) =>
            stateTotals[state] > 0 && (
              <span key={state} className={topicKit.chip}>
                {stateTotals[state]} {STATE_TEXT[state]}
              </span>
            )
        )}
      {plan.mounted && dueCount > 0 && (
        <Link className={topicKit.chip} href="/review">
          {plural(dueCount, "chapter")} due for review →
        </Link>
      )}
    </Chips>
  );
}

export function ChapterContents({
  progress,
  parts,
  cards,
  basePath,
  completion,
  checkChapterIds,
}: {
  progress: CoverProgress;
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
  basePath: string;
  completion?: Completion;
  checkChapterIds?: string[];
}) {
  const { plan, states, toggleRead } = progress;
  const columns: { part: SeriesPart<LevelId>; index: number; list: CoverCard[] }[][] = [[], []];
  const loads = [0, 0];
  parts.forEach((part, index) => {
    const list = cards.filter((c) => c.levels.includes(part.level));
    if (!list.length) return;
    const target = loads[0] <= loads[1] ? 0 : 1;
    loads[target] += list.length;
    columns[target].push({ part, index, list });
  });

  return (
    <div className={styles.sheet}>
      {columns.map((column, ci) => (
        <div key={ci} className={styles.column}>
          {column.map(({ part, index, list }) => {
            const read = plan.mounted ? list.filter((c) => plan.done.has(c.id)).length : 0;
            const partStates = plan.mounted
              ? summarizeStates(
                  countStates(
                    list.map((c) => c.id),
                    states
                  )
                )
              : "";
            return (
              <section key={part.level} aria-labelledby={`part-${part.level}`}>
                <header className={styles.partHead}>
                  <span className={styles.partNo} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.partName} id={`part-${part.level}`}>
                    {part.title}
                  </h3>
                  <span className={styles.partRule} aria-hidden="true" />
                  <span className={styles.partCount}>
                    {read}/{list.length} read{partStates && ` · ${partStates}`}
                  </span>
                </header>
                {part.blurb && <p className={styles.partBlurb}>{part.blurb}</p>}
                <ol className={styles.entries}>
                  {list.map((c) => {
                    const isRead = plan.mounted && plan.done.has(c.id);
                    const name = c.short || c.title;
                    const meta = c.exercises
                      ? `${c.minutes} min · ${plural(c.exercises, "exercise")}`
                      : `${c.minutes} min`;
                    const state = plan.mounted ? states.get(c.id) : undefined;
                    const tickLabel = isRead ? `Mark ${name} unread` : `Mark ${name} read`;
                    const entryTick = plan.mounted
                      ? tickHref(
                          completion,
                          basePath,
                          c.id,
                          false,
                          plan.done.has(c.id),
                          (checkChapterIds ?? []).includes(c.id)
                        )
                      : null;
                    return (
                      <li key={c.id} className={styles.entry}>
                        <Link className={styles.entryLink} href={`${basePath}/${c.id}`} prefetch={false}>
                          <span className={styles.entryCode}>{c.num}</span>
                          <span className={styles.entryMain}>
                            <span className={styles.entryTitle}>{c.title}</span>
                            {c.subtitle && <span className={styles.entrySub}>{c.subtitle}</span>}
                            {state && (
                              <span className={styles.entryState} data-state={state}>
                                {STATE_TEXT[state]}
                              </span>
                            )}
                          </span>
                          {c.ready ? <span className={styles.entryMeta}>{meta}</span> : <SoonTag />}
                        </Link>
                        {c.ready &&
                          (entryTick ? (
                            <Link
                              className={topicKit.tick}
                              href={entryTick}
                              prefetch={false}
                              aria-label={tickLabel}
                              title={tickLabel}
                              onClick={openCheckOnClick}
                            >
                              <span aria-hidden="true">{isRead ? "✓" : ""}</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              className={topicKit.tick}
                              aria-pressed={isRead}
                              aria-label={tickLabel}
                              title={tickLabel}
                              onClick={() => toggleRead(c.id)}
                            >
                              <span aria-hidden="true">{isRead ? "✓" : ""}</span>
                            </button>
                          ))}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function PracticeLinks({
  topicId,
  parts,
  cards,
}: {
  topicId: string;
  parts: SeriesPart<LevelId>[];
  cards: CoverCard[];
}) {
  return (
    <div className={styles.practiceLinks}>
      {parts.map((part) => {
        const count = cards.filter((c) => c.levels.includes(part.level)).reduce((sum, c) => sum + c.exercises, 0);
        if (!count) return null;
        return (
          <Button key={part.level} ghost href={`/problems?topic=${topicId}&level=${part.level}`}>
            {plural(count, "exercise")} at {part.title} →
          </Button>
        );
      })}
    </div>
  );
}
