"use client";

import { useEffect, useRef, useState } from "react";
import { ChoiceCards, type IconName } from "@/app/mock/ChoiceCards";
import { COMPANIES, hours, INTENSITIES, LEVELS, ROLES } from "@/app/mock/options";
import { loopMinutes, planLoop } from "@/lib/mock/loops";
import type { CompanyType, LoopConfig, PlannedStage, StageId, StageInfo } from "@/lib/mock/types";
import styles from "./mock.module.css";

const STEP_LABELS = ["Role", "Experience", "Company", "Length", "Your loop"] as const;
const STEP_QUESTIONS = [
  "What's the role?",
  "How much experience?",
  "What kind of company?",
  "How long have you got?",
  "Your loop",
] as const;
const REVIEW = STEP_LABELS.length - 1;

const ROLE_ICON: Record<string, IconName> = { frontend: "frontend", fullstack: "fullstack", backend: "backend" };
const LEVEL_ICON: Record<string, IconName> = { junior: "level-1", mid: "level-2", senior: "level-3" };
const COMPANY_ICON: Record<CompanyType, IconName> = {
  service: "service",
  product: "product",
  saas: "saas",
  agency: "agency",
};
const LENGTH_ICON: Record<string, IconName> = { quick: "clock-1", standard: "clock-2", full: "clock-4" };

export function LoopMap({ plan, stages }: { plan: PlannedStage[]; stages: Record<StageId, StageInfo> }) {
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
              {p.core ? <span className={styles.coreBadge}>core</span> : <span aria-hidden="true" />}
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
}) {
  const [stepOverride, setStepOverride] = useState<number | null>(null);
  const [backToReview, setBackToReview] = useState(false);
  // How far a first visit has got, so the steps not yet reached do not show a
  // choice nobody has made.
  const [furthest, setFurthest] = useState(0);
  // Derived rather than stored, so the server (which cannot see saved choices)
  // and the first client render agree, and a returning reader still opens on
  // the finished loop once hydration has read their choices.
  const step = stepOverride ?? (hasSaved ? REVIEW : 0);
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

  function goTo(i: number) {
    movedByReader.current = true;
    setBackToReview(step === REVIEW && i !== REVIEW);
    setFurthest((f) => Math.max(f, i));
    setStepOverride(i);
  }

  function choose(patch: Partial<LoopConfig>) {
    movedByReader.current = true;
    onChange(patch);
    const next = backToReview ? REVIEW : Math.min(step + 1, REVIEW);
    setFurthest((f) => Math.max(f, next));
    setStepOverride(next);
    setBackToReview(false);
  }

  const values = [
    ROLES.find(([v]) => v === config.role)?.[1],
    LEVELS.find(([v]) => v === config.seniority)?.[1],
    COMPANIES.find(([v]) => v === config.company)?.[1],
    INTENSITIES.find(([v]) => v === config.intensity)?.[1],
  ];

  const totalMinutes = loopMinutes(plan);
  const totalQuestions = plan.reduce((n, p) => n + p.questions, 0);

  return (
    <section className="sheet" aria-labelledby="wizard-q">
      <p className={styles.eyebrow}>plan the loop</p>

      <ol className={styles.stepper} aria-label="Steps">
        {STEP_LABELS.map((label, i) => {
          const state = i === step ? "current" : i <= reached ? "done" : "next";
          return (
            <li key={label} className={styles.stepperItem} data-state={state}>
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
                  {i < REVIEW && state !== "next" && <span className={styles.stepperValue}>{values[i]}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div key={step} className={styles.stepBody}>
        <h2 id="wizard-q" ref={headingRef} tabIndex={-1} className={styles.stepQuestion}>
          {STEP_QUESTIONS[step]}
        </h2>

        {step === 0 && (
          <ChoiceCards
            label="Role"
            value={config.role}
            onChoose={(role) => choose({ role })}
            options={ROLES.map(([value, name, detail]) => ({ value, name, detail, icon: ROLE_ICON[value] }))}
          />
        )}
        {step === 1 && (
          <ChoiceCards
            label="Experience"
            value={config.seniority}
            onChoose={(seniority) => choose({ seniority })}
            options={LEVELS.map(([value, name, detail]) => ({ value, name, detail, icon: LEVEL_ICON[value] }))}
          />
        )}
        {step === 2 && (
          <ChoiceCards
            label="Company"
            value={config.company}
            onChoose={(company) => choose({ company })}
            options={COMPANIES.map(([value, name, detail]) => ({ value, name, detail, icon: COMPANY_ICON[value] }))}
          />
        )}
        {step === 3 && (
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
              {backToReview || step === REVIEW - 1 ? "See the loop →" : `Next: ${STEP_LABELS[step + 1]} →`}
            </button>
          </div>
        )}

        {step === REVIEW && (
          <>
            <p className={styles.mapTotals}>
              {plan.length} rounds · {totalQuestions} questions · about {hours(totalMinutes)} — tap any step above to
              change it
            </p>
            <LoopMap plan={plan} stages={stages} />
            <div className={styles.startBar}>
              <button type="button" className="btn btn--primary" disabled={busy} onClick={onStart}>
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
