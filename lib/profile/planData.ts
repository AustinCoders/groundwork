import { isPlainObject, store } from "@/lib/storage";

export const PLAN_KEY = "groundwork:plan";

export type SkillLevel = "unsure" | "okay" | "strong";

export const SKILL_LEVELS: readonly SkillLevel[] = ["unsure", "okay", "strong"];

export const DAILY_GOALS = [1, 3, 5, 8] as const;

export type DailyGoal = (typeof DAILY_GOALS)[number];

export const MAX_COMPANIES = 5;

export const MAX_SKILLS = 40;

export const MAX_FREEZES_BANKED = 2;

export const FREEZE_EVERY_DAYS = 7;

export interface StudyPlan {
  date: string | null;
  goal: DailyGoal;
  companies: string[];
  skills: Record<string, SkillLevel>;
  freezes: string[];
}

export const EMPTY_PLAN: StudyPlan = Object.freeze({
  date: null,
  goal: 3,
  companies: [],
  skills: {},
  freezes: [],
}) as StudyPlan;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

export function isDay(value: unknown): value is string {
  if (typeof value !== "string" || !DAY.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function sanitizePlan(value: unknown): StudyPlan {
  if (!isPlainObject(value)) return { ...EMPTY_PLAN, companies: [], skills: {}, freezes: [] };
  const goal = DAILY_GOALS.find((g) => g === value.goal) ?? EMPTY_PLAN.goal;
  const companies = Array.isArray(value.companies)
    ? [...new Set(value.companies.filter((c): c is string => typeof c === "string" && ID.test(c)))].slice(
        0,
        MAX_COMPANIES
      )
    : [];
  const skills: Record<string, SkillLevel> = {};
  if (isPlainObject(value.skills)) {
    for (const [id, level] of Object.entries(value.skills).slice(0, MAX_SKILLS)) {
      if (ID.test(id) && typeof level === "string" && (SKILL_LEVELS as readonly string[]).includes(level)) {
        skills[id] = level as SkillLevel;
      }
    }
  }
  const freezes = Array.isArray(value.freezes) ? [...new Set(value.freezes.filter(isDay))].sort().slice(-60) : [];
  return { date: isDay(value.date) ? value.date : null, goal, companies, skills, freezes };
}

export function readPlan(): StudyPlan {
  return sanitizePlan(store.get<unknown>(PLAN_KEY, null));
}
