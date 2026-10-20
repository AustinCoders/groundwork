import type { CompanyId, Evidence, ReportSource } from "./types";

export type CsTopicId = "os" | "dbms" | "networks" | "sql" | "oop";

export type CsLevel = "Core" | "Deep";

export interface CsTable {
  head: string[];
  rows: string[][];
}

export interface CsQuestion {
  id: string;
  theme: string;
  q: string;
  a: string;
  level: CsLevel;
  companies: CompanyId[];
  evidence: Evidence;
  sources: ReportSource[];
  query?: string;
  result?: CsTable;
  links?: { href: string; label: string }[];
}

export interface CsTheme {
  id: string;
  name: string;
}

export interface CsSet {
  id: CsTopicId;
  title: string;
  intro: string;
  themes: CsTheme[];
  schema?: { caption: string; sql: string };
  chapters: { href: string; label: string }[];
  questions: CsQuestion[];
}
