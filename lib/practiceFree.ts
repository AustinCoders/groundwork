import type { Exercise } from "@/content/types";

export type PracticeExercise = Omit<Exercise, "chapter" | "solution"> & {
  chapter: string | null;
  solution: string | null;
};

const FREE_STARTER =
  "// Playground — anything you write here runs in a sandbox.\n" +
  "// ⌘/Ctrl + Enter to run.\n\n" +
  'const notes = ["types", "closures", "the event loop"];\n\n' +
  "notes.forEach(function (topic, i) {\n" +
  "  console.log(i + 1, topic);\n" +
  "});\n\n" +
  'console.log({ layers: 9, mood: "caffeinated" });\n';

export const FREE_EXERCISE: PracticeExercise = {
  id: "free",
  title: "Playground",
  level: "beginner",
  chapter: null,
  brief:
    "<p>An empty page with a sandbox attached. Nothing is graded here — log things, break things, and watch what the engine does.</p>" +
    "<p>Your code is saved on this device as you type, so you can close the tab and come back to it.</p>",
  starter: FREE_STARTER,
  hints: [],
  solution: null,
  tests: [],
};
