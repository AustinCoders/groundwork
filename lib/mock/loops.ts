import type {
  CodingItem,
  CompanyType,
  Intensity,
  LoopConfig,
  MockItem,
  PlannedStage,
  Role,
  Seniority,
  StageId,
  StageKind,
  Competency,
  TalkItem,
} from "@/lib/mock/types";

/**
 * How a loop is put together. The rules follow the interview book: which
 * rounds a company type actually runs comes from the book's own tiers (see
 * STAGE_SOURCES in bank.ts, which reads them), and what a role and a level add
 * or drop is below. Nothing here touches content, so it runs in the browser.
 */

export const STAGE_ORDER: StageId[] = [
  "screening",
  "phone",
  "coding",
  "machine",
  "javascript",
  "react",
  "backend",
  "design",
  "infra",
  "resume",
  "behaviour",
  "hr",
];

interface StageRule {
  kind: StageKind;
  competency: Competency;
  /** quick loops keep only "essential"; standard adds "standard"; full adds the rest. */
  weight: "essential" | "standard" | "full";
  roles?: Role[];
  seniority?: Seniority[];
  /** Included for these seniorities whatever the company type says. */
  alwaysFor?: Seniority[];
  /** Ignore the company tiers: every company runs this round. */
  everywhere?: boolean;
  core: (c: LoopConfig) => boolean;
  reason: (c: LoopConfig) => string;
}

export const STAGE_RULES: Record<StageId, StageRule> = {
  screening: {
    kind: "talk",
    competency: "behaviour",
    weight: "standard",
    everywhere: true,
    core: () => false,
    reason: () => "Every loop opens with a recruiter checking you are real, available and affordable.",
  },
  phone: {
    kind: "talk",
    competency: "javascript",
    weight: "full",
    core: () => false,
    reason: () => "A short technical filter before the company spends an engineer's afternoon on you.",
  },
  coding: {
    kind: "coding",
    competency: "coding",
    weight: "essential",
    core: () => true,
    reason: (c) =>
      c.role === "frontend"
        ? "Real problems, graded by their tests — JavaScript first, because that is what a frontend loop asks."
        : "Real problems, graded by their tests — data structures first, because that is what this loop asks.",
  },
  machine: {
    kind: "coding",
    competency: "frontend",
    weight: "standard",
    roles: ["frontend", "fullstack"],
    core: (c) => c.role === "frontend",
    reason: () => "Build a working component against tests, the way a machine-coding round checks it.",
  },
  javascript: {
    kind: "talk",
    competency: "javascript",
    weight: "essential",
    everywhere: true,
    core: (c) => c.role !== "backend",
    reason: () => "The round that exposes knowing a framework deeply and the language shallowly.",
  },
  react: {
    kind: "talk",
    competency: "frontend",
    weight: "essential",
    everywhere: true,
    roles: ["frontend", "fullstack"],
    core: (c) => c.role === "frontend",
    reason: () => "Rendering, state and the server boundary — where frontend seniority is actually decided.",
  },
  backend: {
    kind: "talk",
    competency: "backend",
    weight: "essential",
    roles: ["backend", "fullstack"],
    alwaysFor: ["junior", "mid", "senior"],
    core: (c) => c.role === "backend",
    reason: () => "Node, NestJS and the database behind it — what the service does when nobody is watching.",
  },
  design: {
    kind: "talk",
    competency: "design",
    weight: "essential",
    seniority: ["mid", "senior"],
    alwaysFor: ["senior"],
    core: (c) => c.seniority === "senior",
    reason: (c) =>
      c.seniority === "senior"
        ? "At this level the design round sets the level you are hired at."
        : "Product companies test whether you can reason about load you have not carried yet.",
  },
  infra: {
    kind: "talk",
    competency: "backend",
    weight: "full",
    roles: ["backend", "fullstack"],
    seniority: ["mid", "senior"],
    core: () => false,
    reason: () => "Usually folded into another round: how the thing actually ships and runs.",
  },
  resume: {
    kind: "talk",
    competency: "behaviour",
    weight: "full",
    seniority: ["mid", "senior"],
    everywhere: true,
    core: () => false,
    reason: () => "Every number on your resume is a promise; this round collects on it.",
  },
  behaviour: {
    kind: "talk",
    competency: "behaviour",
    weight: "essential",
    everywhere: true,
    core: () => true,
    reason: (c) =>
      c.company === "product" || c.company === "saas"
        ? "Scored as carefully as the technical rounds, and at big companies scored differently."
        : "Whether they want to work with you for the next three years.",
  },
  hr: {
    kind: "talk",
    competency: "negotiation",
    weight: "standard",
    everywhere: true,
    core: () => false,
    reason: () => "The round that decides what is actually on the offer letter.",
  },
};

const WEIGHT_RANK = { essential: 0, standard: 1, full: 2 } as const;
const INTENSITY_RANK: Record<Intensity, number> = { quick: 0, standard: 1, full: 2 };

const TALK_PER_STAGE: Record<Intensity, number> = { quick: 2, standard: 3, full: 4 };
const CODING_PER_STAGE: Record<Intensity, number> = { quick: 1, standard: 2, full: 2 };

/** Minutes a candidate should give one question, before the interviewer moves on. */
export const MINUTES_PER_TALK: Record<Seniority, number> = { junior: 3, mid: 4, senior: 5 };
export const MINUTES_PER_CODING = { function: 15, component: 20 } as const;

/**
 * The stages a loop runs, in order. `hotFor` is which company types run each
 * stage as a standard part of the loop, read from the book's tiers.
 */
export function planLoop(config: LoopConfig, hotFor: Record<StageId, CompanyType[]>): PlannedStage[] {
  const planned: PlannedStage[] = [];

  for (const stage of STAGE_ORDER) {
    const rule = STAGE_RULES[stage];
    if (WEIGHT_RANK[rule.weight] > INTENSITY_RANK[config.intensity]) continue;
    if (rule.roles && !rule.roles.includes(config.role)) continue;
    if (rule.seniority && !rule.seniority.includes(config.seniority)) continue;

    const forced = rule.everywhere || (rule.alwaysFor?.includes(config.seniority) ?? false);
    if (!forced && !(hotFor[stage] || []).includes(config.company)) continue;

    const coding = rule.kind === "coding";
    const questions = coding
      ? stage === "machine"
        ? config.intensity === "full"
          ? 2
          : 1
        : CODING_PER_STAGE[config.intensity]
      : TALK_PER_STAGE[config.intensity];
    const perQuestion = coding
      ? MINUTES_PER_CODING[stage === "machine" ? "component" : "function"]
      : MINUTES_PER_TALK[config.seniority];

    planned.push({
      stage,
      questions,
      minutes: questions * perQuestion,
      core: rule.core(config),
      reason: rule.reason(config),
    });
  }

  // A loop with no coding at all is not a loop. An agency drops the DSA round,
  // so its machine-coding round has to carry the coding signal instead.
  const hasCoding = planned.some((p) => STAGE_RULES[p.stage].kind === "coding");
  if (!hasCoding) {
    const stage: StageId = config.role === "backend" ? "coding" : "machine";
    const insertAt = planned.findIndex((p) => STAGE_ORDER.indexOf(p.stage) > STAGE_ORDER.indexOf(stage));
    const entry: PlannedStage = {
      stage,
      questions: 1,
      minutes: MINUTES_PER_CODING[stage === "machine" ? "component" : "function"],
      core: true,
      reason: STAGE_RULES[stage].reason(config),
    };
    planned.splice(insertAt === -1 ? planned.length : insertAt, 0, entry);
  }

  return planned;
}

export function loopMinutes(stages: readonly PlannedStage[]): number {
  return stages.reduce((sum, s) => sum + s.minutes, 0);
}

/* ------------------------------------------------------------------ */
/* Choosing questions                                                   */
/* ------------------------------------------------------------------ */

export function seededRandom(seed: number): () => number {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SENIORITY_ORDER: Seniority[] = ["junior", "mid", "senior"];

function talkFit(item: TalkItem, config: LoopConfig): number {
  if (item.onlyFor?.seniority && !item.onlyFor.seniority.includes(config.seniority)) return -1;
  if (item.onlyFor?.company && !item.onlyFor.company.includes(config.company)) return -1;
  if (item.level === "any") return 2;
  const gap = Math.abs(SENIORITY_ORDER.indexOf(item.level) - SENIORITY_ORDER.indexOf(config.seniority));
  return gap === 0 ? 3 : gap === 1 ? 1 : 0;
}

const CODING_LEVELS: Record<Seniority, CodingItem["level"][]> = {
  junior: ["beginner", "intermediate"],
  mid: ["intermediate", "advanced"],
  senior: ["advanced", "intermediate"],
};

function codingFit(item: CodingItem, config: LoopConfig): number {
  const levels = CODING_LEVELS[config.seniority];
  const levelScore = item.level === levels[0] ? 3 : item.level === levels[1] ? 2 : 0;
  if (item.stage === "machine") return levelScore;
  // Data structures for anyone owning a backend; the language itself for a
  // frontend loop, where the coding round is usually JavaScript utilities.
  const preferred = config.role === "frontend" ? ["js", "react"] : ["dsa"];
  const topicScore = preferred.includes(item.topic) ? 3 : 0;
  return levelScore + topicScore;
}

/**
 * The questions for one stage: the best-fitting ones for this config, in a
 * random order among equals, never repeating one already in `exclude`.
 */
export function pickItems<T extends MockItem>(
  pool: readonly T[],
  config: LoopConfig,
  count: number,
  random: () => number,
  exclude: ReadonlySet<string> = new Set()
): T[] {
  const scored = shuffle(pool, random)
    .filter((item) => !exclude.has(item.id))
    .map((item) => ({ item, fit: item.kind === "talk" ? talkFit(item, config) : codingFit(item, config) }))
    .filter((s) => s.fit >= 0);
  scored.sort((a, b) => b.fit - a.fit);
  return scored.slice(0, Math.max(0, count)).map((s) => s.item);
}
