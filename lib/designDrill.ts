import type { DesignDrill, DrillItem } from "@/content/drill-types";
import { htmlProblem, type ChapterFacts } from "@/lib/quiz";

export const DRILL_SIZE = {
  checklist: { min: 6, max: 9 },
  mistakes: { min: 3, max: 5 },
} as const;

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LEVEL_IDS: readonly string[] = ["beginner", "intermediate", "advanced"];

const drills = new Map<string, () => Promise<{ drill: DesignDrill }>>([
  ["sysdes-walkthrough-simple", () => import("@/content/system-design/drills/sysdes-walkthrough-simple")],
  ["sysdes-walkthrough-medium", () => import("@/content/system-design/drills/sysdes-walkthrough-medium")],
  ["sysdes-walkthrough-kv-store", () => import("@/content/system-design/drills/sysdes-walkthrough-kv-store")],
  ["sysdes-walkthrough-notifications", () => import("@/content/system-design/drills/sysdes-walkthrough-notifications")],
  ["sysdes-walkthrough-crawler", () => import("@/content/system-design/drills/sysdes-walkthrough-crawler")],
  ["sysdes-walkthrough-payments", () => import("@/content/system-design/drills/sysdes-walkthrough-payments")],
]);

export function drillChapterIds(): string[] {
  return [...drills.keys()];
}

export async function loadDrill(chapterId: string): Promise<DesignDrill | null> {
  const load = drills.get(chapterId);
  return load ? (await load()).drill : null;
}

function itemProblems(drillId: string, kind: string, items: readonly DrillItem[], sections: string[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (!KEBAB.test(item.id)) problems.push(`${item.id}: ids are kebab-case`);
    if (!item.id.startsWith(`${kind}-`)) problems.push(`${item.id}: a ${kind} id starts with "${kind}-"`);
    if (seen.has(item.id)) problems.push(`${item.id}: repeats inside ${drillId}`);
    seen.add(item.id);
    if (item.text.trim().length < 30) problems.push(`${item.id}: the text is too short to check against`);
    const html = htmlProblem(item.text);
    if (html) problems.push(`${item.id}: ${html}`);
    if (!sections.includes(item.section))
      problems.push(`${item.id}: section "${item.section}" is not a heading of the chapter`);
  }
  return problems;
}

export function drillProblems(drill: DesignDrill, facts: ChapterFacts | null, drillId: string): string[] {
  if (!facts) return [`${drillId}: no chapter has that id`];
  const problems: string[] = [];
  if (drill.chapter !== facts.id) problems.push(`${drillId}: chapter is "${drill.chapter}", not "${facts.id}"`);
  if (!LEVEL_IDS.includes(drill.level) || !facts.levels.includes(drill.level))
    problems.push(`${drillId}: level "${drill.level}" is not one of the chapter's levels`);
  if (drill.title.trim().length < 8) problems.push(`${drillId}: the title is too short`);
  if (drill.prompt.trim().length < 120) problems.push(`${drillId}: the prompt is too short to be a scenario`);
  const prompt = htmlProblem(drill.prompt);
  if (prompt) problems.push(`${drillId}: ${prompt} in the prompt`);
  const { checklist, mistakes } = DRILL_SIZE;
  if (drill.checklist.length < checklist.min || drill.checklist.length > checklist.max)
    problems.push(`${drillId}: ${drill.checklist.length} checklist items; need ${checklist.min} to ${checklist.max}`);
  if (drill.mistakes.length < mistakes.min || drill.mistakes.length > mistakes.max)
    problems.push(`${drillId}: ${drill.mistakes.length} mistakes; need ${mistakes.min} to ${mistakes.max}`);
  problems.push(
    ...itemProblems(drillId, "check", drill.checklist, facts.sections),
    ...itemProblems(drillId, "mistake", drill.mistakes, facts.sections)
  );
  const taught = new Set(drill.checklist.map((item) => item.section));
  if (taught.size < 4) problems.push(`${drillId}: the checklist draws on only ${taught.size} headings; need 4`);
  const texts = [...drill.checklist, ...drill.mistakes].map((item) => item.text);
  if (new Set(texts).size !== texts.length) problems.push(`${drillId}: two items share the same text`);
  return problems;
}
