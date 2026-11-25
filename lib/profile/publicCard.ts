import { AVATAR_ARTS, AVATAR_COLORS } from "@/lib/account/profileExtras";
import { isPlainObject } from "@/lib/storage";

export const HEAT_DAYS = 182;

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export const RESERVED_USERNAMES: readonly string[] = [
  "about",
  "account",
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "austincoders",
  "blog",
  "dashboard",
  "groundwork",
  "help",
  "login",
  "logout",
  "me",
  "mod",
  "moderator",
  "null",
  "privacy",
  "profile",
  "root",
  "security",
  "settings",
  "signin",
  "signup",
  "staff",
  "support",
  "system",
  "team",
  "terms",
  "u",
  "undefined",
  "user",
  "users",
  "www",
];

export interface PublicTopic {
  id: string;
  name: string;
  mark: string;
  pct: number;
}

export interface PublicCard {
  v: 1;
  name: string;
  headline: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  color: string;
  art: string;
  role: string | null;
  level: number;
  xp: number;
  streak: number;
  bestStreak: number;
  chapters: number;
  exercises: number;
  badges: string[];
  topics: PublicTopic[];
  heat: number[];
  heatEnd: string;
}

export function usernameProblem(value: string): string | null {
  const name = value.trim().toLowerCase();
  if (!name) return "Choose a username.";
  if (name.length < 3) return "Use at least 3 characters.";
  if (name.length > 30) return "Keep it to 30 characters.";
  if (!/^[a-z0-9-]+$/.test(name)) return "Use only lowercase letters, numbers and hyphens.";
  if (name.startsWith("-") || name.endsWith("-")) return "Start and end with a letter or a number.";
  if (name.includes("--")) return "Use one hyphen at a time.";
  if (!USERNAME_PATTERN.test(name)) return "That username is not allowed.";
  if (RESERVED_USERNAMES.includes(name)) return "That one is reserved. Try another.";
  return null;
}

function text(value: unknown, max: number): string {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max)
    : "";
}

function count(value: unknown, max: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.min(max, Math.floor(value)) : 0;
}

const ID = /^[a-z0-9][a-z0-9-]{0,59}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function safeGithub(value: string): string | null {
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value) ? `https://github.com/${value}` : null;
}

export function safeLinkedin(value: string): string | null {
  return /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]{2,100}\/?$/.test(value) ? value : null;
}

export function safeWebsite(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizePublicCard(value: unknown): PublicCard | null {
  if (!isPlainObject(value) || value.v !== 1) return null;
  const name = text(value.name, 60);
  if (!name) return null;
  const color = AVATAR_COLORS.find((c) => c === value.color) ?? "blue";
  const art = AVATAR_ARTS.find((a) => a === value.art) ?? "";
  const topics: PublicTopic[] = Array.isArray(value.topics)
    ? value.topics
        .filter(isPlainObject)
        .filter((t) => typeof t.id === "string" && ID.test(t.id))
        .slice(0, 40)
        .map((t) => ({ id: t.id as string, name: text(t.name, 40), mark: text(t.mark, 4), pct: count(t.pct, 100) }))
        .filter((t) => t.name)
    : [];
  const badges = Array.isArray(value.badges)
    ? [...new Set(value.badges.filter((b): b is string => typeof b === "string" && ID.test(b)))].slice(0, 60)
    : [];
  const heat = Array.isArray(value.heat) ? value.heat.slice(-HEAT_DAYS).map((n) => count(n, 99)) : [];
  const github = text(value.github, 39);
  const linkedin = text(value.linkedin, 140);
  const website = text(value.website, 200);
  return {
    v: 1,
    name,
    headline: text(value.headline, 80),
    location: text(value.location, 60),
    github: safeGithub(github) ? github : "",
    linkedin: safeLinkedin(linkedin) ? linkedin : "",
    website: safeWebsite(website) ? website : "",
    color,
    art,
    role: ["frontend", "backend", "fullstack", "other"].includes(value.role as string) ? (value.role as string) : null,
    level: Math.max(1, count(value.level, 999)),
    xp: count(value.xp, 10_000_000),
    streak: count(value.streak, 100_000),
    bestStreak: count(value.bestStreak, 100_000),
    chapters: count(value.chapters, 100_000),
    exercises: count(value.exercises, 100_000),
    badges,
    topics,
    heat,
    heatEnd: typeof value.heatEnd === "string" && DAY.test(value.heatEnd) ? value.heatEnd : "",
  };
}

export interface CardSource {
  name: string;
  headline: string;
  location: string;
  github: string;
  linkedin: string;
  website: string;
  color: string;
  art: string;
  role: string | null;
  stats: {
    level: number;
    xp: number;
    streak: number;
    bestStreak: number;
    chaptersRead: number;
    exercisesSolved: number;
  };
  badges: string[];
  topics: PublicTopic[];
  activity: Record<string, number>;
  today: string;
}

function dayBefore(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d - n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function buildPublicCard(source: CardSource): PublicCard {
  const heat = Array.from(
    { length: HEAT_DAYS },
    (_, k) => source.activity[dayBefore(source.today, HEAT_DAYS - 1 - k)] ?? 0
  );
  const card = sanitizePublicCard({
    v: 1,
    name: source.name,
    headline: source.headline,
    location: source.location,
    github: source.github,
    linkedin: source.linkedin,
    website: source.website,
    color: source.color,
    art: source.art,
    role: source.role,
    level: source.stats.level,
    xp: source.stats.xp,
    streak: source.stats.streak,
    bestStreak: source.stats.bestStreak,
    chapters: source.stats.chaptersRead,
    exercises: source.stats.exercisesSolved,
    badges: source.badges,
    topics: source.topics.filter((t) => t.pct > 0).sort((a, b) => b.pct - a.pct),
    heat,
    heatEnd: source.today,
  });
  if (!card) throw new Error("public card needs a name");
  return card;
}
