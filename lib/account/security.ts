import { isPlainObject } from "@/lib/storage";
import { friendlyAuthError } from "./errors";
import { connectAccount } from "./session";

export type SecurityKind =
  | "sign_in"
  | "second_step"
  | "two_step_on"
  | "two_step_off"
  | "email_changed"
  | "password_changed"
  | "provider_linked"
  | "provider_unlinked";

const KINDS: readonly string[] = [
  "sign_in",
  "second_step",
  "two_step_on",
  "two_step_off",
  "email_changed",
  "password_changed",
  "provider_linked",
  "provider_unlinked",
];

export interface ActiveSession {
  id: string;
  createdAt: string;
  seenAt: string;
  ip: string | null;
  agent: string | null;
  twoStep: boolean;
  current: boolean;
}

export interface SecurityEvent {
  at: string;
  kind: SecurityKind;
  ip: string | null;
  agent: string | null;
  detail: string | null;
}

export interface SecurityActivity {
  sessions: ActiveSession[];
  events: SecurityEvent[];
}

const str = (value: unknown, max = 400): string | null =>
  typeof value === "string" && value.length > 0 ? value.slice(0, max) : null;

export function readActivity(value: unknown): SecurityActivity {
  if (!isPlainObject(value)) return { sessions: [], events: [] };
  const current = str(value.current, 64);
  const sessions = (Array.isArray(value.sessions) ? value.sessions : [])
    .filter(isPlainObject)
    .map((s) => ({
      id: str(s.id, 64) ?? "",
      createdAt: str(s.created_at, 40) ?? "",
      seenAt: str(s.seen_at, 40) ?? str(s.created_at, 40) ?? "",
      ip: str(s.ip, 64),
      agent: str(s.agent),
      twoStep: s.aal === "aal2",
      current: current !== null && s.id === current,
    }))
    .filter((s) => s.id && s.createdAt)
    .slice(0, 50);
  const events = (Array.isArray(value.events) ? value.events : [])
    .filter(isPlainObject)
    .filter((e) => typeof e.kind === "string" && KINDS.includes(e.kind))
    .map((e) => ({
      at: str(e.at, 40) ?? "",
      kind: e.kind as SecurityKind,
      ip: str(e.ip, 64),
      agent: str(e.agent),
      detail: str(e.detail, 60),
    }))
    .filter((e) => e.at)
    .slice(0, 50);
  return { sessions, events };
}

export async function loadSecurityActivity(): Promise<
  { ok: true; value: SecurityActivity } | { ok: false; error: string }
> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.rpc("my_security_activity");
  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") {
      return { ok: false, error: "Sign-in activity is still being switched on. Check back in a little while." };
    }
    if (/second step/i.test(error.message)) return { ok: false, error: "Finish two-step sign-in to see this." };
    return { ok: false, error: friendlyAuthError(error) };
  }
  return { ok: true, value: readActivity(data) };
}

export async function endSession(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.rpc("end_my_session", { target: id });
  if (error) return { ok: false, error: friendlyAuthError(error) };
  if (data !== true) return { ok: false, error: "That device was already signed out." };
  return { ok: true };
}
