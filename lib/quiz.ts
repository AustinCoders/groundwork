import type { ChapterPool, PatternRecord, Question } from "@/content/quiz-types";
import type { LevelId } from "@/content/types";

export const PATTERNS = [
  { id: "complexity-analysis", label: "Complexity analysis" },
  { id: "js-collections", label: "JavaScript collections" },
  { id: "in-place-array", label: "In-place array tricks" },
  { id: "prefix-sum", label: "Prefix sums" },
  { id: "hash-map", label: "Hash map lookup" },
  { id: "two-pointers", label: "Two pointers" },
  { id: "sliding-window", label: "Sliding window" },
  { id: "binary-search", label: "Binary search" },
  { id: "recursion", label: "Recursion" },
  { id: "divide-and-conquer", label: "Divide and conquer" },
  { id: "sorting", label: "Sorting" },
  { id: "stack", label: "Stack" },
  { id: "queue", label: "Queue" },
  { id: "linked-list", label: "Linked list pointers" },
  { id: "fast-slow-pointers", label: "Fast and slow pointers" },
  { id: "tree-traversal", label: "Tree traversal" },
  { id: "tree-recursion", label: "Tree recursion" },
  { id: "bst", label: "Binary search tree" },
  { id: "heap", label: "Heap and top-k" },
  { id: "graph-traversal", label: "Graph traversal" },
  { id: "grid-bfs", label: "BFS on a grid" },
  { id: "topological-sort", label: "Topological sort" },
  { id: "shortest-path", label: "Shortest path" },
  { id: "minimum-spanning-tree", label: "Minimum spanning tree" },
  { id: "union-find", label: "Union-find" },
  { id: "strongly-connected", label: "Strongly connected components" },
  { id: "backtracking", label: "Backtracking" },
  { id: "dp-1d", label: "DP in one dimension" },
  { id: "dp-2d", label: "DP in two dimensions" },
  { id: "dp-state-machine", label: "DP state machine" },
  { id: "knapsack", label: "Knapsack" },
  { id: "bitmask-dp", label: "Bitmask DP" },
  { id: "greedy", label: "Greedy" },
  { id: "intervals", label: "Intervals and sweep line" },
  { id: "bit-manipulation", label: "Bit manipulation" },
  { id: "matrix", label: "Matrix traversal" },
  { id: "trie", label: "Trie" },
  { id: "monotonic-stack", label: "Monotonic stack" },
  { id: "math", label: "Number theory" },
  { id: "segment-tree", label: "Segment tree" },
  { id: "fenwick-tree", label: "Fenwick tree" },
  { id: "sparse-table", label: "Sparse table" },
  { id: "string-matching", label: "String matching" },
  { id: "design", label: "Data structure design" },
  { id: "interview-strategy", label: "Interview strategy" },
] as const;

export const SKILLS = [
  { id: "recognise", label: "Recognise" },
  { id: "complexity", label: "Complexity" },
  { id: "trace", label: "Trace" },
  { id: "edge-case", label: "Edge case" },
] as const;

export const STYLES = [
  { id: "online-assessment", label: "Online assessment" },
  { id: "phone-screen", label: "Phone screen" },
  { id: "onsite", label: "Onsite round" },
] as const;

export type PatternId = (typeof PATTERNS)[number]["id"];
export type SkillId = (typeof SKILLS)[number]["id"];
export type StyleId = (typeof STYLES)[number]["id"];

const LEVEL_IDS: readonly string[] = ["beginner", "intermediate", "advanced"];

export function isPattern(value: string): value is PatternId {
  return PATTERNS.some((pattern) => pattern.id === value);
}

export function isSkill(value: string): value is SkillId {
  return SKILLS.some((skill) => skill.id === value);
}

export function isStyle(value: string): value is StyleId {
  return STYLES.some((style) => style.id === value);
}

export interface ChapterFacts {
  id: string;
  levels: LevelId[];
  sections: string[];
}

export const POOL_MINIMUMS = { questions: 8, placement: 2, complexity: 2, other: 5, trace: 1 } as const;

const COMPANIES = [
  "Adobe",
  "Airbnb",
  "Amazon",
  "Apple",
  "Atlassian",
  "Bloomberg",
  "Dropbox",
  "Facebook",
  "Goldman",
  "Google",
  "Intuit",
  "LinkedIn",
  "Lyft",
  "Meta",
  "Microsoft",
  "Netflix",
  "Nvidia",
  "Oracle",
  "Palantir",
  "Salesforce",
  "Stripe",
  "Tesla",
  "Twitter",
  "Uber",
  "Walmart",
];

const COMPANY_NAME = new RegExp(`\\b(?:${COMPANIES.join("|")})\\b`, "g");
const FORBIDDEN_WORD = /\bverified\b/i;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VOID_ELEMENTS = new Set(["br", "hr", "img", "input", "wbr"]);
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;

const blank = (text: unknown) => typeof text !== "string" || text.trim() === "";

export function htmlProblem(html: string): string | null {
  const open: string[] = [];
  for (const match of html.matchAll(TAG)) {
    const name = match[2].toLowerCase();
    if (VOID_ELEMENTS.has(name) || match[3] === "/") continue;
    if (!match[1]) {
      open.push(name);
    } else if (open.pop() !== name) {
      return `</${name}> closes something that is not open`;
    }
  }
  if (open.length > 0) return `<${open[open.length - 1]}> is never closed`;
  if (html.replace(TAG, "").includes("<")) return "a raw < outside a tag; write &lt;";
  return null;
}

function structureProblem(question: Question): string | null {
  const loose = question as unknown as Record<string, unknown>;
  switch (loose.kind) {
    case "order":
      return Array.isArray(loose.items) ? null : "an order question has no items";
    case "multi":
      return Array.isArray(loose.choices) && Array.isArray(loose.answers)
        ? null
        : "a multi question has no choices or answers";
    case "single":
    case "predict":
      return Array.isArray(loose.choices) && typeof loose.answer === "string"
        ? null
        : `a ${String(loose.kind)} question has no choices or answer`;
    default:
      return `"${String(loose.kind)}" is not a question kind`;
  }
}

function stringsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsOf);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(stringsOf);
  return [];
}

function htmlFragments(question: Question): string[] {
  const fragments = [question.prompt];
  if (structureProblem(question)) return fragments;
  if (question.kind === "order") {
    fragments.push(question.why, ...question.items.map((item) => item.text));
  } else {
    for (const choice of question.choices) fragments.push(choice.text, choice.why);
  }
  return fragments;
}

export function htmlProblems(question: Question): string[] {
  const problems: string[] = [];
  for (const fragment of htmlFragments(question)) {
    const problem = htmlProblem(fragment);
    if (problem) problems.push(`${question.id}: ${problem} in "${fragment.slice(0, 40)}"`);
  }
  return problems;
}

export function answerProblems(question: Question): string[] {
  if (structureProblem(question) || question.kind === "order") return [];
  const ids = question.choices.map((choice) => choice.id);
  if (question.kind === "multi") {
    const problems: string[] = [];
    for (const answer of question.answers) {
      if (!ids.includes(answer)) problems.push(`${question.id}: answer "${answer}" is not a choice`);
    }
    if (new Set(question.answers).size !== question.answers.length) {
      problems.push(`${question.id}: answers repeat an id`);
    }
    if (question.answers.length < 2) problems.push(`${question.id}: a multi question needs two or more answers`);
    if (new Set(question.answers).size >= ids.length) problems.push(`${question.id}: every choice is an answer`);
    return problems;
  }
  return ids.includes(question.answer) ? [] : [`${question.id}: answer "${question.answer}" is not a choice`];
}

export function shapeProblems(question: Question): string[] {
  const problems: string[] = [];
  const say = (message: string) => problems.push(`${question.id}: ${message}`);
  const broken = structureProblem(question);
  if (broken) return [`${question.id}: ${broken}`];
  if (blank(question.prompt)) say("the prompt is empty");
  if (question.kind === "order") {
    if (question.items.length < 3 || question.items.length > 6) say("an order question needs 3 to 6 items");
    if (new Set(question.items.map((item) => item.id)).size !== question.items.length) say("item ids repeat");
    if (question.items.some((item) => blank(item.id) || blank(item.text))) say("an item has no id or text");
    if (blank(question.why)) say("the explanation is empty");
    return problems;
  }
  if (question.choices.length < 3 || question.choices.length > 5) say("a question needs 3 to 5 choices");
  if (new Set(question.choices.map((choice) => choice.id)).size !== question.choices.length) say("choice ids repeat");
  for (const choice of question.choices) {
    if (blank(choice.id) || blank(choice.text)) say("a choice has no id or text");
    if (blank(choice.why)) say(`choice "${choice.id}" has no explanation`);
  }
  if (question.kind === "predict") {
    if (blank(question.tracer)) say("a predict question names no tracer");
    if (!Number.isInteger(question.step) || question.step < 0) say("a predict question needs a step index");
  }
  return problems;
}

export function vocabularyProblems(question: Question): string[] {
  const problems: string[] = [];
  if (!isPattern(question.pattern))
    problems.push(`${question.id}: "${question.pattern}" is not in the pattern vocabulary`);
  if (!isSkill(question.skill)) problems.push(`${question.id}: "${question.skill}" is not a known skill`);
  if (!LEVEL_IDS.includes(question.level)) problems.push(`${question.id}: "${question.level}" is not a level`);
  return problems;
}

export function sectionProblems(question: Question, sections: string[]): string[] {
  return sections.includes(question.section)
    ? []
    : [`${question.id}: section "${question.section}" is not a heading of the chapter`];
}

export function chapterProblems(pool: ChapterPool, facts: ChapterFacts | null, poolId: string): string[] {
  if (!facts) return [`${poolId}: no chapter has that id`];
  const problems: string[] = [];
  for (const question of pool.questions) {
    if (question.chapter !== facts.id)
      problems.push(`${question.id}: chapter is "${question.chapter}", not "${facts.id}"`);
    if (!facts.levels.includes(question.level))
      problems.push(`${question.id}: level "${question.level}" is not one of the chapter's levels`);
  }
  if (pool.pattern.chapter !== facts.id) problems.push(`${poolId}: the pattern record names "${pool.pattern.chapter}"`);
  return problems;
}

export function idProblems(questions: Question[]): string[] {
  const problems: string[] = [];
  const prefixes = new Set(questions.map((question) => question.id.split("-")[0]));
  if (prefixes.size > 1) problems.push(`ids share no prefix: ${[...prefixes].join(", ")}`);
  const seen = new Set<string>();
  for (const { id } of questions) {
    if (!KEBAB.test(id)) problems.push(`${id}: ids are kebab-case`);
    if (seen.has(id)) problems.push(`${id}: repeats inside its pool`);
    seen.add(id);
  }
  return problems;
}

export function duplicateIdProblems(pools: Record<string, ChapterPool>): string[] {
  const owner = new Map<string, string>();
  const problems: string[] = [];
  for (const [poolId, pool] of Object.entries(pools)) {
    for (const { id } of pool.questions) {
      const first = owner.get(id);
      if (first !== undefined && first !== poolId) problems.push(`${id}: used by ${first} and ${poolId}`);
      owner.set(id, poolId);
    }
  }
  return problems;
}

export function poolSizeProblems(questions: Question[]): string[] {
  const count = (test: (question: Question) => boolean) => questions.filter(test).length;
  const need = POOL_MINIMUMS;
  const problems: string[] = [];
  if (questions.length < need.questions) problems.push(`only ${questions.length} questions; need ${need.questions}`);
  if (count((q) => q.placement === true) < need.placement)
    problems.push(`fewer than ${need.placement} placement questions`);
  if (count((q) => q.skill === "complexity") < need.complexity)
    problems.push(`fewer than ${need.complexity} complexity questions`);
  if (count((q) => q.skill !== "complexity") < need.other)
    problems.push(`fewer than ${need.other} questions that are not complexity`);
  if (count((q) => q.skill === "trace") < need.trace) problems.push("no trace question");
  return problems;
}

export function companyProblems(value: unknown): string[] {
  const names = new Set<string>();
  for (const text of stringsOf(value)) {
    for (const match of text.matchAll(COMPANY_NAME)) names.add(match[0]);
  }
  return [...names].map((name) => `names a company: ${name}`);
}

export function wordingProblems(value: unknown): string[] {
  const found = new Set<string>();
  for (const text of stringsOf(value)) {
    if (FORBIDDEN_WORD.test(text)) found.add(text.slice(0, 40));
  }
  return [...found].map((text) => `says "verified", the copy says "checked": "${text}"`);
}

export function placementProblems(question: Question): string[] {
  return question.placement === true && question.skill !== "recognise"
    ? [`${question.id}: a placement question must have the skill "recognise"`]
    : [];
}

export function patternAgreementProblems(pool: ChapterPool): string[] {
  return pool.questions
    .filter((question) => question.pattern !== pool.pattern.pattern)
    .map(
      (question) => `${question.id}: pattern is "${question.pattern}", the pool's record is "${pool.pattern.pattern}"`
    );
}

export function patternRecordProblems(record: PatternRecord, chapterId: string): string[] {
  const problems: string[] = [];
  const say = (message: string) => problems.push(`${record.pattern}: ${message}`);
  if (!isPattern(record.pattern)) say("not in the pattern vocabulary");
  if (record.chapter !== chapterId) say(`chapter is "${record.chapter}", not "${chapterId}"`);
  if (record.signals.length < 2 || record.signals.length > 5) say("needs 2 to 5 signals");
  if (record.signals.some(blank)) say("a signal is empty");
  if (blank(record.template)) say("no template");
  else {
    const broken = htmlProblem(record.template);
    if (broken) say(`template: ${broken}`);
  }
  if (blank(record.time)) say("no time");
  if (blank(record.space)) say("no space");
  if (record.styles.length === 0) say("no interview style");
  if (record.styles.some((style) => !isStyle(style))) say("an interview style is unknown");
  if (new Set(record.styles).size !== record.styles.length) say("an interview style repeats");
  for (const problem of companyProblems(record)) say(problem);
  return problems;
}

export function poolProblems(pool: ChapterPool, facts: ChapterFacts | null, poolId: string): string[] {
  const sections = facts?.sections ?? [];
  return [
    ...chapterProblems(pool, facts, poolId),
    ...idProblems(pool.questions),
    ...pool.questions.flatMap((question) => [
      ...vocabularyProblems(question),
      ...placementProblems(question),
      ...sectionProblems(question, sections),
      ...shapeProblems(question),
      ...answerProblems(question),
      ...htmlProblems(question),
    ]),
    ...patternAgreementProblems(pool),
    ...poolSizeProblems(pool.questions),
    ...wordingProblems(pool),
    ...companyProblems(pool.questions),
    ...patternRecordProblems(pool.pattern, poolId),
  ];
}
