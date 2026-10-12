import { formatSpan, plural } from "@/lib/format";
import { TRAIL_SPOTS } from "@/lib/trail";

export type JourneyStep = { topic: string } | { label: string; mark: string; href: string; sub: string; tone: string };

interface HomePath {
  tag: string;
  title: string;
  pain: string;
  tone: string;
  steps: JourneyStep[];
  gains: string[];
}

export const HOME_PATHS: HomePath[] = [
  {
    tag: "Frontend developer",
    title: "Build interfaces, then explain them",
    pain: "You can make a page work, but the ideas underneath still feel like magic, and a live widget round scares you.",
    tone: "blue",
    steps: [
      { topic: "js" },
      { topic: "typescript" },
      { topic: "react" },
      { topic: "nextjs" },
      { label: "The frontend round", mark: "R4", href: "/interview/r4fe", sub: "interview round", tone: "red" },
    ],
    gains: [
      "Explain what your code does before it runs, line by line",
      "Say exactly why a component re-rendered, and stop it",
      "Build a working widget live, under a clock",
    ],
  },
  {
    tag: "Interview prep",
    title: "Patterns first, then every round",
    pain: "You are good at the work and out of practice at the interview: puzzles with no theory, and rounds nobody explained.",
    tone: "purple",
    steps: [
      { topic: "dsa" },
      { label: "Online assessment", mark: "OA", href: "/interview/r1oa", sub: "interview round", tone: "red" },
      { label: "Machine coding", mark: "R2", href: "/interview/r2", sub: "interview round", tone: "red" },
      { topic: "system-design" },
      { label: "Behavioural", mark: "R11", href: "/interview/r11", sub: "interview round", tone: "red" },
    ],
    gains: [
      "Solve array and string problems with a pattern, not luck",
      "Walk into the online assessment knowing its format",
      "Talk through a cache or a queue without hand-waving",
    ],
  },
  {
    tag: "Senior and system design",
    title: "Reason about the whole system",
    pain: "The questions stop being about syntax. They are about trade-offs, failure, and proving you can lead without the title.",
    tone: "orange",
    steps: [
      { topic: "react" },
      { topic: "system-design" },
      { topic: "databases" },
      { label: "Distributed systems", mark: "S2", href: "/interview/s2", sub: "senior round", tone: "red" },
      { label: "Staff behavioural", mark: "S4", href: "/interview/s4", sub: "senior round", tone: "red" },
    ],
    gains: [
      "Reason about consensus, partitions and failure out loud",
      "Explain the runtime under React, not just the API",
      "Tell staff-level stories that survive the follow-up",
    ],
  },
];

export const PATH_COUNT = HOME_PATHS.length;

export interface PathCard {
  id: string;
  name: string;
  mark: string;
  accent: string;
  href: string;
  chapters: number;
  exercises: number;
  minutes: number;
}

export interface Stop {
  key: string;
  name: string;
  mark: string;
  tone: string;
  sub: string;
  meta: string;
  href: string | null;
  written: boolean;
  chapters: number;
  exercises: number;
  minutes: number;
}

export function pathStops(steps: JourneyStep[], ready: PathCard[], soon: PathCard[]): Stop[] {
  const byId = new Map([...ready, ...soon].map((card) => [card.id, card]));
  const writtenIds = new Set(ready.map((card) => card.id));
  return steps
    .flatMap((step): Stop[] => {
      if (!("topic" in step))
        return [
          {
            key: step.href,
            name: step.label,
            mark: step.mark,
            tone: step.tone,
            sub: step.sub,
            meta: "what it tests, the trap, the follow-up",
            href: step.href,
            written: false,
            chapters: 0,
            exercises: 0,
            minutes: 0,
          },
        ];
      const card = byId.get(step.topic);
      if (!card) return [];
      const written = writtenIds.has(card.id);
      return [
        {
          key: card.id,
          name: card.name,
          mark: card.mark,
          tone: card.accent,
          sub: written ? plural(card.chapters, "chapter") : "soon",
          meta: written
            ? [card.exercises > 0 ? plural(card.exercises, "exercise") : "", formatSpan(card.minutes)]
                .filter(Boolean)
                .join(" · ")
            : "laid out, chapters on the way",
          href: written ? card.href : null,
          written,
          chapters: card.chapters,
          exercises: card.exercises,
          minutes: card.minutes,
        },
      ];
    })
    .slice(0, TRAIL_SPOTS.length);
}

export function leadStop(stops: Stop[]): Stop | undefined {
  return stops.find((stop) => stop.written);
}

export function startOf(stops: Stop[]): { stop: Stop; label: string } | null {
  const stop = stops.find((candidate) => candidate.href);
  if (!stop) return null;
  return { stop, label: stop === stops[0] ? "Start this path" : `Start with ${stop.name}` };
}
