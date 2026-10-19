export type CompanyGroup = "global" | "india";

export type CompanyId =
  | "google"
  | "microsoft"
  | "apple"
  | "meta"
  | "amazon"
  | "netflix"
  | "uber"
  | "atlassian"
  | "razorpay"
  | "flipkart"
  | "swiggy"
  | "phonepe";

export type CompanyAccent = "blue" | "purple" | "orange" | "teal" | "grey" | "yellow";

export interface Company {
  id: CompanyId;
  name: string;
  group: CompanyGroup;
  accent: CompanyAccent;
}

export type SourceKind = "candidate-report" | "prep-guide" | "company-list" | "official";

export interface ReportSource {
  label: string;
  url: string;
  kind: SourceKind;
  year?: number;
}

export type Evidence = "several" | "one" | "guide";

export interface QuestionAnswer {
  ask: string;
  numbers: string;
  design: string;
  tradeoffs: string;
  followups: string[];
  slips: string;
}

export interface CompanyQuestion {
  id: string;
  company: CompanyId;
  title: string;
  prompt: string;
  level: string;
  kind: "hld" | "lld";
  evidence: Evidence;
  sources: ReportSource[];
  chapters: string[];
  answer: QuestionAnswer;
}
