import { plural } from "@/lib/format";

export const REVIEW_DAYS = [0, 3, 10, 31];
export const NEXT_REVIEW = plural(REVIEW_DAYS[1], "day");

export const HOW_STEP_COPY = [
  {
    k: "Read",
    line: "Chapters layered bottom to top.",
    title: "Read a chapter that builds on the last one.",
    body: "Every topic is layered bottom to top, so an idea only arrives after the ideas it rests on. You never skim past a word you do not know yet.",
  },
  {
    k: "Run",
    line: "Real tests, right in the page.",
    title: "Prove it with real tests, right in the page.",
    body: "Chapters that need practice end in an editor. Your answer runs in your browser against real tests, and a pass is what counts.",
  },
  {
    k: "Get asked",
    line: "The follow-up they push with next.",
    title: "Then get asked the follow-up.",
    body: "The interview book shows how each round really goes: the question, the wrong answer that loses the room, and what they push with next.",
  },
  {
    k: "Keep",
    line: "Spaced review before you forget.",
    title: "And it comes back before you forget.",
    body: "Chapters you finish come back for review on a spaced schedule, so what you read in week one is still there on interview day.",
  },
];

export const HOW_STEPS = HOW_STEP_COPY.length;
