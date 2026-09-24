/**
 * The mock interview's vocabulary. Nothing in here imports content, so every
 * type can cross into the browser; lib/mock/bank.ts is the server-only side
 * that fills them in.
 */

export type Role = "frontend" | "fullstack" | "backend";
export type Seniority = "junior" | "mid" | "senior";
export type CompanyType = "service" | "product" | "saas" | "agency";
export type Intensity = "quick" | "standard" | "full";

/** "talk" rounds are answered out loud and scored against a rubric; "coding"
 *  rounds run real exercises and are scored by their tests. */
export type StageKind = "talk" | "coding";

export type Competency = "coding" | "javascript" | "frontend" | "backend" | "design" | "behaviour" | "negotiation";

export type StageId =
  | "screening"
  | "phone"
  | "coding"
  | "machine"
  | "javascript"
  | "react"
  | "backend"
  | "design"
  | "infra"
  | "resume"
  | "behaviour"
  | "hr";

export interface StageInfo {
  id: StageId;
  /** The interview book's own code for the round, where it has one. */
  code: string;
  title: string;
  kind: StageKind;
  competency: Competency;
  /** Who sits across the table, what the round decides and how it is usually
   *  lost — taken from the book's round header. */
  who: string;
  decides: string;
  failMode: string;
  /** How many questions the bank holds for this stage, for the setup screen. */
  available: number;
}

export interface LadderRung {
  level: Seniority;
  label: string;
  bar: string;
  script: string;
  why: string;
}

/** A question you answer out loud. Every field but the prompt is optional
 *  because the sources differ: the book has what they are really testing and
 *  the trap, the chapter banks only have an answer. */
export interface TalkItem {
  id: string;
  kind: "talk";
  stage: StageId;
  /** The book round or bank this came from, e.g. "r3" or "js-bank". */
  origin: string;
  originTitle: string;
  level: Seniority | "any";
  /** For deciding which stages a senior-only or big-company-only question
   *  belongs to. Empty means everywhere. */
  onlyFor?: { seniority?: Seniority[]; company?: CompanyType[] };
  prompt: string;
  testing?: string;
  answer?: string;
  say?: string;
  trap?: string;
  note?: string;
  followUps: string[];
  ladder?: LadderRung[];
  href: string;
}

/** A question you solve in the editor, graded by its test suite. */
export interface CodingItem {
  id: string;
  kind: "coding";
  stage: "coding" | "machine";
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  exercise: "function" | "component";
  tests: number;
  /** The topic whose chapter the exercise belongs to, for choosing DSA over
   *  JavaScript or the other way round depending on the role. */
  topic: string;
  href: string;
}

export type MockItem = TalkItem | CodingItem;

/** A company's loop as the interview book describes it, rather than one built
 *  from a company type. Absent means the reader is building their own. */
export type StyleId = "amazon" | "big" | "startup" | "service";

export interface LoopConfig {
  role: Role;
  seniority: Seniority;
  company: CompanyType;
  intensity: Intensity;
  style?: StyleId | null;
}

/** One stage of a planned loop, before any questions are chosen. */
export interface PlannedStage {
  stage: StageId;
  questions: number;
  /** Suggested wall-clock time for the whole stage. */
  minutes: number;
  /** A "no hire" here sinks the loop, the way it does in a real debrief. */
  core: boolean;
  /** Why this stage is in this loop, for the preview. */
  reason: string;
}
