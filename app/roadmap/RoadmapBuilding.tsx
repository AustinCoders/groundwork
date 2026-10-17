"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { formatSpan, plural } from "@/lib/format";
import type { Roadmap, RoadmapStep } from "@/lib/roadmap";
import { Detail } from "./RoadmapDetail";
import { neighbours, roadmapProgress, statusLabel, type RoadmapProgress, type StepStatus } from "./roadmapModel";
import { useDone } from "./useDone";
import styles from "./building.module.css";

const TINTS = ["blue", "green", "orange", "purple", "red", "teal"] as const;

const LIGHT: Record<StepStatus, string> = {
  done: "lights on",
  doing: "half built",
  todo: "ready to read",
  outline: "blueprint only",
};

const pad = (n: number) => String(n).padStart(2, "0");

function shortMeta(step: RoadmapStep): string {
  if (step.written === 0) return "coming soon";
  if (step.kind === "round") return formatSpan(step.minutes);
  return plural(step.written, "chapter");
}

function floorNote(roadmap: Roadmap, stageAt: number, progress: RoadmapProgress): string {
  const steps = roadmap.stages[stageAt].steps;
  const readable = steps.filter((step) => progress.steps[step.key].status !== "outline");
  if (readable.length === 0) return "Blueprint only. Nothing written yet.";
  const finished = readable.filter((step) => progress.steps[step.key].status === "done").length;
  if (finished === readable.length) return "Finished. Lights are on.";
  return `${finished} of ${readable.length} rooms built`;
}

function Crane() {
  return (
    <svg className={styles.crane} viewBox="0 0 60 64" aria-hidden="true" focusable="false">
      <g className="rough">
        <path d="M14 62V8M14 8H54M14 8L4 18M30 8L14 24M54 8V30" />
        <path className={styles.hook} d="M54 30V44M49 44H59V52H49Z" />
      </g>
    </svg>
  );
}

function Stairs({ side }: { side: "left" | "right" }) {
  return (
    <svg className={styles.stairs} data-side={side} viewBox="0 0 70 44" aria-hidden="true" focusable="false">
      <g className="rough">
        <path d="M4 42H16V32H28V22H40V12H52V2H66" />
      </g>
    </svg>
  );
}

export function RoadmapBuilding({ roadmap }: { roadmap: Roadmap }) {
  const { done, loaded } = useDone();
  const progress = useMemo(() => roadmapProgress(roadmap, done), [roadmap, done]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const nextKey = progress.next?.key ?? null;
  const floors = roadmap.stages.length;

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
      <ul className={styles.legend} aria-label="How to read the building">
        <li data-key="done">lights on: done</li>
        <li data-key="doing">half lit: in progress</li>
        <li data-key="todo">lights off: ready to read</li>
        <li data-key="outline">scaffold: coming soon</li>
        <li data-key="crane">crane: next up</li>
      </ul>
      <p className={styles.read}>
        Start on the ground floor and climb. Rooms joined by arrows go in order; open rooms can be done in any order.
      </p>

      <div className={`${styles.building} ${loaded ? "" : styles.pending}`}>
        <div className={styles.ground}>
          <span>Ground level</span>
          <b>Start here</b>
        </div>

        {roadmap.stages.map((stage, at) => {
          const any = stage.order === "any-order";
          const headId = `${stage.id}-floor`;
          const open = stage.steps.find((step) => step.key === openKey) ?? null;
          return (
            <div
              key={stage.id}
              id={stage.id}
              className={styles.level}
              style={{ "--route": `var(--c-${TINTS[at % TINTS.length]})` } as CSSProperties}
            >
              <section className={styles.floor} aria-labelledby={headId}>
                <header className={styles.sign}>
                  <span className={styles.number}>{pad(at + 1)}</span>
                  <h2 id={headId} className={styles.title}>
                    {stage.title}
                  </h2>
                  <p className={styles.blurb}>{stage.blurb}</p>
                  <p className={styles.note}>
                    {any ? "Any order" : "In this order"} · {floorNote(roadmap, at, progress)}
                  </p>
                </header>

                <ol
                  className={styles.rooms}
                  data-any={any}
                  aria-label={`${stage.title}, ${any ? "in any order" : "in this order"}`}
                >
                  {stage.steps.map((step) => {
                    const state = progress.steps[step.key];
                    const isNext = nextKey === step.key;
                    const isOpen = openKey === step.key;
                    return (
                      <li key={step.key} className={styles.slot}>
                        {isNext && <Crane />}
                        <button
                          type="button"
                          ref={(node) => {
                            if (node) buttons.current.set(step.key, node);
                            else buttons.current.delete(step.key);
                          }}
                          className={styles.room}
                          data-status={state.status}
                          data-next={isNext}
                          data-open={isOpen}
                          data-keep-open
                          aria-expanded={isOpen}
                          aria-label={`${step.title}. ${statusLabel(state)}.${isNext ? " Next up." : ""}`}
                          onClick={() => setOpenKey(isOpen ? null : step.key)}
                        >
                          <span className={styles.pane} aria-hidden="true" />
                          <span className={styles.roomTitle}>{step.title}</span>
                          <span className={styles.roomMeta}>{shortMeta(step)}</span>
                          <span className={styles.light} aria-hidden="true">
                            {LIGHT[state.status]}
                            {isNext ? " · next" : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {open && (
                <div className={styles.cutaway} data-keep-open>
                  <Detail
                    step={open}
                    progress={progress.steps[open.key]}
                    next={nextKey === open.key}
                    around={neighbours(roadmap, open.key)}
                    onClose={() => close(open.key)}
                    onKeyDown={closeOnEscape(open.key)}
                  />
                </div>
              )}

              {at < floors - 1 && <Stairs side={at % 2 === 0 ? "right" : "left"} />}
            </div>
          );
        })}

        <div className={styles.roof}>
          <svg viewBox="0 0 1000 120" aria-hidden="true" focusable="false" preserveAspectRatio="none">
            <g className="rough">
              <path className={styles.roofLine} d="M6 118L500 14L994 118Z" />
              <path className={styles.pole} d="M500 14V-40" />
              <path className={styles.flag} d="M500 -40L548 -24L500 -8Z" />
            </g>
          </svg>
          <span className={styles.top}>Top floor · {roadmap.title}</span>
        </div>
      </div>
    </section>
  );
}
