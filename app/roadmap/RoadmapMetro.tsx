"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import { roadmapProgress, statusLabel, type StepProgress, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./metro.module.css";

const LINE_COLOURS = ["blue", "green", "orange", "purple", "red", "teal"] as const;

const MARK: Record<StepStatus, string> = { done: "✓", doing: "", todo: "", outline: "" };

const pad = (n: number) => String(n).padStart(2, "0");

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return plural(step.written, "chapter");
}

function Detail({
  step,
  progress,
  next,
  onClose,
  onKeyDown,
}: {
  step: RoadmapStep;
  progress: StepProgress;
  next: boolean;
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

export function RoadmapMetro({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const nextKey = progress.next?.key ?? null;

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
      </ul>

      <div className={`${styles.map} ${loaded ? "" : styles.pending}`}>
        {roadmap.stages.map((stage, at) => {
          const headId = `${stage.id}-stage`;
          const any = stage.order === "any-order";
          const open = stage.steps.find((step) => step.key === openKey) ?? null;
          return (
            <section
              key={stage.id}
              id={stage.id}
              className={styles.stage}
              aria-labelledby={headId}
              style={{ "--route": `var(--c-${LINE_COLOURS[at % LINE_COLOURS.length]})` } as CSSProperties}
            >
              <header className={styles.stageHead}>
                <span className={styles.stageBadge}>
                  <b>{pad(at + 1)}</b>
                  <h2 id={headId}>{stage.title}</h2>
                </span>
                <span className={styles.stageOrder}>{any ? "any order" : "in this order"}</span>
                <p className={styles.stageBlurb}>{stage.blurb}</p>
              </header>

              <ol
                className={styles.stations}
                data-any={any}
                data-count={stage.steps.length}
                style={{ "--count": stage.steps.length } as CSSProperties}
                aria-label={`${stage.title}, ${any ? "in any order" : "in this order"}`}
              >
                {stage.steps.map((step) => {
                  const state = progress.steps[step.key];
                  const isNext = nextKey === step.key;
                  const isOpen = openKey === step.key;
                  return (
                    <li key={step.key} className={styles.station}>
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
                        <div className={styles.inline}>
                          <Detail
                            step={step}
                            progress={state}
                            next={isNext}
                            onClose={() => close(step.key)}
                            onKeyDown={closeOnEscape(step.key)}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              {open && (
                <div className={styles.below}>
                  <Detail
                    step={open}
                    progress={progress.steps[open.key]}
                    next={nextKey === open.key}
                    onClose={() => close(open.key)}
                    onKeyDown={closeOnEscape(open.key)}
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
