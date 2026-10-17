"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import { ProgressMeter } from "@/components/topic/TopicKit";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import { RoadmapTicket } from "./RoadmapTicket";
import { neighbours, statusLabel, type RoadmapProgress, type StepStatus } from "./roadmapModel";
import styles from "./drawer.module.css";

const MARK: Record<StepStatus, string> = { done: "✓", doing: "", todo: "", outline: "" };

const pad = (n: number) => String(n).padStart(2, "0");

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return `${plural(step.written, "chapter")} · ${formatSpan(step.minutes)}`;
}

export function RoadmapDrawer({
  roadmap,
  stageAt,
  stepKey,
  tint,
  progress,
  done,
  nextKey,
  platformOf,
  onStep,
  onBack,
  onClose,
}: {
  roadmap: Roadmap;
  stageAt: number;
  stepKey: string | null;
  tint: string;
  progress: RoadmapProgress;
  done: ReadonlySet<string>;
  nextKey: string | null;
  platformOf: (key: string) => number;
  onStep: (key: string) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const stage = roadmap.stages[stageAt];
  const readable = stage.steps.filter((step) => progress.steps[step.key].status !== "outline");
  const finished = readable.filter((step) => progress.steps[step.key].status === "done").length;
  const percent = readable.length ? Math.round((finished / readable.length) * 100) : 0;
  const open = stepKey ? (stage.steps.find((step) => step.key === stepKey) ?? null) : null;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const body = ref.current?.querySelector("[data-scroll]");
    if (body) body.scrollTop = 0;
  }, [stepKey, stageAt]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby={titleId}
      style={{ "--tint": tint, "--pct": percent } as CSSProperties}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <header className={styles.head}>
        <span className={styles.orb} aria-hidden="true">
          <span className={styles.orbDisc}>
            <b>{pad(stageAt + 1)}</b>
            <small>
              {finished}/{readable.length}
            </small>
          </span>
        </span>
        <div className={styles.headText}>
          <p className={styles.kicker}>
            {roadmap.title} · {stage.order === "any-order" ? "any order" : "in this order"}
          </p>
          <h2 id={titleId} className={styles.title}>
            {stage.title}
          </h2>
          <p className={styles.blurb}>{stage.blurb}</p>
        </div>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close the drawer">
          ✕
        </button>
      </header>

      <div className={styles.body} data-scroll>
        {open ? (
          <>
            <RoadmapTicket
              step={open}
              platform={platformOf(open.key)}
              routeName={roadmap.title}
              progress={progress.steps[open.key]}
              done={done}
              next={nextKey === open.key}
              before={neighbours(roadmap, open.key).before}
              after={neighbours(roadmap, open.key).after}
              onGo={onStep}
              onClose={onBack}
              closeLabel="Back"
              onKeyDown={() => undefined}
            />
          </>
        ) : (
          <>
            <ProgressMeter
              done={finished}
              total={readable.length}
              label={readable.length ? `${finished} of ${readable.length} steps built` : "Nothing here is written yet"}
            />
            <ol className={styles.steps} aria-label={`${stage.title}, steps`}>
              {stage.steps.map((step, index) => {
                const state = progress.steps[step.key];
                const isNext = nextKey === step.key;
                return (
                  <li key={step.key} style={{ "--i": index } as CSSProperties}>
                    <button
                      type="button"
                      className={styles.card}
                      data-status={state.status}
                      data-next={isNext}
                      aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next stop." : ""}`}
                      onClick={() => onStep(step.key)}
                    >
                      <span className={styles.mark} aria-hidden="true">
                        {MARK[state.status] || step.mark}
                      </span>
                      <span className={styles.cardTitle}>{step.title}</span>
                      <span className={styles.cardMeta}>{shortMeta(step)}</span>
                      <span className={styles.cardState}>
                        {statusLabel(state)}
                        {isNext ? " · next stop" : ""}
                      </span>
                      {isNext && (
                        <span className={styles.next} aria-hidden="true">
                          Next up
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </dialog>
  );
}
