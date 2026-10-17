import { ROADMAPS, type RoadmapOrder, type RoadmapSource, type RoadmapStepSource } from "@/content/roadmaps";
import { GIT_CHAPTERS } from "@/content/git-body";
import { chapterMetas, chaptersForLevel, topic, totalTime } from "@/lib/content";
import { GIT_PROGRESS_PREFIX } from "@/lib/gitSeries";
import { PARTS, bookRound } from "@/lib/interviewBook";
import { chapterHref, levels, topicHome } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

export interface RoadmapStepLevel {
  id: string;
  name: string;
  chapters: number;
  minutes: number;
  href: string;
  ids: string[];
}

export interface RoadmapChapter {
  id: string;
  title: string;
  href: string;
}

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
  group: string | null;
  levels: RoadmapStepLevel[];
  chapters: RoadmapChapter[];
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

function chaptersFor(id: string): RoadmapChapter[] {
  if (id === "git") {
    return GIT_CHAPTERS.map((section) => ({
      id: GIT_PROGRESS_PREFIX + section.id,
      title: section.title,
      href: `/git/${section.id}`,
    }));
  }
  return chapterMetas(id)
    .filter((chapter) => chapter.ready)
    .map((chapter) => ({ id: chapter.id, title: chapter.title, href: chapterHref(id, chapter.id) }));
}

function levelsFor(topicId: string): RoadmapStepLevel[] {
  if (!topic(topicId)?.levels) return [];
  return levels(topicId)
    .map((level) => {
      const written = chaptersForLevel(level.id, topicId).filter((chapter) => chapter.ready);
      return {
        id: level.id,
        name: level.name,
        chapters: written.length,
        minutes: totalTime(written),
        href: `/path/${topicId}/${level.id}`,
        ids: written.map((chapter) => chapter.id),
      };
    })
    .filter((level) => level.chapters > 0);
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
      group: PARTS.find((part) => part.id === round.part)?.title ?? null,
      levels: [],
      chapters: [],
      progressIds: [round.id],
    };
  }
  const found = topic(source.topic);
  if (!found) throw new Error(`roadmap: no topic "${source.topic}"`);
  const stat = topicStats()[found.id];
  const chapters = chaptersFor(found.id);
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
    group: null,
    levels: levelsFor(found.id),
    chapters,
    progressIds: chapters.map((chapter) => chapter.id),
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
