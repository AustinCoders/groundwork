import type { CheckQuestion, DesignPool, DesignQuestion } from "@/content/quiz-types";
import {
  answerProblems,
  htmlProblems,
  idProblems,
  sectionProblems,
  shapeProblems,
  type ChapterFacts,
} from "@/lib/quiz";

export const DESIGN_SKILLS = [
  { id: "concept", label: "Concept" },
  { id: "tradeoff", label: "Trade-off" },
  { id: "diagnose", label: "Diagnose a failure" },
  { id: "estimate", label: "Estimate" },
  { id: "sequence", label: "Sequence" },
] as const;

export type DesignSkillId = (typeof DESIGN_SKILLS)[number]["id"];

export const DESIGN_POOL_SIZE = { min: 5, max: 8 } as const;

const LEVEL_IDS: readonly string[] = ["beginner", "intermediate", "advanced"];

export function isDesignSkill(value: string): value is DesignSkillId {
  return DESIGN_SKILLS.some((skill) => skill.id === value);
}

export function designVocabularyProblems(question: DesignQuestion): string[] {
  const problems: string[] = [];
  if (!isDesignSkill(question.skill)) problems.push(`${question.id}: "${question.skill}" is not a design skill`);
  if (!LEVEL_IDS.includes(question.level)) problems.push(`${question.id}: "${question.level}" is not a level`);
  if ("pattern" in question) problems.push(`${question.id}: a design question has no DSA pattern`);
  if ("placement" in question) problems.push(`${question.id}: a design question is not a placement question`);
  const kind: string = question.kind;
  if (kind !== "single" && kind !== "multi" && kind !== "order")
    problems.push(`${question.id}: a design question is single, multi or order`);
  return problems;
}

export function designChapterProblems(pool: DesignPool, facts: ChapterFacts | null, poolId: string): string[] {
  if (!facts) return [`${poolId}: no chapter has that id`];
  const problems: string[] = [];
  for (const question of pool.questions) {
    if (question.chapter !== facts.id)
      problems.push(`${question.id}: chapter is "${question.chapter}", not "${facts.id}"`);
    if (!facts.levels.includes(question.level))
      problems.push(`${question.id}: level "${question.level}" is not one of the chapter's levels`);
  }
  return problems;
}

export function designSizeProblems(questions: readonly DesignQuestion[]): string[] {
  const problems: string[] = [];
  const { min, max } = DESIGN_POOL_SIZE;
  if (questions.length < min) problems.push(`only ${questions.length} questions; need ${min}`);
  if (questions.length > max) problems.push(`${questions.length} questions; at most ${max}`);
  const skills = new Set(questions.map((question) => question.skill));
  if (skills.size < 3) problems.push(`only ${skills.size} kinds of skill; need 3`);
  if (!skills.has("tradeoff") && !skills.has("diagnose")) problems.push("no trade-off or diagnose question");
  if (!questions.some((question) => question.kind === "single")) problems.push("no single-choice question");
  return problems;
}

export function designPromptProblems(question: CheckQuestion): string[] {
  const problems: string[] = [];
  if (question.prompt.trim().length < 40) problems.push(`${question.id}: the prompt is too short to be a scenario`);
  if (question.kind === "single" || question.kind === "multi") {
    for (const choice of question.choices) {
      if (choice.why.trim().length < 30)
        problems.push(`${question.id}: choice "${choice.id}" has a one-line explanation`);
    }
  }
  if (question.kind === "order" && question.why.trim().length < 40)
    problems.push(`${question.id}: the order explanation is too short`);
  return problems;
}

export function designPoolProblems(pool: DesignPool, facts: ChapterFacts | null, poolId: string): string[] {
  const sections = facts?.sections ?? [];
  return [
    ...designChapterProblems(pool, facts, poolId),
    ...idProblems(pool.questions),
    ...pool.questions.flatMap((question) => [
      ...designVocabularyProblems(question),
      ...sectionProblems(question, sections),
      ...shapeProblems(question),
      ...answerProblems(question),
      ...htmlProblems(question),
      ...designPromptProblems(question),
    ]),
    ...designSizeProblems(pool.questions),
  ];
}

export function answerBalanceProblems(questions: readonly CheckQuestion[]): string[] {
  const singles = questions.filter((question) => question.kind === "single");
  if (singles.length < 12) return [];
  const problems: string[] = [];
  const perLetter = new Map<string, number>();
  let longest = 0;
  for (const question of singles) {
    perLetter.set(question.answer, (perLetter.get(question.answer) ?? 0) + 1);
    const right = question.choices.find((choice) => choice.id === question.answer);
    if (right && question.choices.every((choice) => choice.text.length <= right.text.length)) longest += 1;
  }
  for (const [letter, count] of perLetter) {
    if (count / singles.length > 0.35) problems.push(`answer "${letter}" is right ${count} times of ${singles.length}`);
  }
  if (longest / singles.length > 0.4)
    problems.push(`the right answer is the longest choice in ${longest} of ${singles.length} questions`);
  return problems;
}
