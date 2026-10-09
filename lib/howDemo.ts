import { plural } from "@/lib/format";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";

type Counter = () => () => number;

export type VariantId = "shared" | "closure" | "offByOne";

export interface Variant {
  id: VariantId;
  label: string;
  source: string[];
  culprit: number | null;
  hint: string;
  create: () => Counter;
}

interface Observation {
  expected: string;
  received: string;
}

interface Check {
  name: string;
  observe: (counter: Counter) => Observation;
}

interface Outcome {
  name: string;
  ok: boolean;
  expected: string;
  received: string;
}

export interface Report {
  variant: VariantId;
  outcomes: Outcome[];
  passed: number;
  total: number;
  ok: boolean;
}

export const VARIANTS: readonly Variant[] = [
  {
    id: "shared",
    label: "Shared counter",
    source: ["let n = 0;", "", "function counter() {", "  return () => ++n;", "}"],
    culprit: 0,
    hint: "n lives outside counter(), so every counter shares it. Try the closure version.",
    create: () => {
      let n = 0;
      return () => () => ++n;
    },
  },
  {
    id: "closure",
    label: "Closure",
    source: ["function counter() {", "  let n = 0;", "  return () => ++n;", "}"],
    culprit: null,
    hint: "n lives inside counter(), so each counter keeps its own.",
    create: () => () => {
      let n = 0;
      return () => ++n;
    },
  },
  {
    id: "offByOne",
    label: "Off by one",
    source: ["function counter() {", "  let n = 0;", "  return () => n++;", "}"],
    culprit: 2,
    hint: "n++ hands back the old value, so the first call gives 0. The closure version uses ++n.",
    create: () => () => {
      let n = 0;
      return () => n++;
    },
  },
];

const CALLS = 1000;

const CHECKS: readonly Check[] = [
  {
    name: "counts up from 1",
    observe: (counter) => {
      const next = counter();
      return { expected: "1, then 2", received: `${next()}, then ${next()}` };
    },
  },
  {
    name: "each counter keeps its own n",
    observe: (counter) => {
      const first = counter();
      const second = counter();
      const start = second();
      first();
      first();
      return { expected: String(start + 1), received: String(second()) };
    },
  },
  {
    name: "adds exactly one every call",
    observe: (counter) => {
      const next = counter();
      let last = next();
      for (let call = 2; call <= CALLS; call++) {
        const now = next();
        if (now - last !== 1) return { expected: "+1 each call", received: `+${now - last} on call ${call}` };
        last = now;
      }
      return { expected: "+1 each call", received: "+1 each call" };
    },
  },
];

export const TEST_NAMES = CHECKS.map((check) => check.name);

export function variantOf(id: VariantId): Variant {
  return VARIANTS.find((variant) => variant.id === id) ?? VARIANTS[0];
}

export function runVariant(id: VariantId): Report {
  const variant = variantOf(id);
  const outcomes = CHECKS.map((check): Outcome => {
    const seen = check.observe(variant.create());
    return { name: check.name, ok: seen.expected === seen.received, ...seen };
  });
  const passed = outcomes.filter((outcome) => outcome.ok).length;
  return { variant: variant.id, outcomes, passed, total: outcomes.length, ok: passed === outcomes.length };
}

export const QUESTION = {
  prompt: "An interviewer shows you this and asks: what does it log?",
  code: [
    "function counter() { let n = 0; return () => ++n; }",
    "const a = counter();",
    "a(); a();",
    "console.log(counter()());",
  ],
  options: [
    {
      id: "one",
      label: "1",
      correct: true,
      why: "Checked: counter() builds a brand-new n each time it is called, so the new counter starts from 0 and ++n makes it 1.",
    },
    {
      id: "three",
      label: "3",
      correct: false,
      why: "Checked: that is what you would see if every counter shared one n, like the shared version in step 2. Here each call to counter() makes its own.",
    },
    {
      id: "zero",
      label: "0",
      correct: false,
      why: "Checked: ++n adds one first and then hands the result back, so the first call gives 1. It is n++ that would give 0.",
    },
    {
      id: "undefined",
      label: "undefined",
      correct: false,
      why: "Checked: the inner function reaches n even after counter() has returned, and it hands n back, so there is a number to log.",
    },
  ],
  followUp: {
    right: {
      ask: "Good. Now, when does that n finally get cleaned up?",
      testing: "They are checking that you know a closure keeps variables alive, not just copies of values.",
    },
    wrong: {
      ask: "Hmm. Walk me through what n is the second time counter() runs.",
      testing: "They are checking that you can trace the scope step by step instead of guessing a number.",
    },
  },
} as const;

type Option = (typeof QUESTION.options)[number];

export interface Grade {
  option: Option;
  correct: boolean;
  why: string;
  ask: string;
  testing: string;
}

function gradeOption(option: Option): Grade {
  const next = option.correct ? QUESTION.followUp.right : QUESTION.followUp.wrong;
  return { option, correct: option.correct, why: option.why, ...next };
}

export function gradeAnswer(optionId: string): Grade | null {
  const option = QUESTION.options.find((candidate) => candidate.id === optionId);
  return option ? gradeOption(option) : null;
}

export const RIGHT_GRADE = gradeOption(QUESTION.options.find((option) => option.correct) ?? QUESTION.options[0]);

export const CALENDAR_DAYS = 35;

interface ReviewDay {
  offset: number;
  gap: number | null;
  date: Date;
  label: string;
}

function relativeLabel(offset: number): string {
  return offset === 0 ? "today" : `in ${plural(offset, "day")}`;
}

export function dayAfter(today: Date, offset: number): Date {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

export function reviewSchedule(today: Date): ReviewDay[] {
  let offset = 0;
  const days: ReviewDay[] = [{ offset, gap: null, date: dayAfter(today, 0), label: relativeLabel(0) }];
  for (const gap of REVIEW_GAPS_DAYS) {
    offset += gap;
    days.push({ offset, gap, date: dayAfter(today, offset), label: relativeLabel(offset) });
  }
  return days;
}
