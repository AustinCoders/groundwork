"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { TopicFrame } from "@/components/topic/TopicFrame";
import { HashRedirect } from "@/components/reader/HashRedirect";
import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Band,
  Button,
  Chips,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  Notes,
  TopicPage,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { SoonTag } from "@/components/topic/Journey";
import { BUDGET_STEPS, useReadingPlan, type Station } from "@/components/topic/useReadingPlan";
import { countStates, STATE_ORDER, STATE_TEXT, summarizeStates } from "@/lib/chapterState";
import { openCheckOnClick } from "@/lib/checkOpen";
import { quizStore } from "@/lib/quizStore";
import { progress } from "@/lib/storage";
import { useChapterStates } from "@/lib/useChapterStates";
import { requiresCheck, tickHref, type Completion } from "@/lib/completion";
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
  checkChapterIds,
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
  checkChapterIds?: string[];
  aside?: ReactNode;
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
  const states = useChapterStates(completion, plan.readable, checkChapterIds, plan.done);
  const stateTotals = countStates(
    plan.readable.map((s) => s.id),
    states
  );
  const nextState = plan.next ? states.get(plan.next.id) : undefined;
  const written = cards.filter((c) => c.ready).length;
  const firstReadyId = cards.find((c) => c.ready)?.id;
  const totalExercises = cards.reduce((sum, c) => sum + c.exercises, 0);
  const dueCount = plan.mounted ? progress.dueForReview(plan.readable.map((s) => s.id)).length : 0;
  const totalMinutes = cards.reduce((sum, c) => sum + c.minutes, 0);

  const toggleRead = (id: string) => {
    const read = plan.done.has(id);
    if (read && requiresCheck(completion)) quizStore.unmark(id);
    progress.setChapterDone(id, !read);
  };

  const continueHref = plan.next ? `${basePath}/${plan.next.id}` : "/review";
  const continueLabel = plan.next ? (plan.readCount === 0 ? "Start" : "Continue") : "Review";

  const nextBand = parts.length + 1;
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
    <TopicFrame
      topic={{ name: topicName, href: basePath, mark, accent }}
      reading
      layout="reader"
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
      <TopicPage accent={accent} id="top">
        <Scene className={topicKit.hero}>
          <Copy>
            <Kicker mark={mark}>
              {plural(written, "chapter")} · {plural(parts.length, "level")} · {plural(totalExercises, "exercise")}
            </Kicker>
            <Heading>
              <Underlined>{topicName}</Underlined>
            </Heading>
            <Lead>{lead}</Lead>
            <Actions>
              <Button href={plan.mounted ? continueHref : `${basePath}/${firstReadyId}`}>
                {plan.mounted ? continueLabel : "Start"} <span aria-hidden="true">→</span>
              </Button>
              <Button ghost href={`/level/${topicId}`}>
                Pick your level
              </Button>
            </Actions>
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
          </Copy>
          <Compose live layout="stack">
            {plan.next ? (
              <>
                <Card at="a" tilt={-1} taped aria-label="Up next">
                  <Tag tone="success">
                    {plan.mounted && plan.readCount > 0 ? `★ ${plan.readCount} read` : "★ free to read"}
                  </Tag>
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
                    {plan.next.exercises > 0 && (
                      <span className={topicKit.chip}>{plural(plan.next.exercises, "exercise")}</span>
                    )}
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
            ) : (
              <Card at="a" tilt={-1} taped aria-label="Up next">
                <Tag tone="success">
                  {plan.mounted && plan.readCount > 0 ? `★ ${plan.readCount} read` : "★ free to read"}
                </Tag>
                <h2 className={styles.upNextTitle}>Every chapter read</h2>
                <p className={styles.upNextSub}>The review page keeps it fresh from here.</p>
                <div className={styles.upNextGo}>
                  <Button href="/review">
                    Go to review <span aria-hidden="true">→</span>
                  </Button>
                </div>
              </Card>
            )}
            {aside && (
              <Card at="c" tilt={1}>
                {aside}
              </Card>
            )}
          </Compose>
        </Scene>

        <Band
          no="01"
          id="contents-title"
          label="Contents"
          title="Every chapter, in reading order"
          sub="Start at the top or jump to what you need. Tick a chapter once you have read it."
          count={plural(cards.length, "chapter")}
        >
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
        </Band>

        {totalExercises > 0 && (
          <Band
            no={String(nextBand).padStart(2, "0")}
            id="practice-title"
            label="Practice"
            title={`Practice ${topicName}`}
            sub="Every exercise opens in the editor with tests you can run."
          >
            <div className={styles.practiceLinks}>
              {parts.map((part) => {
                const count = cards
                  .filter((c) => c.levels.includes(part.level))
                  .reduce((sum, c) => sum + c.exercises, 0);
                if (!count) return null;
                return (
                  <Button key={part.level} ghost href={`/problems?topic=${topicId}&level=${part.level}`}>
                    {plural(count, "exercise")} at {part.title} →
                  </Button>
                );
              })}
            </div>
          </Band>
        )}

        {curriculumNotes.length > 0 && (
          <Notes no={String(nextBand + (totalExercises > 0 ? 1 : 0)).padStart(2, "0")} notes={curriculumNotes} />
        )}

        <Foot>
          {relatedRoundHref && (
            <FootLink href={relatedRoundHref}>Practise this as {relatedRoundLabel} in the interview book →</FootLink>
          )}
          <FootLink href="/">Switch topic</FootLink>
        </Foot>
      </TopicPage>
    </TopicFrame>
  );
}
