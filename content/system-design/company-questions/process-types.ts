import type { Evidence, ReportSource } from "./types";
import type { RoundType } from "./rounds";

export interface Round {
  name: string;
  type: RoundType;
  duration?: string;
  format: string;
  tested: string[];
  variesBy?: string;
  grade: Evidence;
  sources: ReportSource[];
}

export interface CompanyProcess {
  company: string;
  summary: string;
  typicalWeeks?: string;
  rounds: Round[];
  gaps?: string;
}

export interface ReportedPrompt {
  company: string;
  kind: "coding" | "lld" | "hld" | "sql" | "cs" | "domain";
  title: string;
  level: string;
  grade: Evidence;
  note?: string;
  difficulty?: string;
  sources: ReportSource[];
}
