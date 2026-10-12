import { plural } from "@/lib/format";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";

export const NEXT_REVIEW = plural(REVIEW_GAPS_DAYS[0], "day");

export const HOW_STEP_COPY = [
  {
    k: "Read",
    line: "Chapters layered bottom to top.",
    title: "Read a chapter that builds on the last one.",
  },
  {
    k: "Run",
    line: "Real tests, right in the page.",
    title: "Prove it with real tests, right in the page.",
  },
  {
    k: "Get asked",
    line: "The follow-up they push with next.",
    title: "Then get asked the follow-up.",
  },
  {
    k: "Keep",
    line: "Spaced review before you forget.",
    title: "And it comes back before you forget.",
  },
];

export const HOW_STEPS = HOW_STEP_COPY.length;

export const LAYERS = ["Syntax and values", "How code runs", "Core concepts", "Patterns", "Systems and scale"] as const;

export const READ_LINES = [
  {
    line: "The engine reads your file from the top, one line at a time.",
    layer: 0,
    plain:
      "The engine is the program inside your browser that understands JavaScript. It starts at line 1 and does what each line says, in order. A line is made of values, like numbers and words, and names that point to them.",
  },
  {
    line: "Calling a function opens a small workspace that is thrown away when the call ends.",
    layer: 1,
    plain:
      "Every call gets a fresh workspace for its own names. When the function hands back its answer, the workspace usually goes away, and every name inside it goes with it.",
  },
  {
    line: "A closure is a function that keeps its workspace alive after the call ends.",
    layer: 2,
    plain:
      "If an inner function still uses a name from the workspace around it, the engine keeps that workspace. That is how a counter remembers n between calls. Step 2 puts it to the test.",
  },
] as const;
