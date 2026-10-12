import { plural } from "@/lib/format";

interface HopCounts {
  topics: number;
  chapters: number;
  steps: number;
  paths: number;
  stages: number;
  answers: number;
}

export function hopFacts(counts: HopCounts): string[] {
  return [
    `${plural(counts.topics, "topic")} written`,
    plural(counts.chapters, "chapter"),
    plural(counts.steps, "step"),
    plural(counts.paths, "path"),
    plural(counts.stages, "stage"),
    plural(counts.answers, "answer"),
  ];
}
