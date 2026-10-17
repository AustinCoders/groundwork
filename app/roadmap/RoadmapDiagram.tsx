"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { accentVar } from "@/lib/accent";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import { roadmapProgress, statusLabel, type StepProgress, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./diagram.module.css";

const BADGE: Record<StepStatus, string> = { done: "✓", doing: "◐", todo: "", outline: "" };

const pad = (n: number) => String(n).padStart(2, "0");

function stepMeta(step: RoadmapStep): string {
  if (step.written === 0) return `${plural(step.planned, "chapter")} planned`;
  if (step.kind === "round") return `Round · ${formatSpan(step.minutes)}`;
  return `${plural(step.written, "chapter")} · ${formatSpan(step.minutes)}`;
}

function Node({
  step,
  progress,
  next,
  onOpen,
}: {
  step: RoadmapStep;
  progress: StepProgress;
  next: boolean;
  onOpen: (step: RoadmapStep, opener: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className={styles.node}
      data-status={progress.status}
      data-next={next}
      data-kind={step.kind}
      aria-haspopup="dialog"
      aria-label={`${step.title}. ${statusLabel(progress)}.${next ? " Next up." : ""} Open details.`}
      style={{ "--accent": accentVar(step.accent) } as React.CSSProperties}
      onClick={(event) => onOpen(step, event.currentTarget)}
    >
      <span className={styles.nodeTitle}>{step.title}</span>
      <span className={styles.nodeMeta}>{stepMeta(step)}</span>
      {BADGE[progress.status] && (
        <span className={styles.badge} aria-hidden="true">
          {BADGE[progress.status]}
        </span>
      )}
      {next && (
        <span className={styles.nextTag} aria-hidden="true">
          Next up
        </span>
      )}
    </button>
  );
}

function Drawer({
  step,
  progress,
  next,
  onClose,
}: {
  step: RoadmapStep;
  progress: StepProgress;
  next: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  const verb = progress.status === "done" ? "Open again" : progress.done > 0 ? "Continue" : "Start";
  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.drawerHead}>
        <span
          className={styles.drawerMark}
          aria-hidden="true"
          style={{ "--accent": accentVar(step.accent) } as React.CSSProperties}
        >
          {step.mark}
        </span>
        <h2 id={titleId} className={styles.drawerTitle}>
          {step.title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} autoFocus>
          Close
        </button>
      </div>

      <p className={styles.drawerStatus} data-status={progress.status}>
        {statusLabel(progress)}
        {next && " · next up"}
      </p>
      {progress.status === "doing" && (
        <ProgressMeter done={progress.done} total={progress.total} label={`${progress.done} / ${progress.total}`} />
      )}

      {step.why && <p className={styles.drawerWhy}>{step.why}</p>}
      {step.group && <p className={styles.drawerMeta}>Interview round · {step.group}</p>}

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
        <p className={styles.outlineNote}>
          This topic is planned and outlined with {plural(step.planned, "chapter")}, but none are written yet. It stays
          on the route so you can see the whole way, and it does not count toward your progress.
        </p>
      )}

      {step.levels.length > 0 && (
        <>
          <p className={styles.drawerLabel}>Pick a level</p>
          {step.levels.reduce((sum, level) => sum + level.chapters, 0) !== step.written && (
            <p className={styles.drawerMeta}>Some chapters appear in more than one level.</p>
          )}
          <ul className={styles.levels}>
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
        </>
      )}

      <Link href={step.href} className={styles.open} prefetch={false}>
        {step.written > 0 ? `${verb}: ${step.title}` : `See the outline: ${step.title}`}
      </Link>
    </dialog>
  );
}

export function RoadmapDiagram({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const [open, setOpen] = useState<RoadmapStep | null>(null);
  const [opener, setOpener] = useState<HTMLButtonElement | null>(null);
  const nextKey = progress.next?.key ?? null;

  useEffect(() => {
    if (open) return;
    opener?.focus({ preventScroll: true });
  }, [open, opener]);

  const openStep = (step: RoadmapStep, button: HTMLButtonElement) => {
    setOpener(button);
    setOpen(step);
  };

  return (
    <section className={styles.wrap} aria-label={`${roadmap.title} roadmap`}>
      <ul className={styles.legend} aria-label="How to read the roadmap">
        <li data-key="order">in this order</li>
        <li data-key="any">any order</li>
        <li data-key="done">done</li>
        <li data-key="doing">in progress</li>
        <li data-key="outline">not written yet</li>
      </ul>

      <div className={`${styles.diagram} ${loaded ? "" : styles.pending}`}>
        {roadmap.stages.map((stage, at) => {
          const headId = `${stage.id}-stage`;
          const fan = stage.order === "any-order";
          return (
            <section key={stage.id} className={styles.stage} aria-labelledby={headId} id={stage.id}>
              <header className={styles.stageNode}>
                <span className={styles.stageNo}>{pad(at + 1)}</span>
                <h2 id={headId} className={styles.stageTitle}>
                  {stage.title}
                </h2>
                <p className={styles.stageBlurb}>{stage.blurb}</p>
                <span className={styles.stageOrder}>{fan ? "any order" : "in this order"}</span>
              </header>
              <ol className={fan ? styles.fan : styles.lane} aria-label={`${stage.title} steps`}>
                {stage.steps.map((step, k) => (
                  <li
                    key={step.key}
                    className={styles.slot}
                    data-side={fan ? (k % 2 === 0 ? "left" : "right") : "centre"}
                  >
                    <Node
                      step={step}
                      progress={progress.steps[step.key]}
                      next={nextKey === step.key}
                      onOpen={openStep}
                    />
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      {open && (
        <Drawer
          key={open.key}
          step={open}
          progress={progress.steps[open.key]}
          next={nextKey === open.key}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
