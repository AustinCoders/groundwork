"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatSpan, plural } from "@/lib/format";
import { accentVar } from "@/lib/accent";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import {
  BADGE_R,
  VIEW_W,
  apex,
  goalPoint,
  percentX,
  percentY,
  railHeight,
  trackLength,
  trackPath,
  trainLength,
  trainPoint,
  START_X,
  TOP,
} from "./railLayout";
import { RoadmapTicket } from "./RoadmapTicket";
import { neighbours, roadmapProgress, statusLabel, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./rail.module.css";

const TINTS = ["blue", "green", "orange", "purple", "red", "teal"] as const;

const MARK: Record<StepStatus, string> = { done: "✓", doing: "", todo: "", outline: "" };

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return `${plural(step.written, "chapter")} · ${formatSpan(step.minutes)}`;
}

function Train({ heading }: { heading: "left" | "right" }) {
  return (
    <svg className={styles.trainArt} data-heading={heading} viewBox="0 0 96 58" aria-hidden="true" focusable="false">
      <path className={styles.smoke} d="M28 8c-3-4 3-6 0-10M38 8c-3-4 3-6 0-10" />
      <path className={styles.trainBody} d="M6 40V24h22v-8h10v8h6V10h-8V4h22v6h-6v14h30v16z" />
      <path className={styles.trainWindow} d="M12 28h10v8H12z" />
      <path className={styles.trainLight} d="M84 30h8v6h-8z" />
      <circle className={styles.wheel} cx="20" cy="46" r="9" />
      <circle className={styles.wheel} cx="48" cy="46" r="9" />
      <circle className={styles.wheel} cx="74" cy="46" r="9" />
    </svg>
  );
}

function Flag() {
  return (
    <svg className={styles.flagArt} viewBox="0 0 44 64" aria-hidden="true" focusable="false">
      <path d="M6 62V4" />
      <path className={styles.flagCloth} d="M6 6h32l-8 12 8 12H6z" />
    </svg>
  );
}

export function RoadmapRail({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const flat = useMemo(
    () => roadmap.stages.flatMap((stage, stageAt) => stage.steps.map((step) => ({ step, stage, stageAt }))),
    [roadmap]
  );
  const count = flat.length;
  const height = railHeight(count);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const maskId = `rail-hollow-${useId().replace(/:/g, "")}`;
  const nextAt = flat.findIndex((entry) => entry.step.key === progress.next?.key);
  const finished = loaded && nextAt === -1 && progress.stepsReadable > 0;
  const total = trackLength(count);
  const lit = nextAt !== -1 ? trainLength(nextAt) : finished ? total : 0;
  const d = trackPath(count);
  const goal = goalPoint(count);
  const train = nextAt !== -1 ? trainPoint(nextAt) : finished ? goal : null;

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
  const go = (key: string) => {
    setOpenKey(key);
    const button = buttons.current.get(key);
    button?.scrollIntoView({ block: "center", behavior: "smooth" });
    button?.focus({ preventScroll: true });
  };

  const jumpToNext = () => {
    const key = progress.next?.key;
    if (!key) return;
    buttons.current.get(key)?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <section className={styles.wrap} aria-label={`${roadmap.title} roadmap`}>
      <div className={styles.bar}>
        <ul className={styles.legend} aria-label="How to read the line">
          <li data-key="done">done</li>
          <li data-key="doing">in progress</li>
          <li data-key="todo">ready to read</li>
          <li data-key="outline">line not laid yet</li>
        </ul>
        {progress.next && (
          <button type="button" className={styles.jump} onClick={jumpToNext}>
            Find the train
          </button>
        )}
      </div>

      <div
        className={`${styles.map} ${loaded ? "" : styles.pending}`}
        style={{ "--ratio": `${VIEW_W} / ${height}` } as CSSProperties}
      >
        <svg className={styles.track} viewBox={`0 0 ${VIEW_W} ${height}`} aria-hidden="true" focusable="false">
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={height}>
              <rect width={VIEW_W} height={height} fill="white" />
              <path d={d} fill="none" stroke="black" strokeWidth="13" />
            </mask>
          </defs>
          <path d={d} className={styles.bed} />
          <path d={d} className={styles.sleepers} />
          <g mask={`url(#${maskId})`}>
            <path d={d} className={styles.rails} />
            <path d={d} className={styles.railsLit} pathLength={total} strokeDasharray={`${lit} ${total + 1000}`} />
          </g>
        </svg>

        <div className={styles.start} style={{ left: `${percentX(START_X)}%`, top: `${percentY(TOP, count)}%` }}>
          <span>Start</span>
        </div>

        <div
          className={styles.goal}
          data-heading={goal.heading}
          style={{ left: `${percentX(goal.x)}%`, top: `${percentY(goal.y, count)}%` }}
        >
          <Flag />
          <span>Goal</span>
        </div>

        {train && (
          <div
            className={styles.train}
            data-heading={train.heading}
            style={{ left: `${percentX(train.x)}%`, top: `${percentY(train.y, count)}%` }}
          >
            <Train heading={train.heading} />
            <span className={styles.trainTag}>{finished ? "Arrived" : "You are here"}</span>
          </div>
        )}

        <ol className={styles.stops} aria-label={`${roadmap.title}, every stop in order`}>
          {flat.map(({ step, stage, stageAt }, index) => {
            const place = apex(index);
            const state = progress.steps[step.key];
            const isNext = progress.next?.key === step.key;
            const isOpen = openKey === step.key;
            const around = neighbours(roadmap, step.key);
            const tint = `var(--c-${TINTS[stageAt % TINTS.length]})`;
            const ticket = (
              <RoadmapTicket
                step={step}
                platform={index + 1}
                routeName={roadmap.title}
                progress={state}
                done={done}
                next={isNext}
                before={around.before}
                after={around.after}
                onGo={go}
                onClose={() => close(step.key)}
                onKeyDown={closeOnEscape(step.key)}
              />
            );
            return (
              <li
                key={step.key}
                className={styles.stop}
                data-side={place.side}
                data-open={isOpen}
                style={
                  {
                    "--x": percentX(place.x),
                    "--y": percentY(place.y, count),
                    "--tint": tint,
                    "--accent": accentVar(step.accent),
                    "--badge": `${BADGE_R * 2}px`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  ref={(node) => {
                    if (node) buttons.current.set(step.key, node);
                    else buttons.current.delete(step.key);
                  }}
                  className={styles.badge}
                  data-status={state.status}
                  data-next={isNext}
                  data-keep-open
                  aria-expanded={isOpen}
                  aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next stop." : ""}`}
                  onClick={() => setOpenKey(isOpen ? null : step.key)}
                >
                  <span aria-hidden="true">{MARK[state.status] || step.mark}</span>
                </button>
                <div className={styles.label}>
                  <span className={styles.kicker}>
                    {String(stageAt + 1).padStart(2, "0")} · {stage.title}
                    {stage.order === "any-order" ? " · any order" : ""}
                  </span>
                  <span className={styles.title}>{step.title}</span>
                  <span className={styles.why}>{step.why ?? step.group ?? ""}</span>
                  <span className={styles.meta}>{shortMeta(step)}</span>
                </div>
                {isOpen && (
                  <div className={styles.ticketDesktop} data-keep-open>
                    {ticket}
                  </div>
                )}
                {isOpen && (
                  <div className={styles.ticketInline} data-keep-open>
                    {ticket}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
