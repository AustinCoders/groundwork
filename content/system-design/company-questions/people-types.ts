import type { CompanyId, Evidence, ReportSource } from "./types";

export interface PeopleValue {
  name: string;
  line: string;
}

export interface PeopleQuestion {
  id: string;
  q: string;
  why: string;
  frame: string;
  book?: { round: string; qid: string };
  grade: Evidence;
  sources: ReportSource[];
}

export interface PeopleSet {
  company: CompanyId;
  valuesSource?: ReportSource;
  values: PeopleValue[];
  themes: string[];
  questions: PeopleQuestion[];
  offer: string[];
  gaps?: string;
}
