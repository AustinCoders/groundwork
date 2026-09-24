"use client";

import { useEffect, useRef, useState } from "react";
import { ChoiceCards, type IconName } from "@/app/mock/ChoiceCards";
import { COMPANIES, hours, INTENSITIES, LEVELS, ROLES } from "@/app/mock/options";
import { loopMinutes, planLoop } from "@/lib/mock/loops";
import { STYLE_ORDER, STYLES, styleOf } from "@/lib/mock/styles";
import type { CompanyType, LoopConfig, PlannedStage, StageId, StageInfo, StyleId } from "@/lib/mock/types";
import styles from "./mock.module.css";

type StepId = "style" | "role" | "level" | "company" | "length" | "review";

const STEP_LABEL: Record<StepId, string> = {
  style: "Style",
  role: "Role",
  level: "Experience",
  company: "Company",
  length: "Length",
  review: "Your loop",
};
const STEP_QUESTION: Record<StepId, string> = {
  style: "Whose loop?",
  role: "What's the role?",
  level: "How much experience?",
  company: "What kind of company?",
  length: "How long have you got?",
  review: "Your loop",
};

/** A company style decides the kind of company, so it has no company step. */
function stepsFor(config: LoopConfig): StepId[] {
  return config.style
    ? ["style", "role", "level", "length", "review"]
    : ["style", "role", "level", "company", "length", "review"];
}

type StyleChoice = StyleId | "custom";
const STYLE_ICON: Record<StyleChoice, IconName> = {
  amazon: "bar-raiser",
  big: "towers",
  startup: "startup",
  service: "service",
  custom: "custom",
};

const ROLE_ICON: Record<string, IconName> = { frontend: "frontend", fullstack: "fullstack", backend: "backend" };
const LEVEL_ICON: Record<string, IconName> = { junior: "level-1", mid: "level-2", senior: "level-3" };
const COMPANY_ICON: Record<CompanyType, IconName> = {
  service: "service",
  product: "product",
  saas: "saas",
  agency: "agency",
};
const LENGTH_ICON: Record<string, IconName> = { quick: "clock-1", standard: "clock-2", full: "clock-4" };

export function LoopMap({
  plan,
  stages,
  veto = [],
}: {
  plan: PlannedStage[];
  stages: Record<StageId, StageInfo>;
  veto?: StageId[];
}) {
  return (
    <ol className={styles.map} aria-label="The loop, in order">
      {plan.map((p) => {
        const info = stages[p.stage];
        return (
          <li key={p.stage} className={styles.mapStage} data-core={p.core}>
            <span className={styles.mapTitle}>{info.title}</span>
            <span className={styles.mapMeta}>
              <span className={styles.kindTag} data-kind={info.kind}>
                {info.kind === "coding" ? "code" : "talk"}
              </span>
              <span className={styles.nowrap}>
                {p.questions} {p.questions === 1 ? "question" : "questions"} · {p.minutes} min
              </span>
              {veto.includes(p.stage) ? (
                <span className={styles.coreBadge} data-veto="true">
                  veto
                </span>
              ) : p.core ? (
                <span className={styles.coreBadge}>core</span>
              ) : (
                <span aria-hidden="true" />
              )}
            </span>
            <p className={styles.mapReason}>{p.reason}</p>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Planning a loop, one question at a time. A first visit walks the four
 * choices; a returning reader, whose choices are already saved, lands on the
 * finished loop and can jump back to any one of them from the stepper — and
 * after changing it, comes straight back to the loop rather than walking the
 * remaining steps again.
 */
export function LoopWizard({
  config,
  onChange,
  hasSaved,
  plan,
  stages,
  hotFor,
  busy,
  error,
  onStart,
  onReview,
  onStartIntent,
}: {
  config: LoopConfig;
  onChange: (patch: Partial<LoopConfig>) => void;
  hasSaved: boolean;
  plan: PlannedStage[];
  stages: Record<StageId, StageInfo>;
  hotFor: Record<StageId, CompanyType[]>;
  busy: boolean;
  error: string | null;
  onStart: () => void;
  onReview?: () => void;
  onStartIntent?: () => void;
}) {
  const steps = stepsFor(config);
  const REVIEW = steps.length - 1;
  const [stepOverride, setStepOverride] = useState<StepId | null>(null);
  const [backToReview, setBackToReview] = useState(false);
  // How far a first visit has got, so the steps not yet reached do not show a
  // choice nobody has made.
  const [furthest, setFurthest] = useState(0);
  // Derived rather than stored, so the server (which cannot see saved choices)
  // and the first client render agree, and a returning reader still opens on
  // the finished loop once hydration has read their choices.
  // Held by id rather than position, since choosing a style removes a step.
  const stepId: StepId = stepOverride && steps.includes(stepOverride) ? stepOverride : hasSaved ? "review" : "style";
  const step = steps.indexOf(stepId);
  const reached = hasSaved ? REVIEW : Math.max(furthest, step);

  // Move focus with the step, so a keyboard or screen-reader user lands on the
  // new question instead of on a button that has just disappeared. Only when
  // the reader moved: not on load, and not when hydration reads saved choices
  // and the wizard jumps to the finished loop by itself.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const movedByReader = useRef(false);
  useEffect(() => {
    if (!movedByReader.current) return;
    movedByReader.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const reviewRef = useRef(onReview);
  useEffect(() => {
    reviewRef.current = onReview;
  });
  useEffect(() => {
    if (stepId === "review") reviewRef.current?.();
  }, [stepId]);

  function goTo(i: number) {
    movedByReader.current = true;
    setBackToReview(step === REVIEW && i !== REVIEW);
    setFurthest((f) => Math.max(f, i));
    setStepOverride(steps[i]);
  }

  function choose(patch: Partial<LoopConfig>) {
    movedByReader.current = true;
    onChange(patch);
    // The step list can change with the choice (a style drops the company
    // step), so the next step is found in the list the choice produces.
    const nextSteps = stepsFor({ ...config, ...patch });
    const here = nextSteps.indexOf(stepId);
    const next = backToReview ? nextSteps.length - 1 : Math.min(here + 1, nextSteps.length - 1);
    setFurthest((f) => Math.max(f, next));
    setStepOverride(nextSteps[next]);
    setBackToReview(false);
  }

  const style = styleOf(config.style);
  const values: Record<StepId, string | undefined> = {
    style: style?.name ?? "Your own",
    role: ROLES.find(([v]) => v === config.role)?.[1],
    level: LEVELS.find(([v]) => v === config.seniority)?.[1],
    company: COMPANIES.find(([v]) => v === config.company)?.[1],
    length: INTENSITIES.find(([v]) => v === config.intensity)?.[1],
    review: undefined,
  };

  const totalMinutes = loopMinutes(plan);
  const totalQuestions = plan.reduce((n, p) => n + p.questions, 0);

  return (
    <section className="sheet" aria-labelledby="wizard-q">
      <p className={styles.eyebrow}>plan the loop</p>

      <ol className={styles.stepper} aria-label="Steps">
        {steps.map((id, i) => {
          const label = STEP_LABEL[id];
          const state = i === step ? "current" : i <= reached ? "done" : "next";
          return (
            <li key={id} className={styles.stepperItem} data-state={state}>
              <button
                type="button"
                className={styles.stepperButton}
                aria-current={i === step ? "step" : undefined}
                onClick={() => goTo(i)}
              >
                <span className={styles.stepperDot} aria-hidden="true">
                  {i === REVIEW ? (
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="currentColor" focusable="false">
                      <path d="M3 1.5l7 4.5-7 4.5z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={styles.stepperText}>
                  <span className={styles.stepperLabel}>{label}</span>
                  {i < REVIEW && state !== "next" && <span className={styles.stepperValue}>{values[id]}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div key={stepId} className={styles.stepBody}>
        <h2 id="wizard-q" ref={headingRef} tabIndex={-1} className={styles.stepQuestion}>
          {STEP_QUESTION[stepId]}
        </h2>

        {stepId === "style" && (
          <ChoiceCards<StyleChoice>
            label="Loop style"
            value={config.style ?? "custom"}
            onChoose={(choice) =>
              choose(choice === "custom" ? { style: null } : { style: choice, company: STYLES[choice].company })
            }
            options={[
              ...STYLE_ORDER.map((id) => ({
                value: id as StyleChoice,
                name: STYLES[id].name,
                detail: STYLES[id].detail,
                source: `from ${STYLES[id].basedOn}`,
                icon: STYLE_ICON[id],
              })),
              {
                value: "custom" as const,
                name: "Build my own",
                detail: "pick the kind of company, and the loop follows its rounds",
                icon: STYLE_ICON.custom,
              },
            ]}
          />
        )}
        {stepId === "role" && (
          <ChoiceCards
            label="Role"
            value={config.role}
            onChoose={(role) => choose({ role })}
            options={ROLES.map(([value, name, detail]) => ({ value, name, detail, icon: ROLE_ICON[value] }))}
          />
        )}
        {stepId === "level" && (
          <ChoiceCards
            label="Experience"
            value={config.seniority}
            onChoose={(seniority) => choose({ seniority })}
            options={LEVELS.map(([value, name, detail]) => ({ value, name, detail, icon: LEVEL_ICON[value] }))}
          />
        )}
        {stepId === "company" && (
          <ChoiceCards
            label="Company"
            value={config.company}
            onChoose={(company) => choose({ company })}
            options={COMPANIES.map(([value, name, detail]) => ({ value, name, detail, icon: COMPANY_ICON[value] }))}
          />
        )}
        {stepId === "length" && (
          <ChoiceCards
            label="Length"
            value={config.intensity}
            onChoose={(intensity) => choose({ intensity })}
            options={INTENSITIES.map(([value, name]) => {
              const p = planLoop({ ...config, intensity: value }, hotFor);
              return {
                value,
                name,
                detail: `about ${hours(loopMinutes(p))} · ${p.length} rounds`,
                icon: LENGTH_ICON[value],
              };
            })}
          />
        )}

        {step < REVIEW && (
          <div className={styles.stepNav}>
            <button type="button" className="btn btn--ghost" disabled={step === 0} onClick={() => goTo(step - 1)}>
              ← Back
            </button>
            <span className={styles.spacer} />
            <button type="button" className="btn" onClick={() => goTo(backToReview ? REVIEW : step + 1)}>
              {backToReview || step === REVIEW - 1 ? "See the loop →" : `Next: ${STEP_LABEL[steps[step + 1]]} →`}
            </button>
          </div>
        )}

        {stepId === "review" && (
          <>
            {style && (
              <p className={styles.styleNote}>
                <b>{style.name}</b> — {style.detail}. Built from {style.basedOn} of the book
                {style.veto?.length ? "; a lean-no in the round marked veto is a no" : ""}.
              </p>
            )}
            <p className={styles.mapTotals}>
              {plan.length} rounds · {totalQuestions} questions · about {hours(totalMinutes)} — tap any step above to
              change it
            </p>
            <LoopMap plan={plan} stages={stages} veto={style?.veto} />
            <div className={styles.startBar}>
              <button
                type="button"
                className="btn btn--primary"
                disabled={busy}
                onPointerEnter={onStartIntent}
                onFocus={onStartIntent}
                onClick={onStart}
              >
                {busy ? "Setting up the room…" : "Start the loop"}
              </button>
              <p className={styles.startNote}>
                Answer out loud before you look. Each question has a clock, the interviewer will push with a follow-up,
                and <b>core</b> rounds can sink the loop on their own — the way a real debrief works.
              </p>
            </div>
          </>
        )}
        {error && <p className="warn">{error}</p>}
      </div>
    </section>
  );
}
