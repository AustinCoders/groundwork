export type Role = "frontend" | "fullstack" | "backend";
export type Seniority = "junior" | "mid" | "senior";
export type CompanyType = "service" | "product" | "saas" | "agency";
export type Intensity = "quick" | "standard" | "full";

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
  code: string;
  title: string;
  kind: StageKind;
  competency: Competency;
  who: string;
  decides: string;
  failMode: string;
  available: number;
}

export interface LadderRung {
  level: Seniority;
  label: string;
  bar: string;
  script: string;
  why: string;
}

export interface TalkItem {
  id: string;
  kind: "talk";
  stage: StageId;
  origin: string;
  originTitle: string;
  level: Seniority | "any";
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

export interface CodingItem {
  id: string;
  kind: "coding";
  stage: "coding" | "machine";
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  exercise: "function" | "component";
  tests: number;
  topic: string;
  href: string;
}

export type MockItem = TalkItem | CodingItem;

export type StyleId = "amazon" | "big" | "startup" | "service";

export interface LoopConfig {
  role: Role;
  seniority: Seniority;
  company: CompanyType;
  intensity: Intensity;
  style?: StyleId | null;
}

export interface PlannedStage {
  stage: StageId;
  questions: number;
  minutes: number;
  core: boolean;
  reason: string;
}
