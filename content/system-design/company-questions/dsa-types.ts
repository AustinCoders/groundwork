import type { CompanyId, Evidence, ReportSource } from "./types";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type PatternId =
  | "window"
  | "pointers"
  | "hash"
  | "heap"
  | "graph"
  | "dp"
  | "search"
  | "stack"
  | "intervals"
  | "tree"
  | "list"
  | "design"
  | "union"
  | "greedy"
  | "backtrack"
  | "sort";

export interface DsaCase {
  args: unknown[];
  expected: unknown;
}

export interface DsaAnswer {
  ask: string;
  brute: string;
  insight: string;
  walkthrough: string;
  edges: string;
  followups: string[];
  slips: string;
}

export interface DsaTrace {
  caption: string;
  head: string[];
  rows: string[][];
}

export interface DsaComplexity {
  time: string;
  space: string;
  brute: string;
}

export interface DsaSolution {
  entry: string;
  code: string;
  cases: DsaCase[];
}

export interface DsaQuestion {
  id: string;
  company: CompanyId;
  title: string;
  prompt: string;
  level: string;
  difficulty: Difficulty;
  pattern: string;
  patternId: PatternId;
  leetcode?: { number: number; slug: string };
  evidence: Evidence;
  sources: ReportSource[];
  chapters: string[];
  answer: DsaAnswer;
  trace: DsaTrace;
  complexity: DsaComplexity;
  solution: DsaSolution;
}
