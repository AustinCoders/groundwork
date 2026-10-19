export const HUB_PATH = "/system-design/company-questions";

export const questionPath = (id: string) => `${HUB_PATH}/${id}`;

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

export const EVIDENCE_ORDER: readonly EvidenceKey[] = ["several", "one", "guide"];

export interface HubQuestion {
  id: string;
  company: string;
  companyName: string;
  group: string;
  accent: string;
  title: string;
  prompt: string;
  level: string;
  evidence: EvidenceKey;
  theme: string;
  themeName: string;
  sources: number;
  chapters: number;
  search: string;
}

export interface HubCompany {
  id: string;
  name: string;
  group: string;
  accent: string;
  count: number;
  ids: string[];
}

export interface HubTheme {
  id: string;
  name: string;
  blurb: string;
  count: number;
}

export const PACING = [
  { id: "ask", label: "Ask", minutes: 5 },
  { id: "numbers", label: "Numbers", minutes: 5 },
  { id: "design", label: "Design", minutes: 20 },
  { id: "tradeoffs", label: "Trade-offs", minutes: 8 },
  { id: "followups", label: "Follow-ups", minutes: 7 },
] as const;

export const ROUND_MINUTES = PACING.reduce((sum, phase) => sum + phase.minutes, 0);
