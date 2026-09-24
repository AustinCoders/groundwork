import { MINUTES_PER_CODING, MINUTES_PER_TALK } from "@/lib/mock/loops";
import { decideLoop, stageScore, VERDICT_LABEL, verdictFor } from "@/lib/mock/scoring";
import { stageResults, type Session, type SessionQuestion } from "@/lib/mock/session";
import type { StageId } from "@/lib/mock/types";
import { styleOf } from "@/lib/mock/styles";

/**
 * How the time went. The score says whether the answers were right; this says
 * how they would have sounded — and an answer given in twenty seconds to a
 * question with a five-minute slot reads, in the room, as a memorised line or
 * as not knowing there was more to say.
 */

export function budgetSeconds(q: SessionQuestion, s: Session): number {
  return q.item.kind === "coding"
    ? MINUTES_PER_CODING[q.item.exercise] * 60
    : MINUTES_PER_TALK[s.config.seniority] * 60;
}

/** Seconds from the question opening to the answer, or null if it was never answered. */
export function answerSeconds(q: SessionQuestion): number | null {
  if (q.startedAt === null || q.answeredAt === null || q.skipped) return null;
  return Math.max(0, Math.round((q.answeredAt - q.startedAt) / 1000));
}

/** Too quick to have been a real answer: under a fifth of the slot, and under
 *  45 seconds whatever the slot. */
export function isRushed(q: SessionQuestion, s: Session): boolean {
  if (q.item.kind !== "talk") return false;
  const t = answerSeconds(q);
  return t !== null && t < Math.min(45, budgetSeconds(q, s) * 0.2);
}

export interface Pacing {
  timed: number;
  medianSeconds: number | null;
  medianBudget: number | null;
  rushed: number;
  overTime: number;
  notes: string[];
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function pacing(s: Session): Pacing {
  const talk = s.questions.filter((q) => q.item.kind === "talk");
  const times = talk.map(answerSeconds).filter((t): t is number => t !== null);
  const budgets = talk.filter((q) => answerSeconds(q) !== null).map((q) => budgetSeconds(q, s));
  const rushed = talk.filter((q) => isRushed(q, s)).length;
  const overTime = s.questions.filter((q) => q.timedOut).length;
  const medianSeconds = median(times);
  const medianBudget = median(budgets);

  const notes: string[] = [];
  if (medianSeconds !== null && medianBudget !== null) {
    notes.push(`A median of ${clock(medianSeconds)} per spoken answer, against a ${clock(medianBudget)} slot.`);
  }
  if (rushed >= 2) {
    notes.push(
      `${rushed} answers came in under 45 seconds. Unless the question really was a one-liner, that reads as a memorised line — or as not knowing there was more to say. Say the why, then an example.`
    );
  }
  if (overTime > 0) {
    notes.push(
      `${overTime} ran past the clock. In the room the interviewer moves on and the end of your answer is never heard, so lead with the conclusion.`
    );
  }
  return { timed: times.length, medianSeconds, medianBudget, rushed, overTime, notes };
}

const ROLE = { frontend: "Frontend", fullstack: "Full-stack", backend: "Backend" } as const;
const LEVEL = { junior: "2–3 years", mid: "5–7 years", senior: "10+ years" } as const;
const COMPANY = {
  service: "service company",
  product: "product startup",
  saas: "product & SaaS",
  agency: "agency",
} as const;

function plain(html: string): string {
  return html
    .replace(/<\/(p|li|div|h\d)>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The debrief as plain text, for pasting to a mentor or into your own notes. */
export function debriefText(s: Session, stageTitle: (id: StageId) => string): string {
  const results = stageResults(s);
  const decision = decideLoop(results, s.config, stageTitle);
  const pace = pacing(s);
  const lines: string[] = [];

  const what =
    s.mode === "loop"
      ? `${ROLE[s.config.role]}, ${LEVEL[s.config.seniority]}, ${styleOf(s.config.style)?.name ?? COMPANY[s.config.company]} (${s.config.intensity} loop)`
      : s.mode === "retry"
        ? "Retry round"
        : `${stageTitle(s.plan[0]?.stage)} round, ${LEVEL[s.config.seniority]}`;

  lines.push(`Groundwork mock interview — ${what}`);
  lines.push(`Verdict: ${decision.headline} — ${Math.round(decision.score * 100)}%`);
  lines.push("");
  lines.push("Rounds");
  for (const r of results) {
    if (!r.scores.length) {
      lines.push(`  ${stageTitle(r.stage)}${r.core ? " (core)" : ""}: not reached`);
      continue;
    }
    const score = stageScore(r);
    lines.push(
      `  ${stageTitle(r.stage)}${r.core ? " (core)" : ""}: ${Math.round(score * 100)}% — ${VERDICT_LABEL[verdictFor(score)]}`
    );
  }
  if (decision.reasons.length) {
    lines.push("");
    lines.push("Why");
    for (const reason of decision.reasons) lines.push(`  - ${reason}`);
  }
  if (pace.notes.length) {
    lines.push("");
    lines.push("Pacing");
    for (const note of pace.notes) lines.push(`  - ${note}`);
  }
  const weak = s.questions
    .filter((q) => q.score !== null && q.score < 0.6)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5);
  if (weak.length) {
    lines.push("");
    lines.push("Work on these");
    for (const q of weak) {
      const title = q.item.kind === "talk" ? plain(q.item.prompt) : q.item.title;
      lines.push(`  - ${title} (${q.skipped ? "skipped" : `${Math.round((q.score ?? 0) * 100)}%`})`);
    }
  }
  return lines.join("\n");
}
