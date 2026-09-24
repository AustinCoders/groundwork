import type { CompanyType, StageId, StyleId } from "@/lib/mock/types";

/**
 * Loops shaped like particular kinds of company, each built from what the
 * interview book says about how that company runs its loop. A style fixes the
 * company type and then bends the plan: rounds it always runs or never does,
 * rounds that get more questions, rounds that are core, which of the book's
 * rounds to draw on first, and — for Amazon — a round that can veto the loop.
 */
export interface LoopStyle {
  id: StyleId;
  name: string;
  detail: string;
  /** Which of the book's rounds this is drawn from, for the card. */
  basedOn: string;
  company: CompanyType;
  /** Always run, whatever the length or the company tiers say (role and level
   *  rules still apply — a backend loop never gets machine coding). */
  include?: StageId[];
  exclude?: StageId[];
  /** Extra questions on top of what the length gives. */
  boost?: Partial<Record<StageId, number>>;
  /** Core as well as whatever the stage is core for anyway. */
  core?: StageId[];
  /** A lean-no here is a no: the room has someone with a veto. */
  veto?: StageId[];
  /** Book rounds to ask from first, stage by stage. */
  prefer?: Partial<Record<StageId, string[]>>;
  /** Prefer the hardest exercises in the coding round. */
  hardCoding?: boolean;
  /** How the book explains why this stage matters at this kind of company. */
  reasons?: Partial<Record<StageId, string>>;
}

export const STYLES: Record<StyleId, LoopStyle> = {
  amazon: {
    id: "amazon",
    name: "Amazon-style",
    detail: "Leadership Principles in every round, and a Bar Raiser",
    basedOn: "R11·LP",
    company: "product",
    include: ["behaviour"],
    boost: { behaviour: 2 },
    core: ["coding", "behaviour"],
    veto: ["behaviour"],
    prefer: { behaviour: ["r11lp"] },
    reasons: {
      behaviour:
        "There is no separate behavioural round: every interviewer spends part of their hour on Leadership Principles, and a Bar Raiser can veto the loop — so a lean-no here is a no.",
      coding: "Real problems graded by their tests — with a Leadership Principle question folded into the same hour.",
    },
  },
  big: {
    id: "big",
    name: "Big tech",
    detail: "harder DSA, a design bar with numbers, a level before a number",
    basedOn: "R7, S1–S4, R12·LV",
    company: "saas",
    include: ["phone", "design"],
    boost: { coding: 1 },
    core: ["coding", "design"],
    hardCoding: true,
    prefer: { javascript: ["s3"], design: ["s2", "r8"], behaviour: ["s4"], hr: ["r12lv"] },
    reasons: {
      coding: "Mid-size product and SaaS loops are decided in this round — patterns, not puzzles, but harder ones.",
      design: "Trade-offs with numbers. At the top of the band: what breaks when the system is spread across machines.",
      hr: "The level is decided before anyone talks about money, and it moves the number more than negotiation does.",
    },
  },
  startup: {
    id: "startup",
    name: "Product startup",
    detail: "machine coding decides it, then the language",
    basedOn: "R2, R3, R4",
    company: "product",
    include: ["machine"],
    exclude: ["phone", "infra"],
    boost: { machine: 1 },
    core: ["machine", "javascript"],
    reasons: {
      machine:
        "The startup loop is decided here, almost entirely: code written under pressure that looks like code from someone who has shipped.",
    },
  },
  service: {
    id: "service",
    name: "Service company",
    detail: "an online assessment, a tech round, HR",
    basedOn: "R1·OA, R1, R3, R12",
    company: "service",
    exclude: ["design", "machine", "phone", "infra", "resume"],
    core: ["coding", "javascript"],
    reasons: {
      coding: "An online assessment first — a platform and a cutoff decide whether a human ever opens your resume.",
    },
  },
};

export const STYLE_ORDER: StyleId[] = ["amazon", "big", "startup", "service"];

export function styleOf(id: StyleId | null | undefined): LoopStyle | null {
  return id ? (STYLES[id] ?? null) : null;
}
