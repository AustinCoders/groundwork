"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore, type CSSProperties } from "react";
import { Band, Step, Steps, topicKit } from "@/components/topic/TopicKit";
import { useAccount } from "@/lib/account/session";
import { computeStats } from "@/lib/gamification";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { useConfidence } from "@/lib/interviewConfidence";
import { readiness as mockReadiness } from "@/lib/mock/readiness";
import { mockSnapshot, serverMockSnapshot, subscribeMock } from "@/lib/mock/storage";
import { freezeState } from "@/lib/profile/freeze";
import { plan, usePlan } from "@/lib/profile/plan";
import { READINESS_BAND_LABEL, computeReadiness, type Readiness } from "@/lib/profile/readiness";
import { ROLE_TITLE, trackFor } from "@/lib/profile/roles";
import type { BaseTracks, RoleId } from "@/lib/profile/roleTracks";
import { buildToday, type TodayPlan } from "@/lib/profile/today";
import { useQuizRecords } from "@/lib/quizStore";
import { activity, dayKey, progress } from "@/lib/storage";
import { confidenceCounts } from "./progressModel";
import styles from "./plan.module.css";

const TASK_ICON: Record<TodayPlan["tasks"][number]["kind"], string> = {
  review: "↻",
  read: "📖",
  questions: "❝",
  mock: "⏱",
  practice: "✓",
};

export type SkillInfo = Record<string, { name: string; href: string | null }>;

function todayNoon(): number {
  return new Date().setHours(12, 0, 0, 0);
}

function useRole(): RoleId | null {
  const { profile } = useAccount();
  return profile?.targetRole ?? null;
}

function useMock() {
  const snap = useSyncExternalStore(subscribeMock, mockSnapshot, serverMockSnapshot);
  const now = useClientValue(todayNoon, 0);
  return useMemo(() => {
    const history = snap.history;
    if (history.length === 0 || now === 0) return { summary: null, lastAt: null };
    const r = mockReadiness(history, now);
    const lastAt = Math.max(...history.map((h) => h.finishedAt));
    return { summary: r ? { score: r.score, sessions: history.length } : null, lastAt };
  }, [snap, now]);
}

function useReadSet(): Set<string> {
  const key = useProgressValue(() => Object.keys(progress.all().chapters).join(","), "");
  return useMemo(() => new Set(key ? key.split(",") : []), [key]);
}

export function useReadiness(tracks: BaseTracks, skillInfo: SkillInfo): { readiness: Readiness; role: RoleId | null } {
  const role = useRole();
  const read = useReadSet();
  const quiz = useQuizRecords();
  const conf = useConfidence();
  const exercises = useProgressValue(() => Object.keys(progress.all().exercises).length, 0);
  const { summary } = useMock();
  const studyPlan = usePlan();
  const readiness = useMemo(() => {
    const passed = new Set(
      Object.entries(quiz)
        .filter(([, r]) => r.passedAt !== null)
        .map(([id]) => id)
    );
    return computeReadiness({
      track: trackFor(role, tracks),
      read,
      passed,
      exercises,
      confidence: confidenceCounts(conf),
      mock: summary,
      skills: studyPlan.skills,
      skillInfo,
    });
  }, [role, tracks, read, quiz, exercises, conf, summary, studyPlan.skills, skillInfo]);
  return { readiness, role };
}

function Ring({ score }: { score: number }) {
  return (
    <div
      className={styles.ring}
      style={{ "--pct": `${score}%` } as CSSProperties}
      role="img"
      aria-label={`${score} percent ready`}
    >
      <span className={styles.ringValue}>
        {score}
        <small>%</small>
      </span>
    </div>
  );
}

export function ReadinessBand({
  no,
  loaded,
  tracks,
  skillInfo,
}: {
  no: string;
  loaded: boolean;
  tracks: BaseTracks;
  skillInfo: SkillInfo;
}) {
  const { readiness, role } = useReadiness(tracks, skillInfo);
  const title = ROLE_TITLE[role ?? "other"];
  return (
    <Band
      no={no}
      id="readiness-h"
      sectionId="readiness"
      label="Interview readiness"
      title={`How ready you are for a ${title.toLowerCase()} interview`}
      sub="From what you have read, checked, practised, answered and mocked. It moves as you do."
    >
      <div className={loaded ? styles.body : `${styles.body} ${topicKit.pending}`}>
        <div className={styles.readyGrid}>
          <div className={styles.scoreCard}>
            <Ring score={readiness.score} />
            <p className={styles.band} data-band={readiness.band}>
              {READINESS_BAND_LABEL[readiness.band]}
            </p>
            <p className={styles.meta}>
              For <strong>{title}</strong>.{" "}
              <Link href="/account/profile#profile-goals" className={styles.link}>
                {role ? "Change role" : "Pick your role"}
              </Link>
            </p>
          </div>
          <ul className={styles.parts} aria-label="What the score is made of">
            {readiness.parts.map((part) => (
              <li key={part.id} className={styles.part}>
                <div className={styles.partHead}>
                  <span className={styles.partLabel}>{part.label}</span>
                  <span className={styles.partValue}>{Math.round(part.value * 100)}%</span>
                </div>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ width: `${Math.round(part.value * 100)}%` }} />
                </span>
                <span className={styles.partDetail}>
                  {part.detail} · counts {Math.round(part.weight)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
        {readiness.gaps.length > 0 && (
          <>
            <h3 className={styles.subhead}>Close these gaps first</h3>
            <Steps label="Biggest gaps" count={Math.min(4, readiness.gaps.length)}>
              {readiness.gaps.slice(0, 4).map((gap, k) => (
                <Step key={gap.id} no={k + 1} title={gap.title} body={gap.body} href={gap.href} action={gap.action} />
              ))}
            </Steps>
          </>
        )}
      </div>
    </Band>
  );
}

function dateLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function headline(today: TodayPlan, date: string | null): string {
  if (!date || today.daysLeft === null) return "Today's plan";
  if (today.passed) return "Your interview date has passed";
  if (today.daysLeft === 0) return "Your interview is today. Good luck!";
  if (today.daysLeft === 1) return "Your interview is tomorrow";
  return `${today.daysLeft} days to your interview on ${dateLabel(date)}`;
}

export function TodayBand({ no, loaded, tracks }: { no: string; loaded: boolean; tracks: BaseTracks }) {
  const role = useRole();
  const read = useReadSet();
  const conf = useConfidence();
  const studyPlan = usePlan();
  const { lastAt } = useMock();
  const now = useClientValue(todayNoon, 0);
  const due = useProgressValue(() => progress.dueForReview(Object.keys(progress.all().chapters)).length, 0);
  const doneToday = useProgressValue(() => activity.all()[dayKey()] ?? 0, 0);
  const exercises = useProgressValue(() => Object.keys(progress.all().exercises).length, 0);
  const streak = useProgressValue(() => computeStats().streak, 0);
  const banked = useProgressValue(() => freezeState(activity.all(), plan.all().freezes).banked, 0);

  useEffect(() => {
    plan.applyFreezes();
  }, []);

  const today = useMemo(
    () =>
      buildToday({
        track: trackFor(role, tracks),
        read,
        date: studyPlan.date,
        goal: studyPlan.goal,
        doneToday,
        due,
        shaky: confidenceCounts(conf).shaky,
        lastMockAt: lastAt,
        exercises,
        now: now || 0,
      }),
    [role, tracks, read, studyPlan.date, studyPlan.goal, doneToday, due, conf, lastAt, exercises, now]
  );
  const goalDone = Math.min(today.doneToday, today.goal);

  return (
    <Band
      no={no}
      id="today-h"
      sectionId="today"
      label="Today"
      title={headline(today, studyPlan.date)}
      sub={
        studyPlan.date && !today.passed
          ? `${today.remaining} chapters left on your path, about ${today.perDay} a day, with the last day kept for revision.`
          : "Set your interview date and the plan spreads what is left across the days you have."
      }
    >
      <div className={loaded ? styles.body : `${styles.body} ${topicKit.pending}`}>
        <div className={styles.todayHead}>
          <div className={styles.goal}>
            <span className={styles.goalDots} aria-hidden="true">
              {Array.from({ length: today.goal }, (_, k) => (
                <span key={k} className={styles.goalDot} data-on={k < goalDone || undefined} />
              ))}
            </span>
            <span>
              <strong>
                {goalDone} of {today.goal}
              </strong>{" "}
              {goalDone >= today.goal ? "done today. Goal met." : "things done today"}
            </span>
          </div>
          <p className={styles.streak}>
            <span aria-hidden="true">🔥</span> {streak}-day streak
            <span className={styles.dotSep} aria-hidden="true">
              ·
            </span>
            <span aria-hidden="true">❄</span> {banked === 1 ? "1 freeze" : `${banked} freezes`} saved
          </p>
          <Link href="/account#account-plan" className={styles.link}>
            {studyPlan.date ? "Change date or goal" : "Set your interview date"}
          </Link>
        </div>
        {today.tasks.length > 0 ? (
          <ol className={styles.tasks} aria-label="Today's plan">
            {today.tasks.map((task) => (
              <li key={task.id} className={styles.task} data-kind={task.kind}>
                <span className={styles.taskIcon} aria-hidden="true">
                  {TASK_ICON[task.kind]}
                </span>
                <span className={styles.taskText}>
                  <strong>{task.title}</strong>
                  <span>{task.body}</span>
                </span>
                <Link href={task.href} className={styles.taskAction} prefetch={false}>
                  {task.action}
                  <span aria-hidden="true"> →</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.meta}>Nothing left on your path. Keep your streak with a review or a mock.</p>
        )}
        {today.crowded && (
          <p className={styles.warn}>
            That is more than six chapters a day, so the plan stops at six. Put the interview rounds and your weak spots
            first, and skim what you already know.
          </p>
        )}
        <p className={styles.footnote}>
          A freeze keeps your streak when you miss a day. You earn one for every 7 days you study, and can save two.
        </p>
      </div>
    </Band>
  );
}
