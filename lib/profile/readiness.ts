import type { SkillLevel } from "./planData";
import type { RoleChapter, RoleTrack } from "./roleTracks";

export type PartId = "learn" | "checks" | "practice" | "questions" | "mock" | "skills";

export type ReadinessBand = "starting" | "building" | "ready" | "strong";

export const READINESS_BAND_LABEL: Record<ReadinessBand, string> = {
  starting: "Just starting",
  building: "Getting there",
  ready: "Interview-ready",
  strong: "Strong",
};

export const TARGETS = { exercises: 40, knew: 60, mocks: 3 } as const;

const WEIGHTS: Record<PartId, number> = {
  learn: 35,
  checks: 10,
  practice: 15,
  questions: 20,
  mock: 15,
  skills: 5,
};

export interface ReadinessInput {
  track: RoleTrack;
  read: ReadonlySet<string>;
  passed: ReadonlySet<string>;
  exercises: number;
  confidence: { knew: number; shaky: number; blank: number };
  mock: { score: number; sessions: number } | null;
  skills: Record<string, SkillLevel>;
  skillInfo: Record<string, { name: string; href: string | null }>;
}

export interface ReadinessPart {
  id: PartId;
  label: string;
  value: number;
  weight: number;
  detail: string;
}

export interface ReadinessGap {
  id: string;
  part: PartId;
  title: string;
  body: string;
  href: string;
  action: string;
  gain: number;
}

export interface Readiness {
  score: number;
  band: ReadinessBand;
  parts: ReadinessPart[];
  gaps: ReadinessGap[];
  totals: { chapters: number; read: number };
}

const SKILL_VALUE: Record<SkillLevel, number> = { unsure: 0.2, okay: 0.6, strong: 1 };

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function bandOf(score: number): ReadinessBand {
  if (score >= 85) return "strong";
  if (score >= 65) return "ready";
  if (score >= 40) return "building";
  return "starting";
}

export function computeReadiness(input: ReadinessInput): Readiness {
  const chapters: RoleChapter[] = input.track.steps.flatMap((step) =>
    step.kind === "topic"
      ? step.chapters
      : step.ids.map((id) => ({ id, title: step.title, href: step.href, check: false }))
  );
  const total = chapters.length;
  const readCount = chapters.filter((c) => input.read.has(c.id)).length;
  const withChecks = chapters.filter((c) => c.check);
  const readWithChecks = withChecks.filter((c) => input.read.has(c.id));
  const passedCount = readWithChecks.filter((c) => input.passed.has(c.id)).length;

  const skillIds = Object.keys(input.skills);
  const skillValue = skillIds.length
    ? skillIds.reduce((sum, id) => sum + SKILL_VALUE[input.skills[id]], 0) / skillIds.length
    : 0;
  const questionValue = clamp01((input.confidence.knew + input.confidence.shaky * 0.4) / TARGETS.knew);
  const mockValue = input.mock
    ? clamp01(input.mock.score * Math.min(1, 0.5 + input.mock.sessions / (TARGETS.mocks * 2)))
    : 0;

  const raw: Omit<ReadinessPart, "weight">[] = [
    {
      id: "learn",
      label: "Reading",
      value: total ? readCount / total : 0,
      detail: `${readCount} of ${plural(total, "chapter")} for this role`,
    },
    {
      id: "checks",
      label: "Checks",
      value: readWithChecks.length ? passedCount / readWithChecks.length : 0,
      detail: readWithChecks.length
        ? `${passedCount} of ${readWithChecks.length} read chapters passed`
        : "Read a chapter that has a check",
    },
    {
      id: "practice",
      label: "Practice",
      value: clamp01(input.exercises / TARGETS.exercises),
      detail: `${Math.min(input.exercises, TARGETS.exercises)} of ${TARGETS.exercises} exercises solved`,
    },
    {
      id: "questions",
      label: "Interview questions",
      value: questionValue,
      detail: `${input.confidence.knew} you can answer, ${input.confidence.shaky} shaky`,
    },
    {
      id: "mock",
      label: "Mock interviews",
      value: mockValue,
      detail: input.mock
        ? `${plural(input.mock.sessions, "mock")}, recent score ${Math.round(input.mock.score * 100)}%`
        : "No mock interview yet",
    },
    {
      id: "skills",
      label: "Resume skills",
      value: skillValue,
      detail: skillIds.length
        ? `${skillIds.filter((id) => input.skills[id] === "strong").length} of ${plural(skillIds.length, "skill")} marked strong`
        : "Rate the skills on your resume",
    },
  ];

  const applies = (id: PartId) => id !== "checks" || withChecks.length > 0;
  const weightSum = raw.reduce((sum, p) => sum + (applies(p.id) ? WEIGHTS[p.id] : 0), 0);
  const parts: ReadinessPart[] = raw
    .filter((p) => applies(p.id))
    .map((p) => ({ ...p, value: clamp01(p.value), weight: (WEIGHTS[p.id] / weightSum) * 100 }));
  const score = Math.round(parts.reduce((sum, p) => sum + p.value * p.weight, 0));

  const gaps: ReadinessGap[] = [];
  const value = (id: PartId) => parts.find((p) => p.id === id);

  const nextStep = input.track.steps.find((step) => step.ids.some((id) => !input.read.has(id)));
  const learn = value("learn");
  if (learn && nextStep && learn.value < 1) {
    const left = nextStep.ids.filter((id) => !input.read.has(id)).length;
    const first = nextStep.chapters.find((c) => !input.read.has(c.id));
    gaps.push({
      id: `learn:${nextStep.key}`,
      part: "learn",
      title: `Read ${nextStep.title}`,
      body:
        nextStep.kind === "topic"
          ? `${plural(left, "chapter")} left here, next up “${first?.title ?? nextStep.title}”.`
          : "The next interview round on your path.",
      href: first?.href ?? nextStep.href,
      action: "Start reading",
      gain: (1 - learn.value) * learn.weight,
    });
  }

  const checks = value("checks");
  const unchecked = readWithChecks.filter((c) => !input.passed.has(c.id));
  if (checks && unchecked.length > 0) {
    gaps.push({
      id: "checks",
      part: "checks",
      title: `Pass the check on ${plural(unchecked.length, "chapter")} you read`,
      body: `Start with “${unchecked[0].title}”. A pass proves it stuck.`,
      href: `${unchecked[0].href}#check`,
      action: "Take the check",
      gain: (1 - checks.value) * checks.weight,
    });
  }

  const practice = value("practice");
  if (practice && practice.value < 1) {
    gaps.push({
      id: "practice",
      part: "practice",
      title: `Solve ${plural(TARGETS.exercises - Math.min(input.exercises, TARGETS.exercises), "more exercise")}`,
      body: "Interviews ask you to write code, not just explain it.",
      href: "/practice",
      action: "Open practice",
      gain: (1 - practice.value) * practice.weight,
    });
  }

  const questions = value("questions");
  if (questions && questions.value < 1) {
    gaps.push({
      id: "questions",
      part: "questions",
      title:
        input.confidence.shaky > 0
          ? `Go over the ${plural(input.confidence.shaky, "question")} you marked shaky`
          : "Answer interview questions out loud",
      body: `Mark each one honestly. ${TARGETS.knew} you can answer well is a good bar.`,
      href: "/interview/questions",
      action: "Open the question bank",
      gain: (1 - questions.value) * questions.weight,
    });
  }

  const mock = value("mock");
  if (mock && mock.value < 0.8) {
    gaps.push({
      id: "mock",
      part: "mock",
      title: input.mock ? "Do another mock interview" : "Do your first mock interview",
      body: input.mock
        ? "Your recent mocks count most. One more lifts the score fastest."
        : "Timed rounds with a scorecard, so the real one is not the first.",
      href: "/mock",
      action: "Start a mock",
      gain: (1 - mock.value) * mock.weight,
    });
  }

  const skills = value("skills");
  if (skills) {
    const unsure = skillIds.filter((id) => input.skills[id] === "unsure");
    if (skillIds.length === 0) {
      gaps.push({
        id: "skills",
        part: "skills",
        title: "Check your resume, then rate its skills",
        body: "Interviewers ask about everything you list.",
        href: "/resume",
        action: "Open the resume lab",
        gain: skills.weight,
      });
    } else if (unsure.length > 0) {
      const info = input.skillInfo[unsure[0]];
      gaps.push({
        id: `skill:${unsure[0]}`,
        part: "skills",
        title: `Brush up ${info?.name ?? unsure[0]}`,
        body: `It is on your resume and you marked it unsure${unsure.length > 1 ? `, with ${plural(unsure.length - 1, "other")}` : ""}.`,
        href: info?.href ?? "/account#account-plan",
        action: info?.href ? "Study it" : "Review your skills",
        gain: (1 - skills.value) * skills.weight,
      });
    }
  }

  gaps.sort((a, b) => b.gain - a.gain);
  return { score, band: bandOf(score), parts, gaps, totals: { chapters: total, read: readCount } };
}
