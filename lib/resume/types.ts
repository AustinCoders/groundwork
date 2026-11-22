export interface YearMonth {
  y: number;
  m: number;
}

export type SectionId =
  | "summary"
  | "objective"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "certifications"
  | "achievements"
  | "personal"
  | "declaration"
  | "interests"
  | "languages"
  | "other";

export interface ResumeSection {
  id: SectionId;
  title: string;
  lines: string[];
}

export interface ResumeRole {
  heading: string;
  dateText: string;
  start: YearMonth | null;
  end: YearMonth | null;
  current: boolean;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  bullets: string[];
}

export interface ResumeLink {
  kind: "linkedin" | "github" | "site";
  url: string;
}

export interface ParsedResume {
  name: string;
  email: string | null;
  phone: string | null;
  links: ResumeLink[];
  sections: ResumeSection[];
  roles: ResumeRole[];
  projects: ResumeProject[];
  bullets: string[];
  skills: string[];
  words: number;
  pages: number;
  months: number | null;
  wideGaps: number;
}

export type QuestionGroup = "deep-dive" | "roles" | "projects" | "skills" | "gaps" | "people";

export interface QuestionSource {
  label: string;
  href: string;
}

export interface ResumeQuestion {
  id: string;
  group: QuestionGroup;
  q: string;
  why: string;
  followUps: string[];
  quote?: string;
  skill?: string;
  source?: QuestionSource;
}

export type FixSeverity = "high" | "medium" | "low";

export interface ResumeFix {
  id: string;
  severity: FixSeverity;
  title: string;
  detail: string;
  quotes: string[];
  suggestion?: string;
}

export interface SkillStudy {
  id: string;
  name: string;
  href: string;
  label: string;
  missing: boolean;
}

export interface ResumeAnalysis {
  version: 1;
  parsed: ParsedResume;
  questions: ResumeQuestion[];
  fixes: ResumeFix[];
  study: SkillStudy[];
  jdSkills: string[];
  missing: string[];
}

export interface CatalogueQuestion {
  q: string;
  href: string;
  source: string;
  tags: string[];
  people?: boolean;
}

export interface CatalogueTopic {
  id: string;
  name: string;
  href: string;
  written: boolean;
}

export interface Catalogue {
  questions: CatalogueQuestion[];
  topics: CatalogueTopic[];
}
