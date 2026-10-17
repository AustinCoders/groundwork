"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { plural } from "@/lib/format";
import type { Roadmap } from "@/lib/roadmap";
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
import { RoadmapDrawer } from "./RoadmapDrawer";
import { roadmapProgress, statusLabel, type RoadmapProgress } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./orbit.module.css";

const TINTS = ["blue", "green", "orange", "purple", "red", "teal"] as const;
const tintOf = (stageAt: number) => `var(--c-${TINTS[stageAt % TINTS.length]})`;
const pad = (n: number) => String(n).padStart(2, "0");

function stageSummary(roadmap: Roadmap, stageAt: number, progress: RoadmapProgress) {
  const steps = roadmap.stages[stageAt].steps;
  const readable = steps.filter((step) => progress.steps[step.key].status !== "outline");
  const finished = readable.filter((step) => progress.steps[step.key].status === "done").length;
  const percent = readable.length ? Math.round((finished / readable.length) * 100) : 0;
  return { readable: readable.length, finished, percent };
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
  const nextStage = flat.find((entry) => entry.step.key === nextKey)?.stageAt ?? -1;
  const [drawer, setDrawer] = useState<{ stage: number; step: string | null } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const overall = progress.stepsReadable ? Math.round((progress.stepsDone / progress.stepsReadable) * 100) : 0;

  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const watcher = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          watcher.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    watcher.observe(map);
    return () => watcher.disconnect();
  }, []);

  const openStage = (stage: number) => setDrawer({ stage, step: null });
  const openStep = (key: string) => {
    const stage = flat.find((entry) => entry.step.key === key)?.stageAt;
    if (stage !== undefined) setDrawer({ stage, step: key });
  };
  const platformOf = (key: string) => flat.findIndex((entry) => entry.step.key === key) + 1;

  return (
    <section className={styles.wrap} aria-label={`${roadmap.title} roadmap`}>
      <div
        ref={mapRef}
        data-seen={seen}
        className={`${styles.map} ${loaded ? "" : styles.pending}`}
        style={{ "--ratio": `${VIEW_W} / ${VIEW_H}` } as CSSProperties}
      >
        <svg className={styles.links} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" focusable="false">
          {stages.map((entry, at) => (
            <path
              key={entry.id}
              className={styles.link}
              data-active={drawer?.stage === at}
              d={connectorPath(ringPoint(middle(angles[at]), RING_R + 18), circleEdge(at, count))}
              style={{ stroke: tintOf(at), "--i": at } as CSSProperties}
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
                  "--i": index,
                } as CSSProperties
              }
              aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next stop." : ""}`}
              onClick={() => openStep(step.key)}
            />
          );
        })}

        <ol className={styles.stages} aria-label="Stages of the route">
          {stages.map((entry, at) => {
            const centre = stageCenter(at, count);
            const summary = stageSummary(roadmap, at, progress);
            const labelLeft = centre.x + CIRCLE_R + 42;
            return (
              <li
                key={entry.id}
                className={styles.stage}
                data-active={drawer?.stage === at}
                style={
                  {
                    left: `${percentX(centre.x)}%`,
                    top: `${percentY(centre.y)}%`,
                    "--tint": tintOf(at),
                    "--pct": summary.percent,
                    "--i": at,
                    "--lw": (VIEW_W - labelLeft - 6) / 10,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className={styles.circle}
                  aria-haspopup="dialog"
                  aria-label={`Stage ${at + 1}: ${entry.title}. ${summary.finished} of ${summary.readable} steps built.`}
                  onClick={() => openStage(at)}
                >
                  <span className={styles.disc}>
                    <span className={styles.num}>{pad(at + 1)}</span>
                    <span className={styles.ratio}>
                      {summary.finished}/{summary.readable}
                    </span>
                  </span>
                  {at === nextStage && (
                    <span className={styles.nextBadge} aria-hidden="true">
                      Next up
                    </span>
                  )}
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

      {drawer && (
        <RoadmapDrawer
          roadmap={roadmap}
          stageAt={drawer.stage}
          stepKey={drawer.step}
          tint={tintOf(drawer.stage)}
          progress={progress}
          done={done}
          nextKey={nextKey}
          platformOf={platformOf}
          onStep={openStep}
          onBack={() => setDrawer((current) => (current ? { stage: current.stage, step: null } : null))}
          onClose={() => setDrawer(null)}
        />
      )}
    </section>
  );
}
