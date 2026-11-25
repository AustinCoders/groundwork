import type { RoleChapter, RoleTrack } from "./roleTracks";

export interface TodayTask {
  id: string;
  kind: "read" | "review" | "questions" | "mock" | "practice";
  title: string;
  body: string;
  href: string;
  action: string;
}

export interface TodayPlan {
  daysLeft: number | null;
  passed: boolean;
  perDay: number;
  crowded: boolean;
  remaining: number;
  tasks: TodayTask[];
  goal: number;
  doneToday: number;
}

const DAY_MS = 86_400_000;

export function daysUntil(date: string, now: number): number {
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const today = new Date(now);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  return Math.round((target - start) / DAY_MS);
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export interface TodayInput {
  track: RoleTrack;
  read: ReadonlySet<string>;
  date: string | null;
  goal: number;
  doneToday: number;
  due: number;
  shaky: number;
  lastMockAt: number | null;
  exercises: number;
  now: number;
}

export function buildToday(input: TodayInput): TodayPlan {
  const unread: (RoleChapter & { step: string })[] = input.track.steps.flatMap((step) =>
    step.kind === "topic"
      ? step.chapters.filter((c) => !input.read.has(c.id)).map((c) => ({ ...c, step: step.title }))
      : step.ids
          .filter((id) => !input.read.has(id))
          .map((id) => ({ id, title: step.title, href: step.href, check: false, step: "Interview book" }))
  );
  const daysLeft = input.date ? daysUntil(input.date, input.now) : null;
  const passed = daysLeft !== null && daysLeft < 0;
  const studyDays = daysLeft !== null && daysLeft >= 0 ? Math.max(1, daysLeft - 1) : null;
  const needed = studyDays !== null ? Math.ceil(unread.length / studyDays) : 0;
  const perDay =
    studyDays !== null ? Math.max(1, Math.min(6, needed)) : Math.max(1, Math.min(4, Math.ceil(input.goal / 2)));
  const finalStretch = daysLeft !== null && daysLeft >= 0 && daysLeft <= 2;

  const tasks: TodayTask[] = [];
  if (input.due > 0) {
    tasks.push({
      id: "review",
      kind: "review",
      title: `Review ${plural(input.due, "chapter")}`,
      body: "Due now. A quick pass keeps them from fading.",
      href: "/review",
      action: "Open review",
    });
  }
  if (!finalStretch && !passed) {
    for (const chapter of unread.slice(0, perDay)) {
      tasks.push({
        id: `read:${chapter.id}`,
        kind: "read",
        title: chapter.title,
        body: chapter.step,
        href: chapter.href,
        action: "Read",
      });
    }
  }
  if (input.shaky > 0 || finalStretch) {
    tasks.push({
      id: "questions",
      kind: "questions",
      title:
        input.shaky > 0
          ? `Say 5 of your ${plural(input.shaky, "shaky question")} out loud`
          : "Answer 10 interview questions out loud",
      body: "Mark each one again after you answer.",
      href: "/interview/questions",
      action: "Open questions",
    });
  }
  const mockDue =
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= 10 &&
    (input.lastMockAt === null || input.now - input.lastMockAt > 3 * DAY_MS);
  if (mockDue) {
    tasks.push({
      id: "mock",
      kind: "mock",
      title: "Do a mock interview",
      body:
        daysLeft <= 2 ? "One last full run before the real one." : "Your interview is close. Practise under a clock.",
      href: "/mock",
      action: "Start a mock",
    });
  }
  if (tasks.length < 2 && input.exercises < 40) {
    tasks.push({
      id: "practice",
      kind: "practice",
      title: "Solve one exercise",
      body: "Writing code keeps it real.",
      href: "/practice",
      action: "Open practice",
    });
  }

  return {
    daysLeft,
    passed,
    perDay,
    crowded: needed > 6,
    remaining: unread.length,
    tasks,
    goal: input.goal,
    doneToday: input.doneToday,
  };
}
