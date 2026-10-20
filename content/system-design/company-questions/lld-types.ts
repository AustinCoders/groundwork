import type { CompanyId, Evidence, ReportSource } from "./types";

export type LldRound = "machine-coding" | "lld";

export type LldTopicId = "booking" | "storage" | "payments" | "games" | "scheduling" | "infra" | "matching";

export interface LldAnswer {
  ask: string;
  entities: string;
  design: string;
  extend: string[];
  slips: string;
}

export interface LldCheck {
  name: string;
  expr: string;
  expected: unknown;
}

export interface LldQuestion {
  id: string;
  company: CompanyId;
  title: string;
  prompt: string;
  level: string;
  round: LldRound;
  topic: LldTopicId;
  patterns: string[];
  evidence: Evidence;
  sources: ReportSource[];
  chapters: string[];
  answer: LldAnswer;
  code: string;
  checks: LldCheck[];
}
