import { isPlainObject } from "@/lib/storage";
import { friendlyAuthError } from "./errors";
import { readFace, type NetResult, type NetworkFace } from "./network";
import { AVATAR_COLORS, isAvatarArt } from "./profileExtras";
import { connectAccount } from "./session";

const NAME = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const text = (value: unknown, max: number): string =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim()
        .slice(0, max)
    : "";

const when = (value: unknown): string | null =>
  typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;

const MESSAGES: Record<string, string> = {
  signed_out: "Sign in first.",
  second_step: "Finish two-step sign-in first.",
  unconfirmed: "Confirm your email address first. The link is in your inbox.",
  not_member: "Join connections on the People page first.",
};

function problem(error: { code?: string; message?: string }): { error: string; code?: string } {
  if (["PGRST202", "42883", "42703", "PGRST204", "42P01"].includes(error.code ?? "")) {
    return { error: "This is still being switched on. Check back in a little while.", code: "not_ready" };
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

function faces(value: unknown): NetworkFace[] {
  return Array.isArray(value) ? value.map(readFace).filter((f): f is NetworkFace => f !== null) : [];
}

export const NOTE_KINDS = [
  "request",
  "accepted",
  "cheer_clap",
  "cheer_fire",
  "cheer_nudge",
  "buddy_request",
  "buddy_accepted",
  "group_request",
  "group_joined",
  "mock_invite",
  "mock_accepted",
  "mock_declined",
  "mock_cancelled",
  "mock_scored",
] as const;

export type NoteKind = (typeof NOTE_KINDS)[number];

export interface NoteActor {
  username: string;
  name: string;
  color: (typeof AVATAR_COLORS)[number];
  art: string;
}

export interface Note {
  id: number;
  kind: NoteKind;
  ref: string | null;
  at: string;
  read: boolean;
  actor: NoteActor | null;
}

export interface NoteList {
  unread: number;
  items: Note[];
}

function readActor(value: unknown): NoteActor | null {
  if (!isPlainObject(value) || typeof value.username !== "string" || !NAME.test(value.username)) return null;
  return {
    username: value.username,
    name: text(value.name, 60) || value.username,
    color: AVATAR_COLORS.find((c) => c === value.color) ?? "blue",
    art: isAvatarArt(value.art) ? value.art : "",
  };
}

export function readNotes(value: unknown): NoteList {
  const v = isPlainObject(value) ? value : {};
  const items = (Array.isArray(v.items) ? v.items : [])
    .filter(isPlainObject)
    .map((n): Note | null => {
      const kind = NOTE_KINDS.find((k) => k === n.kind);
      const at = when(n.at);
      if (!kind || !at || typeof n.id !== "number") return null;
      const ref = typeof n.ref === "string" && UUID.test(n.ref) ? n.ref : null;
      return { id: n.id, kind, ref, at, read: n.read === true, actor: readActor(n.actor) };
    })
    .filter((n): n is Note => n !== null)
    .slice(0, 30);
  const unread = typeof v.unread === "number" && v.unread > 0 ? Math.min(99, Math.floor(v.unread)) : 0;
  return { unread, items };
}

const NOTE_TEXT: Record<NoteKind, string> = {
  request: "wants to connect",
  accepted: "accepted your request",
  cheer_clap: "clapped for you",
  cheer_fire: "says keep the streak going",
  cheer_nudge: "nudged you to study today",
  buddy_request: "asked you to be study buddies",
  buddy_accepted: "is your study buddy now",
  group_request: "wants to join your study group",
  group_joined: "added you to a study group",
  mock_invite: "invited you to a mock interview",
  mock_accepted: "accepted your mock interview",
  mock_declined: "can't make the mock interview",
  mock_cancelled: "cancelled a mock interview",
  mock_scored: "sent your mock interview feedback",
};

export function noteText(note: Note): string {
  return `${note.actor?.name ?? "Someone"} ${NOTE_TEXT[note.kind]}`;
}

export function noteHref(note: Note): string {
  if (note.kind.startsWith("mock_") && note.ref) return `/mock/peer/${note.ref}`;
  if (note.kind.startsWith("group_")) return note.ref ? `/groups#group-${note.ref}` : "/groups";
  if (note.kind.startsWith("buddy_")) return "/people#people-buddy";
  return "/people";
}

export const loadNotes = () => call("my_notifications", undefined, readNotes);
export const readAllNotes = () => call("read_notifications", undefined, () => null);

export interface BuddyView {
  active: NetworkFace | null;
  incoming: NetworkFace[];
  outgoing: { username: string; name: string; since: string | null } | null;
}

export function readBuddy(value: unknown): BuddyView {
  const v = isPlainObject(value) ? value : {};
  const out =
    isPlainObject(v.outgoing) && typeof v.outgoing.username === "string" && NAME.test(v.outgoing.username)
      ? {
          username: v.outgoing.username,
          name: text(v.outgoing.name, 60) || v.outgoing.username,
          since: when(v.outgoing.since),
        }
      : null;
  return { active: readFace(v.active), incoming: faces(v.incoming).slice(0, 20), outgoing: out };
}

export const loadBuddy = () => call("buddy_overview", undefined, readBuddy);
export const askBuddy = (name: string) => call("buddy_ask", { name }, status);
export const answerBuddy = (name: string, accept: boolean) => call("buddy_answer", { name, accept }, status);
export const endBuddy = () => call("buddy_end", undefined, status);

export interface GroupMember extends NetworkFace {
  owner: boolean;
  me: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  about: string;
  role: "owner" | "member" | "pending";
  code: string | null;
  count: number;
  members: GroupMember[];
  pending: NetworkFace[];
}

export function readGroups(value: unknown): StudyGroup[] {
  return (Array.isArray(value) ? value : [])
    .filter(isPlainObject)
    .map((g): StudyGroup | null => {
      if (typeof g.id !== "string" || !UUID.test(g.id)) return null;
      const role = g.role === "owner" || g.role === "member" || g.role === "pending" ? g.role : null;
      if (!role) return null;
      const members = (Array.isArray(g.members) ? g.members : [])
        .map((m) => {
          const face = readFace(m);
          return face && isPlainObject(m) ? { ...face, owner: m.owner === true, me: m.me === true } : null;
        })
        .filter((m): m is GroupMember => m !== null)
        .slice(0, 20);
      return {
        id: g.id,
        name: text(g.name, 60) || "Study group",
        about: text(g.about, 200),
        role,
        code: typeof g.code === "string" && /^[a-z0-9]{10}$/.test(g.code) ? g.code : null,
        count: typeof g.count === "number" ? Math.max(0, Math.min(20, Math.floor(g.count))) : members.length,
        members,
        pending: faces(g.pending).slice(0, 50),
      };
    })
    .filter((g): g is StudyGroup => g !== null)
    .slice(0, 15);
}

export interface GroupPreview {
  status: string;
  id: string | null;
  name: string;
  about: string;
  count: number;
  owner: string;
  mine: "owner" | "member" | "pending" | "none";
  member: boolean;
}

export function readPreview(value: unknown): GroupPreview {
  const v = isPlainObject(value) ? value : {};
  const mine = v.mine === "owner" || v.mine === "member" || v.mine === "pending" ? v.mine : "none";
  return {
    status: typeof v.status === "string" ? v.status : "",
    id: typeof v.id === "string" && UUID.test(v.id) ? v.id : null,
    name: text(v.name, 60),
    about: text(v.about, 200),
    count: typeof v.count === "number" ? Math.max(0, Math.min(20, Math.floor(v.count))) : 0,
    owner: text(v.owner, 60),
    mine,
    member: v.member === true,
  };
}

export const GROUP_CODE = /^[a-z0-9]{10}$/;

export const loadGroups = () => call("group_mine", undefined, readGroups);
export const previewGroup = (code: string) => call("group_preview", { code }, readPreview);
export const createGroup = (name: string, about: string) =>
  call("group_create", { name, about }, (d) => ({
    status: status(d),
    id: isPlainObject(d) && typeof d.id === "string" && UUID.test(d.id) ? d.id : null,
  }));
export const joinGroup = (code: string) => call("group_join", { code }, status);
export const answerGroup = (groupId: string, name: string, accept: boolean) =>
  call("group_answer", { group_id: groupId, name, accept }, status);
export const leaveGroup = (groupId: string) => call("group_leave", { group_id: groupId }, status);
export const removeFromGroup = (groupId: string, name: string) =>
  call("group_remove", { group_id: groupId, name }, status);
export const editGroup = (groupId: string, name: string, about: string) =>
  call("group_edit", { group_id: groupId, name, about }, status);
export const newGroupCode = (groupId: string) => call("group_new_code", { group_id: groupId }, status);
export const deleteGroup = (groupId: string) => call("group_delete", { group_id: groupId }, status);

export const PEER_TOPICS = [
  { id: "javascript", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "frontend", label: "Frontend (HTML, CSS, browser)" },
  { id: "backend", label: "Backend (Node, APIs, databases)" },
  { id: "system-design", label: "System design" },
  { id: "dsa", label: "Data structures and algorithms" },
  { id: "behavioural", label: "Behavioural" },
] as const;

export type PeerTopic = (typeof PEER_TOPICS)[number]["id"];

export const CALL_LINK =
  /^https:\/\/(meet\.google\.com|([a-z0-9-]+\.)?zoom\.us|teams\.microsoft\.com|teams\.live\.com|meet\.jit\.si|whereby\.com|discord\.gg|discord\.com)\/[^\s<>"]*$/;

export function callLinkProblem(value: string): string | null {
  const link = value.trim();
  if (!link) return "Paste the call link.";
  if (link.length > 300) return "That link is too long.";
  if (!CALL_LINK.test(link)) return "Use a Google Meet, Zoom, Teams, Jitsi, Whereby or Discord link.";
  return null;
}

export const SCORE_AREAS = [
  { id: "understanding", label: "Understood the question" },
  { id: "technical", label: "Technical depth" },
  { id: "problem", label: "Problem solving" },
  { id: "communication", label: "Talked through their thinking" },
] as const;

export type ScoreArea = (typeof SCORE_AREAS)[number]["id"];

export const VERDICTS = [
  { id: "strong", label: "Strong yes" },
  { id: "yes", label: "Yes" },
  { id: "maybe", label: "Not yet sure" },
  { id: "no", label: "Not yet" },
] as const;

export type Verdict = (typeof VERDICTS)[number]["id"];

export interface PeerScore {
  ratings: Record<ScoreArea, number>;
  verdict: Verdict;
  strengths: string;
  improve: string;
}

export function readScore(value: unknown): PeerScore | null {
  if (!isPlainObject(value) || !isPlainObject(value.ratings)) return null;
  const ratings = {} as Record<ScoreArea, number>;
  for (const area of SCORE_AREAS) {
    const n = value.ratings[area.id];
    if (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 5) return null;
    ratings[area.id] = n;
  }
  const verdict = VERDICTS.find((v) => v.id === value.verdict)?.id;
  if (!verdict) return null;
  return { ratings, verdict, strengths: text(value.strengths, 600), improve: text(value.improve, 600) };
}

export interface PeerMock {
  id: string;
  at: string;
  minutes: 30 | 45 | 60;
  topic: PeerTopic;
  link: string | null;
  note: string;
  status: "invited" | "accepted" | "declined" | "cancelled";
  mine: boolean;
  interviewer: boolean;
  score: PeerScore | null;
  scored: boolean;
  other: NetworkFace | null;
}

export function readPeer(value: unknown): PeerMock | null {
  if (!isPlainObject(value) || typeof value.id !== "string" || !UUID.test(value.id)) return null;
  const at = when(value.at);
  const topic = PEER_TOPICS.find((t) => t.id === value.topic)?.id;
  const status = ["invited", "accepted", "declined", "cancelled"].find((s) => s === value.status) as
    PeerMock["status"] | undefined;
  if (!at || !topic || !status) return null;
  const minutes = value.minutes === 30 || value.minutes === 60 ? value.minutes : 45;
  const link = typeof value.link === "string" && CALL_LINK.test(value.link) ? value.link : null;
  return {
    id: value.id,
    at,
    minutes,
    topic,
    link,
    note: text(value.note, 300),
    status,
    mine: value.mine === true,
    interviewer: value.interviewer === true,
    score: readScore(value.score),
    scored: value.scored === true,
    other: readFace(value.other),
  };
}

export const loadPeers = () =>
  call("peer_list", undefined, (d) =>
    (Array.isArray(d) ? d : [])
      .map(readPeer)
      .filter((m): m is PeerMock => m !== null)
      .slice(0, 40)
  );
export const loadPeer = (id: string) => call("peer_get", { id }, readPeer);
export const invitePeer = (input: {
  name: string;
  at: string;
  minutes: number;
  topic: PeerTopic;
  link: string;
  interviewThem: boolean;
  note: string;
}) =>
  call(
    "peer_invite",
    {
      name: input.name,
      at: input.at,
      minutes: input.minutes,
      topic: input.topic,
      link: input.link.trim(),
      interview_them: input.interviewThem,
      note: input.note.trim().slice(0, 300),
    },
    (d) => ({ status: status(d), id: isPlainObject(d) && typeof d.id === "string" && UUID.test(d.id) ? d.id : null })
  );
export const answerPeer = (id: string, accept: boolean) => call("peer_answer", { id, accept }, status);
export const cancelPeer = (id: string) => call("peer_cancel", { id }, status);
export const scorePeer = (id: string, score: PeerScore) =>
  call(
    "peer_score",
    {
      id,
      score: { ...score, strengths: score.strengths.trim().slice(0, 600), improve: score.improve.trim().slice(0, 600) },
    },
    status
  );
