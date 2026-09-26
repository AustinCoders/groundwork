import type { Competency, LoopConfig, Seniority, StageId, TalkItem } from "@/lib/mock/types";
import { styleOf } from "@/lib/mock/styles";

export type Mark = 0 | 0.5 | 1;

export type CriterionId = "testing" | "substance" | "trap" | "followup" | "delivery";

export interface Criterion {
  id: CriterionId;
  label: string;
  hint: string;
  against?: string;
  weight: number;
}

export function rubricFor(item: TalkItem, followUpAsked: boolean): Criterion[] {
  const out: Criterion[] = [];
  if (item.testing) {
    out.push({
      id: "testing",
      label: "You answered what they were really testing",
      hint: "Yes only if you named the idea underneath the question, not just its surface.",
      against: item.testing,
      weight: 2,
    });
  }
  out.push({
    id: "substance",
    label: "Your answer had the substance of the model answer",
    hint: "Check your main points against the model. Missing its central idea is a No.",
    against: item.say || undefined,
    weight: 3,
  });
  if (item.trap) {
    out.push({
      id: "trap",
      label: "You stayed clear of the answer that loses the room",
      hint: "If anything you said sits close to the red box, mark No.",
      against: item.trap,
      weight: 2,
    });
  }
  if (followUpAsked) {
    out.push({
      id: "followup",
      label: "You held up when they pushed",
      hint: "You answered the follow-up itself, without falling back to your prepared answer.",
      weight: 2,
    });
  }
  out.push({
    id: "delivery",
    label: "Structured and concise — no rambling, no filler",
    hint: "A clear first sentence, the core in about two minutes, and no circling back.",
    weight: 1,
  });
  return out;
}

export function talkScore(criteria: readonly Criterion[], marks: Partial<Record<CriterionId, Mark>>): number {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (total === 0) return 0;
  const got = criteria.reduce((sum, c) => sum + c.weight * (marks[c.id] ?? 0), 0);
  return got / total;
}

export interface CodingOutcome {
  passed: number;
  total: number;
  hintsUsed: number;
  sawSolution: boolean;
}

export function codingScore(o: CodingOutcome): number {
  if (o.total <= 0) return 0;
  const base = Math.max(0, Math.min(1, o.passed / o.total));
  const afterHints = Math.max(0, base - Math.min(0.15, 0.05 * o.hintsUsed));
  return o.sawSolution ? Math.min(0.3, afterHints) : afterHints;
}

export type Verdict = "strong-hire" | "hire" | "lean-no" | "no-hire";

export const VERDICT_LABEL: Record<Verdict, string> = {
  "strong-hire": "Strong hire",
  hire: "Hire",
  "lean-no": "Lean no",
  "no-hire": "No hire",
};

export function verdictFor(score: number): Verdict {
  if (score >= 0.8) return "strong-hire";
  if (score >= 0.65) return "hire";
  if (score >= 0.45) return "lean-no";
  return "no-hire";
}

export interface StageResult {
  stage: StageId;
  competency: Competency;
  core: boolean;
  scores: number[];
}

export function stageScore(r: StageResult): number {
  return r.scores.length ? r.scores.reduce((a, b) => a + b, 0) / r.scores.length : 0;
}

export type LevelCall = "above" | "at" | "below";

export interface LoopDecision {
  verdict: Verdict;
  score: number;
  level: LevelCall;
  headline: string;
  reasons: string[];
}

const LEVEL_WORD: Record<Seniority, string> = { junior: "junior", mid: "mid-level", senior: "senior" };
const BELOW: Record<Seniority, Seniority | null> = { junior: null, mid: "junior", senior: "mid" };
const ABOVE: Record<Seniority, Seniority | null> = { junior: "mid", mid: "senior", senior: null };

export function decideLoop(
  results: readonly StageResult[],
  config: LoopConfig,
  stageTitle: (s: StageId) => string
): LoopDecision {
  const reasons: string[] = [];
  const scored = results.filter((r) => r.scores.length > 0);
  if (!scored.length) {
    return { verdict: "no-hire", score: 0, level: "at", headline: "No rounds were completed.", reasons };
  }

  const weighted = scored.reduce(
    (acc, r) => {
      const w = r.core ? 2 : 1;
      return { sum: acc.sum + stageScore(r) * w, weight: acc.weight + w };
    },
    { sum: 0, weight: 0 }
  );
  const score = weighted.sum / weighted.weight;

  const sunk = scored.filter((r) => r.core && verdictFor(stageScore(r)) === "no-hire");
  const leanNos = scored.filter((r) => verdictFor(stageScore(r)) === "lean-no");

  const vetoed = scored.filter(
    (r) => styleOf(config.style)?.veto?.includes(r.stage) && verdictFor(stageScore(r)) === "lean-no"
  );

  let verdict: Verdict;
  if (vetoed.length && !sunk.length) {
    verdict = "no-hire";
    reasons.push(
      `A lean-no in ${vetoed.map((r) => stageTitle(r.stage)).join(" and ")} — the round a Bar Raiser owns — is a veto, not a vote to be outweighed.`
    );
  } else if (sunk.length) {
    verdict = "no-hire";
    reasons.push(
      `A no-hire in ${sunk.map((r) => stageTitle(r.stage)).join(" and ")} — a core round — is rarely overruled in the debrief, whatever the other rounds say.`
    );
  } else if (leanNos.length >= 2) {
    verdict = "lean-no";
    reasons.push(
      `Two or more lean-nos (${leanNos.map((r) => stageTitle(r.stage)).join(", ")}) read as a no unless someone in the room fights for you.`
    );
  } else {
    verdict = verdictFor(score);
  }

  let level: LevelCall = "at";
  const design = scored.find((r) => r.stage === "design");
  if (verdict === "hire" || verdict === "strong-hire") {
    if (config.seniority !== "junior" && design && stageScore(design) < 0.65 && BELOW[config.seniority]) {
      level = "below";
      reasons.push(
        `The design round came in under the bar for ${LEVEL_WORD[config.seniority]}. Committees often answer that with an offer at ${LEVEL_WORD[BELOW[config.seniority]!]} rather than a no.`
      );
    } else if (
      ABOVE[config.seniority] &&
      scored.every((r) => verdictFor(stageScore(r)) === "strong-hire") &&
      (config.seniority === "junior" || (design && stageScore(design) >= 0.8))
    ) {
      level = "above";
      reasons.push(
        `Every round was a strong hire. That is the evidence for asking to be levelled at ${LEVEL_WORD[ABOVE[config.seniority]!]} — see R12·LV.`
      );
    }
  }

  const strongest = [...scored].sort((a, b) => stageScore(b) - stageScore(a))[0];
  const weakest = [...scored].sort((a, b) => stageScore(a) - stageScore(b))[0];
  if (strongest && weakest && strongest !== weakest) {
    reasons.push(
      `Strongest round: ${stageTitle(strongest.stage)} (${Math.round(stageScore(strongest) * 100)}%). Weakest: ${stageTitle(weakest.stage)} (${Math.round(stageScore(weakest) * 100)}%).`
    );
  }

  const headline =
    level === "below"
      ? `${VERDICT_LABEL[verdict]}, at ${LEVEL_WORD[BELOW[config.seniority]!]}`
      : level === "above"
        ? `${VERDICT_LABEL[verdict]}, and a case for ${LEVEL_WORD[ABOVE[config.seniority]!]}`
        : VERDICT_LABEL[verdict];

  return { verdict, score, level, headline, reasons };
}

export function competencyProfile(results: readonly StageResult[]): Partial<Record<Competency, number>> {
  const acc: Partial<Record<Competency, { sum: number; n: number }>> = {};
  for (const r of results) {
    for (const s of r.scores) {
      const a = (acc[r.competency] ||= { sum: 0, n: 0 });
      a.sum += s;
      a.n += 1;
    }
  }
  const out: Partial<Record<Competency, number>> = {};
  for (const [k, v] of Object.entries(acc)) {
    if (v && v.n) out[k as Competency] = v.sum / v.n;
  }
  return out;
}
