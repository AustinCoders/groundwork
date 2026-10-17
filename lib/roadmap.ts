import { ROADMAPS, type RoadmapOrder, type RoadmapSource, type RoadmapStepSource } from "@/content/roadmaps";
import { GIT_CHAPTERS } from "@/content/git-body";
import { chapterMetas, topic } from "@/lib/content";
import { GIT_PROGRESS_PREFIX } from "@/lib/gitSeries";
import { bookRound } from "@/lib/interviewBook";
import { topicHome } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

export interface RoadmapStep {
  key: string;
  kind: "topic" | "round";
  title: string;
  mark: string;
  accent: string;
  why: string | null;
  href: string;
  written: number;
  planned: number;
  exercises: number;
  minutes: number;
  progressIds: string[];
}

export interface RoadmapStage {
  id: string;
  title: string;
  blurb: string;
  order: RoadmapOrder;
  steps: RoadmapStep[];
}

export interface RoadmapTotals {
  steps: number;
  written: number;
  chapters: number;
  rounds: number;
  exercises: number;
  minutes: number;
}

export interface Roadmap {
  id: string;
  title: string;
  tagline: string;
  pain: string;
  accent: string;
  stages: RoadmapStage[];
  totals: RoadmapTotals;
}

const ROUND_ACCENT = "red";
const ROUND_MARK = "◎";

function topicIdsFor(id: string): string[] {
  if (id === "git") return GIT_CHAPTERS.map((section) => GIT_PROGRESS_PREFIX + section.id);
  return chapterMetas(id)
    .filter((chapter) => chapter.ready)
    .map((chapter) => chapter.id);
}

function resolveStep(source: RoadmapStepSource): RoadmapStep {
  if ("round" in source) {
    const round = bookRound(source.round);
    if (!round) throw new Error(`roadmap: no interview round "${source.round}"`);
    return {
      key: `round:${round.id}`,
      kind: "round",
      title: round.title,
      mark: round.code,
      accent: ROUND_ACCENT,
      why: null,
      href: `/interview/${round.id}`,
      written: 1,
      planned: 1,
      exercises: 0,
      minutes: round.minutes,
      progressIds: [round.id],
    };
  }
  const found = topic(source.topic);
  if (!found) throw new Error(`roadmap: no topic "${source.topic}"`);
  const stat = topicStats()[found.id];
  return {
    key: `topic:${found.id}`,
    kind: "topic",
    title: found.name,
    mark: found.mark || ROUND_MARK,
    accent: found.accent,
    why: source.why,
    href: topicHome(found.id),
    written: stat?.written ?? 0,
    planned: stat?.planned ?? 0,
    exercises: stat?.exercises ?? 0,
    minutes: stat?.minutes ?? 0,
    progressIds: topicIdsFor(found.id),
  };
}

function resolve(source: RoadmapSource): Roadmap {
  const stages = source.stages.map((stage) => ({
    id: stage.id,
    title: stage.title,
    blurb: stage.blurb,
    order: stage.order,
    steps: stage.steps.map(resolveStep),
  }));
  const steps = stages.flatMap((stage) => stage.steps);
  const readable = steps.filter((step) => step.written > 0);
  return {
    id: source.id,
    title: source.title,
    tagline: source.tagline,
    pain: source.pain,
    accent: source.accent,
    stages,
    totals: {
      steps: steps.length,
      written: readable.length,
      chapters: readable.filter((step) => step.kind === "topic").reduce((sum, step) => sum + step.written, 0),
      rounds: steps.filter((step) => step.kind === "round").length,
      exercises: readable.reduce((sum, step) => sum + step.exercises, 0),
      minutes: readable.reduce((sum, step) => sum + step.minutes, 0),
    },
  };
}

export function roadmaps(): Roadmap[] {
  return ROADMAPS.map(resolve);
}

export function roadmap(id: string): Roadmap | null {
  const source = ROADMAPS.find((entry) => entry.id === id);
  return source ? resolve(source) : null;
}

export function roadmapIds(): string[] {
  return ROADMAPS.map((entry) => entry.id);
}
