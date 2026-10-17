"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import {
  CIRCLE_R,
  HUB,
  RING_R,
  VIEW_H,
  VIEW_W,
  circleEdge,
  connectorPath,
  dotAngles,
  middle,
  percentX,
  percentY,
  ringPoint,
  stageCenter,
} from "./orbitLayout";
import { RoadmapTicket } from "./RoadmapTicket";
import { neighbours, roadmapProgress, statusLabel, type RoadmapProgress, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./orbit.module.css";

const TINTS = ["blue", "green", "orange", "purple", "red", "teal"] as const;
const tintOf = (stageAt: number) => `var(--c-${TINTS[stageAt % TINTS.length]})`;
const pad = (n: number) => String(n).padStart(2, "0");

const MARK: Record<StepStatus, string> = { done: "✓", doing: "", todo: "", outline: "" };

function stageSummary(roadmap: Roadmap, stageAt: number, progress: RoadmapProgress) {
  const steps = roadmap.stages[stageAt].steps;
  const readable = steps.filter((step) => progress.steps[step.key].status !== "outline");
  const finished = readable.filter((step) => progress.steps[step.key].status === "done").length;
  const percent = readable.length ? Math.round((finished / readable.length) * 100) : 0;
  return { readable: readable.length, finished, percent };
}

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return `${plural(step.written, "chapter")} · ${formatSpan(step.minutes)}`;
}

export function RoadmapOrbit({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const stages = roadmap.stages;
  const count = stages.length;
  const flat = useMemo(
    () => stages.flatMap((stage, stageAt) => stage.steps.map((step) => ({ step, stageAt }))),
    [stages]
  );
  const angles = useMemo(() => dotAngles(stages.map((stage) => stage.steps.length)), [stages]);
  const nextKey = progress.next?.key ?? null;
  const nextStage = flat.find((entry) => entry.step.key === nextKey)?.stageAt ?? 0;
  const [picked, setPicked] = useState<number | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const moved = useRef(false);
  const stageAt = picked ?? nextStage;
  const stage = stages[stageAt];
  const tint = tintOf(stageAt);
  const overall = progress.stepsReadable ? Math.round((progress.stepsDone / progress.stepsReadable) * 100) : 0;

  useEffect(() => {
    if (!moved.current) return;
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [stageAt, openKey]);

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

  const chooseStage = (at: number) => {
    moved.current = true;
    setPicked(at);
    setOpenKey(null);
  };
  const chooseStep = (key: string) => {
    const at = flat.find((entry) => entry.step.key === key)?.stageAt ?? stageAt;
    moved.current = true;
    setPicked(at);
    setOpenKey((current) => (current === key ? null : key));
  };
  const closeOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    setOpenKey(null);
  };

  const open = flat.find((entry) => entry.step.key === openKey) ?? null;
  const platform = open ? flat.findIndex((entry) => entry.step.key === open.step.key) + 1 : 0;

  return (
    <section className={styles.wrap} aria-label={`${roadmap.title} roadmap`}>
      <div
        className={`${styles.map} ${loaded ? "" : styles.pending}`}
        style={{ "--ratio": `${VIEW_W} / ${VIEW_H}` } as CSSProperties}
      >
        <svg className={styles.links} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" focusable="false">
          {stages.map((entry, at) => (
            <path
              key={entry.id}
              className={styles.link}
              data-active={at === stageAt}
              d={connectorPath(ringPoint(middle(angles[at]), RING_R + 18), circleEdge(at, count))}
              style={{ stroke: tintOf(at) }}
            />
          ))}
        </svg>

        <div
          className={styles.hub}
          style={
            {
              left: `${percentX(HUB.x)}%`,
              top: `${percentY(HUB.y)}%`,
              "--pct": overall,
            } as CSSProperties
          }
        >
          <div className={styles.hubDisc}>
            <span className={styles.hubKicker}>Your route</span>
            <strong className={styles.hubTitle}>{roadmap.title}</strong>
            <span className={styles.hubMeta}>
              {progress.stepsDone} of {progress.stepsReadable} steps done
            </span>
          </div>
        </div>

        {flat.map(({ step, stageAt: at }, index) => {
          const groupStart = flat.findIndex((entry) => entry.stageAt === at);
          const angle = angles[at][index - groupStart];
          const point = ringPoint(angle);
          const state = progress.steps[step.key];
          const isNext = nextKey === step.key;
          return (
            <button
              key={step.key}
              type="button"
              className={styles.dot}
              data-status={state.status}
              data-next={isNext}
              data-keep-open
              style={
                {
                  left: `${percentX(point.x)}%`,
                  top: `${percentY(point.y)}%`,
                  "--tint": tintOf(at),
                } as CSSProperties
              }
              aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next stop." : ""}`}
              onClick={() => chooseStep(step.key)}
            />
          );
        })}

        <ol className={styles.stages} aria-label="Stages of the route">
          {stages.map((entry, at) => {
            const centre = stageCenter(at, count);
            const summary = stageSummary(roadmap, at, progress);
            const labelLeft = centre.x + CIRCLE_R + 26;
            return (
              <li
                key={entry.id}
                className={styles.stage}
                data-active={at === stageAt}
                style={
                  {
                    left: `${percentX(centre.x)}%`,
                    top: `${percentY(centre.y)}%`,
                    "--tint": tintOf(at),
                    "--pct": summary.percent,
                    "--lw": (VIEW_W - labelLeft - 6) / 10,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className={styles.circle}
                  aria-pressed={at === stageAt}
                  aria-label={`Stage ${at + 1}: ${entry.title}. ${summary.finished} of ${summary.readable} steps built.`}
                  onClick={() => chooseStage(at)}
                >
                  <span className={styles.disc}>
                    <span className={styles.num}>{pad(at + 1)}</span>
                    <span className={styles.ratio}>
                      {summary.finished}/{summary.readable}
                    </span>
                  </span>
                </button>
                <div className={styles.label}>
                  <span className={styles.labelTitle}>{entry.title}</span>
                  <span className={styles.labelBlurb}>{entry.blurb}</span>
                  <span className={styles.labelMeta}>
                    {plural(entry.steps.length, "step")} · {entry.order === "any-order" ? "any order" : "in order"}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <section
        ref={panelRef}
        className={styles.panel}
        aria-label={`Stage ${stageAt + 1}: ${stage.title}`}
        style={{ "--tint": tint } as CSSProperties}
      >
        <header className={styles.panelHead}>
          <span className={styles.panelNo}>{pad(stageAt + 1)}</span>
          <div>
            <h2 className={styles.panelTitle}>{stage.title}</h2>
            <p className={styles.panelBlurb}>{stage.blurb}</p>
          </div>
          <span className={styles.panelOrder}>{stage.order === "any-order" ? "any order" : "in this order"}</span>
        </header>

        <ul className={styles.tiles}>
          {stage.steps.map((step) => {
            const state = progress.steps[step.key];
            const isNext = nextKey === step.key;
            const isOpen = openKey === step.key;
            return (
              <li key={step.key}>
                <button
                  type="button"
                  className={styles.tile}
                  data-status={state.status}
                  data-next={isNext}
                  data-open={isOpen}
                  data-keep-open
                  aria-expanded={isOpen}
                  aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next stop." : ""}`}
                  onClick={() => chooseStep(step.key)}
                >
                  <span className={styles.tileMark} aria-hidden="true">
                    {MARK[state.status] || step.mark}
                  </span>
                  <span className={styles.tileTitle}>{step.title}</span>
                  <span className={styles.tileMeta}>{shortMeta(step)}</span>
                  <span className={styles.tileState}>
                    {statusLabel(state)}
                    {isNext ? " · next" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {open && (
          <div className={styles.ticket} data-keep-open>
            <RoadmapTicket
              step={open.step}
              platform={platform}
              routeName={roadmap.title}
              progress={progress.steps[open.step.key]}
              done={done}
              next={nextKey === open.step.key}
              before={neighbours(roadmap, open.step.key).before}
              after={neighbours(roadmap, open.step.key).after}
              onGo={chooseStep}
              onClose={() => setOpenKey(null)}
              onKeyDown={closeOnEscape}
            />
          </div>
        )}
      </section>
    </section>
  );
}
