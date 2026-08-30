import { activity, dayKey, progress } from "@/lib/storage";

export interface Stats {
  exercisesSolved: number;
  chaptersRead: number;
  totalReviews: number;
  streak: number;
  bestStreak: number;
  activeDays: number;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

// Quadratic curve — level N starts at 25*(N-1)^2 XP, so early levels come
// fast (hook) and later ones stretch out (something to keep working toward).
function levelForXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 25)) + 1;
}

function xpForLevel(level: number): number {
  return 25 * (level - 1) ** 2;
}

export function computeStats(): Stats {
  const data = progress.all();
  const exercisesSolved = Object.keys(data.exercises).length;
  const chapterMarks = Object.values(data.chapters);
  const chaptersRead = chapterMarks.length;
  const totalReviews = chapterMarks.reduce((sum, m) => sum + (m === true ? 0 : m.reviews), 0);

  const log = activity.all();
  const activeDays = Object.keys(log).length;

  // Walk backward from today; a day with no activity YET doesn't break the
  // streak (the day isn't over), but yesterday having none does.
  let streak = 0;
  const oneDay = 24 * 60 * 60 * 1000;
  let cursor = Date.now();
  if (!log[dayKey(cursor)]) cursor -= oneDay;
  while (log[dayKey(cursor)]) {
    streak += 1;
    cursor -= oneDay;
  }

  // Longest run of consecutive active days across the whole log.
  const days = Object.keys(log).sort();
  let bestStreak = 0;
  let run = 0;
  let prevTime: number | null = null;
  for (const key of days) {
    const t = new Date(key).getTime();
    run = prevTime !== null && t - prevTime === oneDay ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prevTime = t;
  }

  const xp = exercisesSolved * 10 + chaptersRead * 5 + totalReviews * 3;
  const level = levelForXP(xp);
  const xpIntoLevel = xp - xpForLevel(level);
  const xpForNextLevel = xpForLevel(level + 1) - xpForLevel(level);

  return {
    exercisesSolved,
    chaptersRead,
    totalReviews,
    streak,
    bestStreak: Math.max(bestStreak, streak),
    activeDays,
    xp,
    level,
    xpIntoLevel,
    xpForNextLevel,
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: (s: Stats) => boolean;
}

export const BADGES: Badge[] = [
  { id: "first-solve", name: "First Steps", description: "Solve your first exercise.", icon: "🌱", earned: (s) => s.exercisesSolved >= 1 },
  { id: "solve-10", name: "Problem Solver", description: "Solve 10 exercises.", icon: "🧩", earned: (s) => s.exercisesSolved >= 10 },
  { id: "solve-50", name: "Grinder", description: "Solve 50 exercises.", icon: "⚙️", earned: (s) => s.exercisesSolved >= 50 },
  { id: "solve-100", name: "Century", description: "Solve 100 exercises.", icon: "💯", earned: (s) => s.exercisesSolved >= 100 },
  { id: "read-10", name: "Bookworm", description: "Read 10 chapters.", icon: "📖", earned: (s) => s.chaptersRead >= 10 },
  { id: "read-50", name: "Scholar", description: "Read 50 chapters.", icon: "🎓", earned: (s) => s.chaptersRead >= 50 },
  { id: "streak-3", name: "Warming Up", description: "3-day streak.", icon: "🔥", earned: (s) => s.bestStreak >= 3 },
  { id: "streak-7", name: "Week Warrior", description: "7-day streak.", icon: "🗓️", earned: (s) => s.bestStreak >= 7 },
  { id: "streak-30", name: "Month Master", description: "30-day streak.", icon: "🏆", earned: (s) => s.bestStreak >= 30 },
  { id: "reviewer", name: "Reviewer", description: "Complete 10 spaced reviews.", icon: "🔁", earned: (s) => s.totalReviews >= 10 },
  { id: "level-5", name: "Leveling Up", description: "Reach level 5.", icon: "⭐", earned: (s) => s.level >= 5 },
  { id: "level-10", name: "High Achiever", description: "Reach level 10.", icon: "🌟", earned: (s) => s.level >= 10 },
];

export function earnedBadges(stats: Stats): Badge[] {
  return BADGES.filter((b) => b.earned(stats));
}

/** Last `days` entries, oldest first, for a contribution-style heatmap. */
export function recentActivity(days: number): { day: string; count: number }[] {
  const log = activity.all();
  const out: { day: string; count: number }[] = [];
  const oneDay = 24 * 60 * 60 * 1000;
  const today = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(today - i * oneDay);
    out.push({ day: key, count: log[key] || 0 });
  }
  return out;
}
