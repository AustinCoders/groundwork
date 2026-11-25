import { computeStats, earnedBadges } from "@/lib/gamification";
import { cardExtras } from "@/lib/profile/cardExtras";
import { CHALLENGES } from "@/lib/profile/weekly";
import { isPlainObject, store } from "@/lib/storage";
import { postFeed, type FeedKind } from "./social";

export const FEED_POSTED_KEY = "groundwork:feed-posted";
export const STREAK_STEPS = [7, 14, 30, 50, 100, 200, 365, 500, 1000];

export interface Milestone {
  key: string;
  kind: FeedKind;
  data: Record<string, string | number>;
}

export interface MilestoneInput {
  streak: number;
  level: number;
  badges: { id: string; name: string }[];
  challenge: { week: string; id: string; done: boolean } | null;
  topics: { id: string; name: string; pct: number }[];
}

export function milestonesFor(input: MilestoneInput): Milestone[] {
  const out: Milestone[] = [];
  for (const step of STREAK_STEPS) {
    if (input.streak >= step) out.push({ key: `streak:${step}`, kind: "streak", data: { days: step } });
  }
  if (input.level >= 2) out.push({ key: `level:${input.level}`, kind: "level", data: { level: input.level } });
  for (const badge of input.badges) out.push({ key: `badge:${badge.id}`, kind: "badge", data: { badge: badge.name } });
  if (input.challenge?.done) {
    const title = CHALLENGES.find((c) => c.id === input.challenge!.id)?.title;
    if (title) out.push({ key: `challenge:${input.challenge.week}`, kind: "challenge", data: { title } });
  }
  for (const topic of input.topics) {
    if (topic.pct >= 100) out.push({ key: `topic:${topic.id}`, kind: "topic", data: { topic: topic.name } });
  }
  return out;
}

function readPosted(): Record<string, true> | null {
  const saved = store.get<unknown>(FEED_POSTED_KEY, null);
  if (!isPlainObject(saved)) return null;
  const out: Record<string, true> = {};
  for (const [k, v] of Object.entries(saved).slice(-400)) if (v === true && k.length <= 80) out[k] = true;
  return out;
}

export function newMilestones(all: Milestone[], posted: Record<string, true> | null): Milestone[] {
  if (!posted) return [];
  const fresh = all.filter((m) => !posted[m.key]);
  const levels = fresh.filter((m) => m.kind === "level");
  const streaks = fresh.filter((m) => m.kind === "streak");
  return [
    ...fresh.filter((m) => m.kind !== "level" && m.kind !== "streak"),
    ...levels.slice(-1),
    ...streaks.slice(-1),
  ].slice(0, 5);
}

export async function shareMilestones(topics: { id: string; name: string; pct: number }[] = []): Promise<void> {
  const stats = computeStats();
  const extras = cardExtras();
  const all = milestonesFor({
    streak: stats.streak,
    level: stats.level,
    badges: earnedBadges(stats).map((b) => ({ id: b.id, name: b.name })),
    challenge: {
      week: extras.challenge.week,
      id: extras.challenge.id,
      done: extras.challenge.count >= extras.challenge.target,
    },
    topics,
  });
  const posted = readPosted();
  const marked: Record<string, true> = { ...(posted ?? {}) };
  for (const m of all) if (!posted) marked[m.key] = true;
  const todo = newMilestones(all, posted);
  for (const m of todo) {
    const result = await postFeed(m.kind, m.data);
    if (!result.ok && result.code === "not_ready") return;
    marked[m.key] = true;
  }
  if (!posted || todo.length) store.set(FEED_POSTED_KEY, marked);
}
