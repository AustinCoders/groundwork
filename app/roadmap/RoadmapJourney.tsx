"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import {
  LINE_Y,
  ROW_H,
  VIEW_W,
  entryX,
  incomingArc,
  linePath,
  outgoingArc,
  stationPercent,
  travel,
} from "./journeyLayout";
import { neighbours, roadmapProgress, statusLabel, type StepProgress, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./journey.module.css";

const LINE_COLOURS = ["blue", "green", "orange", "purple", "red", "teal"] as const;

const MARK: Record<StepStatus, string> = { done: "✓", doing: "", todo: "", outline: "" };

const pad = (n: number) => String(n).padStart(2, "0");
const colour = (row: number) => `var(--c-${LINE_COLOURS[row % LINE_COLOURS.length]})`;

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return plural(step.written, "chapter");
}

function Detail({
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

export function RoadmapJourney({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const nextKey = progress.next?.key ?? null;
  const rows = roadmap.stages.length;

  useEffect(() => {
    if (!openKey) return;
    const away = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-keep-open]")) return;
      setOpenKey(null);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [openKey]);

  const close = (key: string) => {
    setOpenKey(null);
    buttons.current.get(key)?.focus();
  };
  const closeOnEscape = (key: string) => (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    close(key);
  };

  return (
    <section className={styles.wrap} aria-label={`${roadmap.title} roadmap`}>
      <ul className={styles.legend} aria-label="How to read the map">
        <li data-key="order">in this order</li>
        <li data-key="any">any order</li>
        <li data-key="done">done</li>
        <li data-key="doing">in progress</li>
        <li data-key="todo">ready to read</li>
        <li data-key="outline">coming soon</li>
        <li data-key="swap">change of line</li>
      </ul>

      <div className={`${styles.map} ${loaded ? "" : styles.pending}`}>
        {roadmap.stages.map((stage, row) => {
          const headId = `${stage.id}-stage`;
          const any = stage.order === "any-order";
          const heading = travel(row) === "right" ? "left" : "right";
          const count = stage.steps.length;
          const open = stage.steps.findIndex((step) => step.key === openKey);
          const incoming = incomingArc(row);
          const outgoing = outgoingArc(row, rows);
          const rowSection = (
            <section
              id={stage.id}
              className={styles.row}
              data-open={open !== -1}
              aria-labelledby={headId}
              style={
                {
                  "--route": colour(row),
                  "--prev": colour(Math.max(row - 1, 0)),
                  "--count": count,
                } as CSSProperties
              }
            >
              <svg className={styles.route} viewBox={`0 0 ${VIEW_W} ${ROW_H}`} aria-hidden="true" focusable="false">
                <g className="rough">
                  {incoming && <path d={incoming} className={styles.prevStroke} />}
                  <path d={linePath(row)} className={any ? styles.dotted : styles.solid} />
                  {outgoing && <path d={outgoing} className={styles.ownStroke} />}
                </g>
                {row > 0 && (
                  <g className={styles.swap}>
                    <circle cx={entryX(row)} cy={LINE_Y} r={17} />
                    <circle cx={entryX(row)} cy={LINE_Y} r={8} />
                  </g>
                )}
              </svg>

              {row === 0 && (
                <span className={styles.end} data-side="start">
                  Start
                </span>
              )}
              {row === rows - 1 && (
                <span className={styles.end} data-side={travel(row) === "right" ? "finish-right" : "finish-left"}>
                  Finish
                </span>
              )}

              <header className={styles.tag} data-side={heading}>
                <span className={styles.tagBadge}>
                  <b>{pad(row + 1)}</b>
                  <h2 id={headId}>{stage.title}</h2>
                </span>
                <span className={styles.tagOrder}>{any ? "any order" : "in this order"}</span>
                <p className={styles.tagBlurb}>{stage.blurb}</p>
              </header>

              <ol
                className={styles.stations}
                data-any={any}
                aria-label={`${stage.title}, ${any ? "in any order" : "in this order"}`}
              >
                {stage.steps.map((step, k) => {
                  const state = progress.steps[step.key];
                  const isNext = nextKey === step.key;
                  const isOpen = openKey === step.key;
                  return (
                    <li
                      key={step.key}
                      className={styles.station}
                      style={{ "--x": stationPercent(row, k, count) } as CSSProperties}
                    >
                      <button
                        type="button"
                        ref={(node) => {
                          if (node) buttons.current.set(step.key, node);
                          else buttons.current.delete(step.key);
                        }}
                        className={styles.stop}
                        data-status={state.status}
                        data-next={isNext}
                        data-open={isOpen}
                        data-keep-open
                        aria-expanded={isOpen}
                        aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next up." : ""}`}
                        onClick={() => setOpenKey(isOpen ? null : step.key)}
                      >
                        <span aria-hidden="true">{MARK[state.status]}</span>
                      </button>
                      {isNext && (
                        <span className={styles.flag} aria-hidden="true">
                          Next up
                        </span>
                      )}
                      <span className={styles.label}>
                        <span className={styles.labelTitle}>{step.title}</span>
                        <span className={styles.labelMeta}>{shortMeta(step)}</span>
                      </span>
                      {isOpen && (
                        <div className={styles.inline} data-keep-open>
                          <Detail
                            step={step}
                            progress={state}
                            next={isNext}
                            around={neighbours(roadmap, step.key)}
                            onClose={() => close(step.key)}
                            onKeyDown={closeOnEscape(step.key)}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
          return (
            <Fragment key={stage.id}>
              {rowSection}
              {open !== -1 && (
                <div
                  className={styles.gap}
                  data-keep-open
                  data-bulge={travel(row) === "right" ? "right" : "left"}
                  data-last={row === rows - 1}
                  style={{ "--route": colour(row) } as CSSProperties}
                >
                  <div className={styles.pop}>
                    <Detail
                      step={stage.steps[open]}
                      progress={progress.steps[stage.steps[open].key]}
                      next={nextKey === stage.steps[open].key}
                      around={neighbours(roadmap, stage.steps[open].key)}
                      onClose={() => close(stage.steps[open].key)}
                      onKeyDown={closeOnEscape(stage.steps[open].key)}
                    />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
