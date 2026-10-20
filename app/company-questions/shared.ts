export const HUB_PATH = "/company-questions";

export const questionPath = (id: string) => `${HUB_PATH}/design/${id}`;

export const codingPath = (id: string) => `${HUB_PATH}/coding/${id}`;

export const lldPath = (id: string) => `${HUB_PATH}/lld/${id}`;

export const csPath = (id: string) => `${HUB_PATH}/cs/${id}`;

export type Kind = "design" | "coding" | "lld" | "cs";

export type EvidenceKey = "several" | "one" | "guide";

export const EVIDENCE_COPY: Record<EvidenceKey, { label: string; short: string; hint: string }> = {
  several: {
    label: "Reported in several places",
    short: "Several reports",
    hint: "Two or more independent public pages, at least one a candidate write-up.",
  },
  one: {
    label: "Reported once",
    short: "One report",
    hint: "One candidate write-up. Treat it as a single data point.",
  },
  guide: {
    label: "Listed in prep guides",
    short: "Prep guides",
    hint: "Prep guides list it as a common prompt; no candidate write-up was found.",
  },
};

export const CODING_EVIDENCE_COPY: Record<EvidenceKey, { label: string; short: string; hint: string }> = {
  several: EVIDENCE_COPY.several,
  one: EVIDENCE_COPY.one,
  guide: {
    label: "Appears on company lists",
    short: "Company lists",
    hint: "Company-tagged lists or prep guides name it; no candidate write-up was found.",
  },
};

export const evidenceCopy = (kind: Kind, key: EvidenceKey) =>
  (kind === "coding" ? CODING_EVIDENCE_COPY : EVIDENCE_COPY)[key];

export const SOURCE_KIND_LABEL = {
  "candidate-report": "Candidate write-up",
  "prep-guide": "Prep guide",
  "company-list": "Company-tagged list",
  official: "Official",
} as const;

export const EVIDENCE_ORDER: readonly EvidenceKey[] = ["several", "one", "guide"];

export interface HubItem {
  kind: Kind;
  id: string;
  href: string;
  company: string;
  companyName: string;
  group: string;
  accent: string;
  title: string;
  prompt: string;
  level: string;
  evidence: EvidenceKey;
  topic: string;
  topicName: string;
  difficulty?: string;
  time?: string;
  space?: string;
  leetcode?: number;
  exercise?: string;
  search: string;
}

export interface HubCompany {
  id: string;
  name: string;
  group: string;
  accent: string;
}

export interface HubTopic {
  id: string;
  kind: Kind;
  name: string;
  blurb: string;
  count: number;
}

export interface Phase {
  id: string;
  label: string;
  minutes: number;
}

export const LLD_PHASES: readonly Phase[] = [
  { id: "ask", label: "Clarify", minutes: 5 },
  { id: "entities", label: "Entities", minutes: 8 },
  { id: "design", label: "Design", minutes: 12 },
  { id: "code", label: "Code", minutes: 30 },
  { id: "extend", label: "Extend", minutes: 5 },
];

export const DESIGN_PHASES: readonly Phase[] = [
  { id: "ask", label: "Ask", minutes: 5 },
  { id: "numbers", label: "Numbers", minutes: 5 },
  { id: "design", label: "Design", minutes: 20 },
  { id: "tradeoffs", label: "Trade-offs", minutes: 8 },
  { id: "followups", label: "Follow-ups", minutes: 7 },
];

export const CODING_PHASES: readonly Phase[] = [
  { id: "ask", label: "Clarify", minutes: 3 },
  { id: "brute", label: "Brute force", minutes: 4 },
  { id: "insight", label: "Insight", minutes: 6 },
  { id: "code", label: "Code", minutes: 12 },
  { id: "edges", label: "Test", minutes: 5 },
];

export const withArticle = (name: string) =>
  `${["a", "e", "i", "o", "u"].includes(name.charAt(0).toLowerCase()) ? "an" : "a"} ${name}`;
