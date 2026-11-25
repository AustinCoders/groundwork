import type { PublicCard } from "@/lib/profile/publicCard";
import { isPlainObject } from "@/lib/storage";
import { cardExtras } from "@/lib/profile/cardExtras";
import type { CardDaily } from "@/lib/profile/daily";
import type { CardChallenge } from "@/lib/profile/weekly";
import { isPlainObject as isObject } from "@/lib/storage";
import { AVATAR_COLORS, isAvatarArt } from "./profileExtras";
import { friendlyAuthError } from "./errors";
import { connectAccount } from "./session";

export const NETWORK_HEAT_DAYS = 28;

export type CheerKind = "clap" | "fire" | "nudge";

export const CHEER_KINDS: readonly CheerKind[] = ["clap", "fire", "nudge"];

export type Relation = "none" | "sent" | "received" | "connected";

export interface NetworkFace {
  username: string;
  name: string;
  headline: string;
  role: string | null;
  color: (typeof AVATAR_COLORS)[number];
  art: string;
  level: number;
  streak: number;
  xp: number;
  chapters: number;
  exercises: number;
  heat: number[];
  heatEnd: string;
  at: string | null;
  since: string | null;
  relation: Relation | null;
  goal: number | null;
  challenge: CardChallenge | null;
  daily: CardDaily | null;
  mentor: boolean;
  mentorNote: string;
}

function readChallenge(value: unknown): CardChallenge | null {
  if (!isObject(value) || typeof value.week !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.week)) return null;
  if (typeof value.id !== "string" || !/^[a-z0-9-]{2,20}$/.test(value.id)) return null;
  const count =
    typeof value.count === "number" && Number.isFinite(value.count)
      ? Math.max(0, Math.min(999, Math.floor(value.count)))
      : 0;
  const target =
    typeof value.target === "number" && Number.isFinite(value.target)
      ? Math.max(1, Math.min(99, Math.floor(value.target)))
      : 1;
  return { week: value.week, id: value.id, count, target };
}

function readDaily(value: unknown): CardDaily | null {
  if (!isObject(value) || typeof value.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.day)) return null;
  return { day: value.day, done: value.done === true };
}

export interface NetworkOverview {
  me: { on: boolean; discoverable: boolean; username: string | null; at: string | null };
  connections: NetworkFace[];
  incoming: NetworkFace[];
  outgoing: { username: string; name: string; since: string | null }[];
  blocked: { username: string; name: string }[];
  cheers: { username: string; name: string; kind: CheerKind; at: string; seen: boolean }[];
}

export type NetResult<T> = { ok: true; value: T } | { ok: false; error: string; code?: string };

const NAME = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

const text = (value: unknown, max: number): string =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max)
    : "";

const num = (value: unknown, max: number): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.min(max, Math.floor(value)) : 0;

const when = (value: unknown): string | null =>
  typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;

export function readFace(value: unknown): NetworkFace | null {
  if (!isPlainObject(value)) return null;
  const username = text(value.username, 30);
  if (!NAME.test(username)) return null;
  const relation = ["none", "sent", "received", "connected"].includes(value.relation as string)
    ? (value.relation as Relation)
    : null;
  return {
    username,
    name: text(value.name, 60) || username,
    headline: text(value.headline, 80),
    role: ["frontend", "backend", "fullstack", "other"].includes(value.role as string) ? (value.role as string) : null,
    color: AVATAR_COLORS.find((c) => c === value.color) ?? "blue",
    art: isAvatarArt(value.art) ? value.art : "",
    level: Math.max(1, num(value.level, 999)),
    streak: num(value.streak, 100_000),
    xp: num(value.xp, 10_000_000),
    chapters: num(value.chapters, 100_000),
    exercises: num(value.exercises, 100_000),
    heat: Array.isArray(value.heat) ? value.heat.slice(-NETWORK_HEAT_DAYS).map((n) => num(n, 99)) : [],
    heatEnd: typeof value.heatEnd === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.heatEnd) ? value.heatEnd : "",
    at: when(value.at),
    since: when(value.since),
    relation,
    goal: value.goal === 1 || value.goal === 3 || value.goal === 5 || value.goal === 8 ? value.goal : null,
    challenge: readChallenge(value.challenge),
    daily: readDaily(value.daily),
    mentor: value.mentor === true,
    mentorNote: value.mentor === true ? text(value.mentorNote, 120) : "",
  };
}

function faces(value: unknown): NetworkFace[] {
  return Array.isArray(value)
    ? value
        .map(readFace)
        .filter((f): f is NetworkFace => f !== null)
        .slice(0, 500)
    : [];
}

export function readOverview(value: unknown): NetworkOverview {
  const v = isPlainObject(value) ? value : {};
  const me = isPlainObject(v.me) ? v.me : {};
  const pairs = (list: unknown) =>
    (Array.isArray(list) ? list : [])
      .filter(isPlainObject)
      .map((x) => ({ username: text(x.username, 30), name: text(x.name, 60), since: when(x.since) }))
      .filter((x) => NAME.test(x.username));
  return {
    me: {
      on: me.on === true,
      discoverable: me.discoverable !== false,
      username: typeof me.username === "string" && NAME.test(me.username) ? me.username : null,
      at: when(me.at),
    },
    connections: faces(v.connections),
    incoming: faces(v.incoming),
    outgoing: pairs(v.outgoing),
    blocked: pairs(v.blocked).map(({ username, name }) => ({ username, name })),
    cheers: (Array.isArray(v.cheers) ? v.cheers : [])
      .filter(isPlainObject)
      .filter(
        (c) => CHEER_KINDS.includes(c.kind as CheerKind) && typeof c.username === "string" && NAME.test(c.username)
      )
      .map((c) => ({
        username: c.username as string,
        name: text(c.name, 60) || (c.username as string),
        kind: c.kind as CheerKind,
        at: when(c.at) ?? "",
        seen: c.seen === true,
      }))
      .filter((c) => c.at)
      .slice(0, 30),
  };
}

const MESSAGES: Record<string, string> = {
  signed_out: "Sign in to use connections.",
  second_step: "Finish two-step sign-in first.",
  unconfirmed: "Confirm your email address first. The link is in your inbox.",
  not_member: "Join connections first.",
  limit: "That is a lot for one day. Try again tomorrow.",
};

function problem(error: { code?: string; message?: string }): { error: string; code?: string } {
  if (error.code === "PGRST202" || error.code === "42883" || error.code === "42703" || error.code === "PGRST204") {
    return { error: "Connections are still being switched on. Check back in a little while.", code: "not_ready" };
  }
  const key = Object.keys(MESSAGES).find((k) => error.message?.includes(k));
  return key ? { error: MESSAGES[key], code: key } : { error: friendlyAuthError(error) };
}

async function call<T>(
  fn: string,
  args: Record<string, unknown> | undefined,
  read: (data: unknown) => T
): Promise<NetResult<T>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = args ? await db.rpc(fn, args) : await db.rpc(fn);
  if (error) return { ok: false, ...problem(error) };
  return { ok: true, value: read(data) };
}

const status = (data: unknown): string => (isPlainObject(data) && typeof data.status === "string" ? data.status : "");

export const loadOverview = () => call("network_overview", undefined, readOverview);
export const findPeople = (query: string) => call("network_find", { query }, faces);
export const suggestPeople = () => call("network_suggest", undefined, faces);
export const requestConnection = (name: string) => call("network_request", { name }, status);
export const respondConnection = (name: string, accept: boolean) => call("network_respond", { name, accept }, status);
export const removeConnection = (name: string) => call("network_remove", { name }, status);
export const blockPerson = (name: string) => call("network_block", { name }, status);
export const unblockPerson = (name: string) => call("network_unblock", { name }, status);
export const reportPerson = (name: string, reason: string, note: string) =>
  call("network_report", { name, reason, note }, status);
export const cheer = (name: string, kind: CheerKind) => call("network_cheer", { name, kind }, status);
export const markCheersSeen = () => call("network_seen", undefined, () => null);

async function updateOwn(row: Record<string, unknown>): Promise<NetResult<null>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data: auth } = await db.auth.getUser();
  const id = auth.user?.id;
  if (!id) return { ok: false, error: "Sign in first." };
  const { error } = await db.from("profiles").update(row).eq("id", id);
  if (error) {
    if (error.code === "23514") return { ok: false, error: "Choose a username first." };
    return { ok: false, ...problem(error) };
  }
  return { ok: true, value: null };
}

export function networkCard(card: PublicCard, extras = cardExtras()) {
  return {
    goal: extras.goal,
    challenge: extras.challenge,
    daily: extras.daily,
    v: 1,
    name: card.name,
    headline: card.headline,
    role: card.role,
    color: card.color,
    art: card.art,
    level: card.level,
    xp: card.xp,
    streak: card.streak,
    chapters: card.chapters,
    exercises: card.exercises,
    heat: card.heat.slice(-NETWORK_HEAT_DAYS),
    heatEnd: card.heatEnd,
  };
}

export const joinNetwork = (card: PublicCard, discoverable: boolean) =>
  updateOwn({ network_on: true, discoverable, network_card: networkCard(card) });
export const leaveNetwork = () => updateOwn({ network_on: false });
export const setDiscoverable = (discoverable: boolean) => updateOwn({ discoverable });
export const publishNetworkCard = (card: PublicCard) => updateOwn({ network_card: networkCard(card) });

export async function networkCardDue(now: number, staleMs: number): Promise<boolean> {
  const db = await connectAccount();
  if (!db) return false;
  const { data: auth } = await db.auth.getUser();
  const id = auth.user?.id;
  if (!id) return false;
  const { data, error } = await db.from("profiles").select("network_on, network_at").eq("id", id).maybeSingle();
  if (error || !isPlainObject(data) || data.network_on !== true) return false;
  const at = typeof data.network_at === "string" ? Date.parse(data.network_at) : NaN;
  return !Number.isFinite(at) || now - at > staleMs;
}

function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function weekCount(face: { heat: number[]; heatEnd: string }, today: string): number {
  const gap = face.heatEnd ? Math.max(0, dayNumber(today) - dayNumber(face.heatEnd)) : 7;
  if (gap >= 7) return 0;
  return face.heat.slice(-(7 - gap)).reduce((sum, n) => sum + n, 0);
}

export interface BoardRow {
  username: string;
  name: string;
  week: number;
  streak: number;
  level: number;
  me: boolean;
}

export function leaderboard(me: BoardRow | null, others: NetworkFace[], today: string): BoardRow[] {
  const rows: BoardRow[] = others.map((f) => ({
    username: f.username,
    name: f.name,
    week: weekCount(f, today),
    streak: f.streak,
    level: f.level,
    me: false,
  }));
  if (me) rows.push(me);
  return rows.sort(
    (a, b) => b.week - a.week || b.streak - a.streak || b.level - a.level || a.name.localeCompare(b.name)
  );
}
