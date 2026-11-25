import { isPlainObject } from "@/lib/storage";
import { friendlyAuthError } from "./errors";
import { connectAccount } from "./session";

export type AdminResult<T> = { ok: true; value: T } | { ok: false; error: string; code?: string };

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

const num = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;

export interface AdminReport {
  id: number;
  at: string;
  reason: string;
  note: string;
  resolved: boolean;
  resolution: string | null;
  reporter: { username: string; name: string };
  reported: {
    id: string;
    username: string;
    name: string;
    headline: string;
    joined: string | null;
    reports: number;
    suspendedUntil: string | null;
  };
}

export interface AdminView {
  stats: Record<"users" | "new_week" | "members" | "groups" | "mocks" | "open_reports" | "suspended", number>;
  reports: AdminReport[];
  suspended: { id: string; username: string; name: string; until: string }[];
  log: { action: string; detail: string; at: string; admin: string }[];
}

export function readAdmin(value: unknown): AdminView {
  const v = isPlainObject(value) ? value : {};
  const s = isPlainObject(v.stats) ? v.stats : {};
  const reports = (Array.isArray(v.reports) ? v.reports : [])
    .filter(isPlainObject)
    .map((r): AdminReport | null => {
      const reported = isPlainObject(r.reported) ? r.reported : {};
      const reporter = isPlainObject(r.reporter) ? r.reporter : {};
      const at = when(r.at);
      if (typeof r.id !== "number" || !at || typeof reported.id !== "string" || !UUID.test(reported.id)) return null;
      return {
        id: r.id,
        at,
        reason: text(r.reason, 30),
        note: text(r.note, 500),
        resolved: r.resolved === true,
        resolution: typeof r.resolution === "string" ? text(r.resolution, 20) : null,
        reporter: { username: text(reporter.username, 30), name: text(reporter.name, 60) },
        reported: {
          id: reported.id,
          username: text(reported.username, 30),
          name: text(reported.name, 60),
          headline: text(reported.headline, 80),
          joined: when(reported.joined),
          reports: num(reported.reports),
          suspendedUntil: when(reported.suspended_until),
        },
      };
    })
    .filter((r): r is AdminReport => r !== null);
  return {
    stats: {
      users: num(s.users),
      new_week: num(s.new_week),
      members: num(s.members),
      groups: num(s.groups),
      mocks: num(s.mocks),
      open_reports: num(s.open_reports),
      suspended: num(s.suspended),
    },
    reports,
    suspended: (Array.isArray(v.suspended) ? v.suspended : [])
      .filter(isPlainObject)
      .filter((u) => typeof u.id === "string" && UUID.test(u.id) && when(u.until))
      .map((u) => ({
        id: u.id as string,
        username: text(u.username, 30),
        name: text(u.name, 60),
        until: u.until as string,
      })),
    log: (Array.isArray(v.log) ? v.log : [])
      .filter(isPlainObject)
      .map((l) => ({
        action: text(l.action, 20),
        detail: text(l.detail, 240),
        at: when(l.at) ?? "",
        admin: text(l.admin, 60),
      }))
      .filter((l) => l.at),
  };
}

function problem(error: { code?: string; message?: string }): { error: string; code?: string } {
  if (error.message?.includes("admin_two_step"))
    return {
      error: "Admin tools need two-step sign-in. Turn it on in your account, then sign in again.",
      code: "two_step",
    };
  if (error.message?.includes("not_admin")) return { error: "This page is for admins only.", code: "not_admin" };
  if (error.code === "PGRST202" || error.code === "42883")
    return { error: "Admin tools are still being switched on.", code: "not_ready" };
  return { error: friendlyAuthError(error) };
}

async function call<T>(
  fn: string,
  args: Record<string, unknown> | undefined,
  read: (d: unknown) => T
): Promise<AdminResult<T>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = args ? await db.rpc(fn, args) : await db.rpc(fn);
  if (error) return { ok: false, ...problem(error) };
  return { ok: true, value: read(data) };
}

const status = (d: unknown) => (isPlainObject(d) && typeof d.status === "string" ? d.status : "");

export const amIAdmin = () =>
  call("am_i_admin", undefined, (d) => ({
    admin: isPlainObject(d) && d.admin === true,
    twoStep: isPlainObject(d) && d.two_step === true,
  }));
export const loadAdmin = () => call("admin_overview", undefined, readAdmin);
export const resolveReport = (id: number, resolution: "dismissed" | "warned" | "suspended") =>
  call("admin_resolve", { report_id: id, resolution }, status);
export const suspendUser = (target: string, days: number, reason: string) =>
  call("admin_suspend", { target, days, reason: reason.trim().slice(0, 200) }, status);
