import type { Exercise } from "@/content/types";
import { templatesFor } from "@/lib/playgroundTemplates";

export type PracticeExercise = Omit<Exercise, "chapter" | "solution"> & {
  chapter: string | null;
  solution: string | null;
};

export const FREE_EXERCISE: PracticeExercise = {
  id: "free",
  title: "Playground",
  level: "beginner",
  chapter: null,
  brief:
    "<p>An empty page with a sandbox attached. Nothing is graded here — log things, break things, and watch what the engine does.</p>" +
    "<p>Your code is saved on this device as you type, so you can close the tab and come back to it.</p>",
  starter: templatesFor("javascript")[0].code,
  hints: [],
  solution: null,
  tests: [],
};
