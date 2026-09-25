import { STAGE_RULES } from "@/lib/mock/loops";
import type { HistoryEntry } from "@/lib/mock/storage";
import type { Competency, StageId } from "@/lib/mock/types";

const DAY = 86_400_000;
const HALF_LIFE_DAYS = 14;

export type Band = "not-yet" | "getting-there" | "ready" | "strong";

export const BAND_LABEL: Record<Band, string> = {
  "not-yet": "Not yet",
  "getting-there": "Getting there",
  ready: "Interview-ready",
  strong: "Strong",
};

export function bandFor(score: number): Band {
  if (score >= 0.8) return "strong";
  if (score >= 0.65) return "ready";
  if (score >= 0.45) return "getting-there";
  return "not-yet";
}

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export interface CompetencyReadiness {
  competency: Competency;
  score: number;
  samples: number;
}

export interface Readiness {
  score: number;
  band: Band;
  competencies: CompetencyReadiness[];
}

export function readiness(history: readonly HistoryEntry[], now: number): Readiness | null {
  const sums = new Map<Competency, { weighted: number; weight: number; samples: number }>();
  for (const h of history) {
    const weight = 0.5 ** (Math.max(0, now - h.finishedAt) / DAY / HALF_LIFE_DAYS);
    for (const s of h.stages) {
      if (!s.scores.length) continue;
      const c = STAGE_RULES[s.stage].competency;
      const acc = sums.get(c) ?? { weighted: 0, weight: 0, samples: 0 };
      acc.weighted += mean(s.scores) * weight * s.scores.length;
      acc.weight += weight * s.scores.length;
      acc.samples += s.scores.length;
      sums.set(c, acc);
    }
  }
  if (!sums.size) return null;
  const competencies = [...sums.entries()]
    .map(([competency, a]) => ({ competency, score: a.weight ? a.weighted / a.weight : 0, samples: a.samples }))
    .sort((a, b) => a.score - b.score);
  const score = mean(competencies.map((c) => c.score));
  return { score, band: bandFor(score), competencies };
}

export interface TrendPoint {
  at: number;
  score: number;
}

export function trends(history: readonly HistoryEntry[], last = 12): Partial<Record<Competency, TrendPoint[]>> {
  const out: Partial<Record<Competency, TrendPoint[]>> = {};
  for (const h of [...history].sort((a, b) => a.finishedAt - b.finishedAt)) {
    const byCompetency = new Map<Competency, number[]>();
    for (const s of h.stages) {
      const c = STAGE_RULES[s.stage].competency;
      byCompetency.set(c, [...(byCompetency.get(c) ?? []), ...s.scores]);
    }
    for (const [c, scores] of byCompetency) {
      if (!scores.length) continue;
      (out[c] ??= []).push({ at: h.finishedAt, score: mean(scores) });
    }
  }
  for (const c of Object.keys(out) as Competency[]) out[c] = out[c]!.slice(-last);
  return out;
}

export interface Heatmap {
  sessions: { id: string; at: number }[];
  rows: { stage: StageId; cells: (number | null)[] }[];
}

export function heatmap(history: readonly HistoryEntry[], last = 10): Heatmap {
  const sessions = [...history].sort((a, b) => a.finishedAt - b.finishedAt).slice(-last);
  const stages: StageId[] = [];
  for (const h of sessions)
    for (const s of h.stages) if (s.scores.length && !stages.includes(s.stage)) stages.push(s.stage);
  return {
    sessions: sessions.map((h) => ({ id: h.id, at: h.finishedAt })),
    rows: stages.map((stage) => ({
      stage,
      cells: sessions.map((h) => {
        const s = h.stages.find((x) => x.stage === stage && x.scores.length);
        return s ? mean(s.scores) : null;
      }),
    })),
  };
}

function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface Streak {
  current: number;
  best: number;
  lastFortnight: boolean[];
}

export function streak(history: readonly HistoryEntry[], now: number): Streak {
  const days = new Set(history.map((h) => dayKey(h.finishedAt)));
  const run = (from: number) => {
    let n = 0;
    for (let t = from; days.has(dayKey(t)); t -= DAY) n++;
    return n;
  };
  const current = days.has(dayKey(now)) ? run(now) : run(now - DAY);
  let best = 0;
  for (const h of history) best = Math.max(best, run(h.finishedAt));
  const lastFortnight = Array.from({ length: 14 }, (_, i) => days.has(dayKey(now - (13 - i) * DAY)));
  return { current, best, lastFortnight };
}

export interface NextUp {
  stage: StageId;
  reason: string;
}

export function nextUp(history: readonly HistoryEntry[], now: number, available: readonly StageId[]): NextUp | null {
  const ready = readiness(history, now);
  const tried = new Set(history.flatMap((h) => h.stages.filter((s) => s.scores.length).map((s) => s.stage)));
  if (ready) {
    const weakest = ready.competencies[0];
    if (weakest.score < 0.8) {
      const stageScores = available
        .filter((s) => STAGE_RULES[s].competency === weakest.competency)
        .map((stage) => {
          const scores = history.flatMap((h) => h.stages.filter((s) => s.stage === stage).flatMap((s) => s.scores));
          return { stage, score: scores.length ? mean(scores) : -1 };
        })
        .sort((a, b) => a.score - b.score);
      const pick = stageScores.find((s) => s.score >= 0) ?? stageScores[0];
      if (pick)
        return {
          stage: pick.stage,
          reason: `It is your weakest area at ${Math.round(weakest.score * 100)}%, and the one a committee would notice first.`,
        };
    }
  }
  const untried = available.find(
    (s) => !tried.has(s) && (STAGE_RULES[s].competency === "design" || STAGE_RULES[s].kind === "coding")
  );
  if (untried)
    return { stage: untried, reason: "You have not been through this round yet, and it decides a lot of loops." };
  return null;
}
