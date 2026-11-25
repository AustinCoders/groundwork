"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useProgressValue } from "@/lib/hooks";
import type { CompanyChoice } from "@/lib/profile/companies";
import { freezeState } from "@/lib/profile/freeze";
import { plan, usePlan } from "@/lib/profile/plan";
import {
  DAILY_GOALS,
  MAX_COMPANIES,
  MAX_SKILLS,
  SKILL_LEVELS,
  type DailyGoal,
  type SkillLevel,
} from "@/lib/profile/planData";
import { daysUntil } from "@/lib/profile/today";
import { SKILLS, skillById } from "@/lib/resume/skills";
import { listResumes, openResume } from "@/lib/resume/store";
import { activity } from "@/lib/storage";
import styles from "./account.module.css";
import own from "./plan.module.css";

const LEVEL_LABEL: Record<SkillLevel, string> = { unsure: "Unsure", okay: "Okay", strong: "Strong" };

const GOAL_LABEL: Record<DailyGoal, string> = {
  1: "Light",
  3: "Steady",
  5: "Focused",
  8: "Sprint",
};

function localDay(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DateCard() {
  const current = usePlan();
  const dateId = useId();
  const banked = useProgressValue(() => freezeState(activity.all(), plan.all().freezes).banked, 0);
  const [today] = useState(() => localDay(Date.now()));
  const left = current.date ? daysUntil(current.date, new Date(`${today}T12:00:00`).getTime()) : null;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Interview date and daily goal</h3>
      <div className={own.field}>
        <label htmlFor={dateId} className={styles.label}>
          When is your interview?
        </label>
        <div className={own.inline}>
          <input
            id={dateId}
            type="date"
            className={`${styles.input} ${own.dateInput}`}
            min={today}
            value={current.date ?? ""}
            onChange={(e) => plan.update({ date: e.target.value || null })}
          />
          {current.date && (
            <button type="button" className={styles.btn} onClick={() => plan.update({ date: null })}>
              Clear
            </button>
          )}
        </div>
        <p className={styles.meta}>
          {left === null
            ? "Optional. With a date, your progress page spreads what is left across the days you have."
            : left < 0
              ? "That date has passed. Pick the next one, or clear it."
              : left === 0
                ? "It is today. Good luck!"
                : `${left} ${left === 1 ? "day" : "days"} to go. Your plan for today is on the progress page.`}
        </p>
      </div>

      <fieldset className={own.fieldset}>
        <legend className={styles.label}>Daily goal</legend>
        <div className={own.segments} role="radiogroup" aria-label="Things to do each day">
          {DAILY_GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              role="radio"
              aria-checked={current.goal === goal}
              className={own.segment}
              onClick={() => plan.update({ goal })}
            >
              <strong>{goal}</strong>
              <span>{GOAL_LABEL[goal]}</span>
            </button>
          ))}
        </div>
        <p className={styles.meta}>
          A chapter, an exercise or a review each counts as one. You have{" "}
          {banked === 1 ? "1 streak freeze" : `${banked} streak freezes`} saved: you earn one for every 7 days you
          study, and a missed day uses one on its own.
        </p>
      </fieldset>
      <Link href="/progress#today" className={own.cta} prefetch={false}>
        See today&apos;s plan and your readiness score →
      </Link>
    </div>
  );
}

function CompaniesCard({ companies }: { companies: CompanyChoice[] }) {
  const current = usePlan();
  const chosen = new Set(current.companies);
  const full = chosen.size >= MAX_COMPANIES;
  const groups = [
    { id: "india", title: "In India" },
    { id: "global", title: "Global" },
  ] as const;

  function toggle(id: string) {
    if (chosen.has(id)) plan.update({ companies: current.companies.filter((c) => c !== id) });
    else if (!full) plan.update({ companies: [...current.companies, id] });
  }

  return (
    <div className={styles.card}>
      <div className={own.cardHead}>
        <h3 className={styles.cardTitle}>Target companies</h3>
        <span className={own.count}>
          {chosen.size}/{MAX_COMPANIES}
        </span>
      </div>
      <p className={styles.meta}>Pick up to five. Their questions come first in the company questions section.</p>
      {groups.map((group) => (
        <div key={group.id} className={own.group}>
          <p className={own.groupTitle}>{group.title}</p>
          <div className={own.chips}>
            {companies
              .filter((c) => c.group === group.id)
              .map((company) => {
                const on = chosen.has(company.id);
                return (
                  <button
                    key={company.id}
                    type="button"
                    className={own.chip}
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(company.id)}
                  >
                    {on && <span aria-hidden="true">✓ </span>}
                    {company.name}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
      {chosen.size > 0 && (
        <Link href="/company-questions#your-companies" className={own.cta} prefetch={false}>
          Open their questions →
        </Link>
      )}
    </div>
  );
}

function SkillsCard() {
  const current = usePlan();
  const addId = useId();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const ids = Object.keys(current.skills);
  const addable = useMemo(
    () => SKILLS.filter((s) => !(s.id in current.skills)).sort((a, b) => a.name.localeCompare(b.name)),
    [current.skills]
  );

  async function fromResume() {
    setBusy(true);
    setNote(null);
    const list = await listResumes();
    if (!list.ok) {
      setBusy(false);
      setNote({ ok: false, text: list.error });
      return;
    }
    if (list.value.length === 0) {
      setBusy(false);
      setNote({ ok: false, text: "No saved resume yet. Check one in the resume lab and keep the result." });
      return;
    }
    const latest = [...list.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const opened = await openResume(latest.id);
    setBusy(false);
    if (!opened.ok) {
      setNote({ ok: false, text: opened.error });
      return;
    }
    const found = opened.value.analysis.parsed.skills.filter((id) => skillById(id));
    const next = { ...current.skills };
    let added = 0;
    for (const id of found) {
      if (!(id in next) && Object.keys(next).length < MAX_SKILLS) {
        next[id] = "okay";
        added += 1;
      }
    }
    plan.update({ skills: next });
    setNote({
      ok: true,
      text: added
        ? `Added ${added} ${added === 1 ? "skill" : "skills"} from “${latest.title}”. Rate each one honestly.`
        : `Every skill on “${latest.title}” is already here.`,
    });
  }

  function rate(id: string, level: SkillLevel) {
    plan.update({ skills: { ...current.skills, [id]: level } });
  }

  function drop(id: string) {
    const next = { ...current.skills };
    delete next[id];
    plan.update({ skills: next });
  }

  return (
    <div className={styles.card}>
      <div className={own.cardHead}>
        <h3 className={styles.cardTitle}>Your skills</h3>
        <span className={own.count}>{ids.length}</span>
      </div>
      <p className={styles.meta}>
        Interviewers ask about everything on your resume. Rate how sure you are; the readiness score and its gaps follow
        your answers.
      </p>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          disabled={busy}
          onClick={() => void fromResume()}
        >
          {busy ? "Reading…" : "Add skills from my saved resume"}
        </button>
      </div>
      {note && (
        <p className={note.ok ? styles.ok : styles.error} role={note.ok ? "status" : "alert"}>
          {note.text}
        </p>
      )}
      {ids.length > 0 && (
        <ul className={own.skills}>
          {ids.map((id) => {
            const name = skillById(id)?.name ?? id;
            return (
              <li key={id} className={own.skill}>
                <span className={own.skillName}>{name}</span>
                <span className={own.levels} role="radiogroup" aria-label={`How sure are you about ${name}?`}>
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={current.skills[id] === level}
                      data-level={level}
                      className={own.level}
                      onClick={() => rate(id, level)}
                    >
                      {LEVEL_LABEL[level]}
                    </button>
                  ))}
                </span>
                <button type="button" className={own.remove} aria-label={`Remove ${name}`} onClick={() => drop(id)}>
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {ids.length < MAX_SKILLS && (
        <div className={own.field}>
          <label htmlFor={addId} className={styles.label}>
            Add a skill
          </label>
          <select
            id={addId}
            className={styles.input}
            value=""
            onChange={(e) => {
              if (e.target.value) plan.update({ skills: { ...current.skills, [e.target.value]: "okay" } });
            }}
          >
            <option value="">Choose a skill…</option>
            {addable.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export function PlanPanel({ companies }: { companies: CompanyChoice[] }) {
  return (
    <div className={own.grid}>
      <DateCard />
      <CompaniesCard companies={companies} />
      <SkillsCard />
    </div>
  );
}
