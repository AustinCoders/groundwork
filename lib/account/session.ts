"use client";

import { useSyncExternalStore } from "react";
import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { accountClient } from "@/lib/account/client";
import { SYNC_META_KEY, accountsEnabled, hasStoredSession, safeNext, type OAuthProviderId } from "@/lib/account/config";
import { friendlyAuthError } from "@/lib/account/errors";
import {
  eraseAccountCopy,
  flushBeforeSignOut,
  forgetDeviceCopy,
  startSync,
  stopSync,
  subscribeSync,
  syncNow,
  syncStatus,
  type SyncStatus,
} from "@/lib/account/sync";
import { isSyncedKey } from "@/lib/account/syncRules";
import { isPlainObject } from "@/lib/storage";

export type AccountStatus = "off" | "loading" | "out" | "in";

export type Goal = "learn" | "interview" | "switch" | "upskill";
export type Experience = "beginner" | "intermediate" | "advanced";
export type TargetRole = "frontend" | "backend" | "fullstack" | "other";

export interface Profile {
  displayName: string;
  goal: Goal | null;
  experience: Experience | null;
  targetRole: TargetRole | null;
  plan: "free" | "pro";
  planExpiresAt: string | null;
}

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  providers: string[];
  createdAt: string;
  emailConfirmed: boolean;
}

export interface AccountState {
  status: AccountStatus;
  user: AccountUser | null;
  profile: Profile | null;
  recovery: boolean;
}

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

const SERVER_STATE: AccountState = { status: "loading", user: null, profile: null, recovery: false };

let state: AccountState = SERVER_STATE;
let booted = false;
let subscribed = false;
const listeners = new Set<() => void>();

function set(next: Partial<AccountState>) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function accountState(): AccountState {
  return state;
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );
}

const SERVER_SYNC: SyncStatus = { state: "off", lastSyncedAt: null, keys: 0, error: null };

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeSync, syncStatus, () => SERVER_SYNC);
}

function toUser(user: User): AccountUser {
  const meta = isPlainObject(user.user_metadata) ? user.user_metadata : {};
  const name =
    [meta.display_name, meta.full_name, meta.name, meta.user_name].find(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    ) ?? (user.email ?? "").split("@")[0];
  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers.filter((p: unknown): p is string => typeof p === "string")
    : [];
  return {
    id: user.id,
    email: user.email ?? "",
    name: name.trim().slice(0, 60),
    providers,
    createdAt: user.created_at,
    emailConfirmed: Boolean(user.email_confirmed_at),
  };
}

const GOALS: readonly string[] = ["learn", "interview", "switch", "upskill"];
const LEVELS: readonly string[] = ["beginner", "intermediate", "advanced"];
const ROLES: readonly string[] = ["frontend", "backend", "fullstack", "other"];

function toProfile(row: unknown, fallbackName: string): Profile {
  const r = isPlainObject(row) ? row : {};
  const pick = <T extends string>(value: unknown, allowed: readonly string[]): T | null =>
    typeof value === "string" && allowed.includes(value) ? (value as T) : null;
  return {
    displayName: typeof r.display_name === "string" && r.display_name.trim() ? r.display_name : fallbackName,
    goal: pick<Goal>(r.goal, GOALS),
    experience: pick<Experience>(r.experience, LEVELS),
    targetRole: pick<TargetRole>(r.target_role, ROLES),
    plan: r.plan === "pro" ? "pro" : "free",
    planExpiresAt: typeof r.plan_expires_at === "string" ? r.plan_expires_at : null,
  };
}

async function loadProfile(db: SupabaseClient, user: AccountUser) {
  const { data } = await db
    .from("profiles")
    .select("display_name, goal, experience, target_role, plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (state.user?.id === user.id) set({ profile: toProfile(data, user.name) });
}

function handleSession(db: SupabaseClient, event: AuthChangeEvent | "INITIAL", session: Session | null) {
  if (event === "PASSWORD_RECOVERY") set({ recovery: true });
  if (!session) {
    stopSync();
    set({ status: "out", user: null, profile: null, recovery: false });
    return;
  }
  const user = toUser(session.user);
  const changed = state.user?.id !== user.id;
  set({ status: "in", user, profile: changed ? null : state.profile });
  if (changed || event === "USER_UPDATED") void loadProfile(db, user);
  if (changed) void startSync(db, user.id);
}

async function connect(): Promise<SupabaseClient | null> {
  const db = await accountClient();
  if (!db) {
    set({ status: accountsEnabled() ? "out" : "off" });
    return null;
  }
  if (!subscribed) {
    subscribed = true;
    db.auth.onAuthStateChange((event, session) => {
      setTimeout(() => handleSession(db, event, session), 0);
    });
    const { data } = await db.auth.getSession();
    handleSession(db, "INITIAL", data.session);
  }
  return db;
}

function urlCarriesAuth(): boolean {
  const { search, hash, pathname } = window.location;
  return pathname.startsWith("/auth/") || /[?&#](code|access_token|error_description|token_hash)=/.test(search + hash);
}

export function bootAccount(): void {
  if (booted || typeof window === "undefined") return;
  booted = true;
  if (!accountsEnabled()) {
    set({ status: "off" });
    return;
  }
  if (!hasStoredSession() && !urlCarriesAuth()) {
    set({ status: "out" });
    return;
  }
  void connect();
}

export function connectAccount(): Promise<SupabaseClient | null> {
  booted = true;
  return connect();
}

function callbackUrl(next: string, flow?: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", safeNext(next));
  if (flow) url.searchParams.set("flow", flow);
  return url.toString();
}

async function withClient<T>(run: (db: SupabaseClient) => Promise<Result<T>>): Promise<Result<T>> {
  const db = await connect();
  if (!db) return { ok: false, error: "Accounts are not available right now. Try again in a minute." };
  try {
    return await run(db);
  } catch (error) {
    return { ok: false, error: friendlyAuthError(error) };
  }
}

export function signInWithPassword(email: string, password: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function signUpWithPassword(
  name: string,
  email: string,
  password: string,
  next: string
): Promise<Result<{ confirm: boolean }>> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: callbackUrl(next), data: { display_name: name.trim().slice(0, 60) } },
    });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    return { ok: true, value: { confirm: !data.session } };
  });
}

export function sendMagicLink(email: string, next: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true },
    });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function verifyEmailCode(email: string, code: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export type OAuthProvider = OAuthProviderId;

export function signInWithProvider(provider: OAuthProvider, next: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithOAuth({ provider, options: { redirectTo: callbackUrl(next) } });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function sendPasswordReset(email: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl("/account", "recovery"),
    });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function updatePassword(password: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.updateUser({ password });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    set({ recovery: false });
    return { ok: true, value: undefined };
  });
}

export interface ProfilePatch {
  displayName?: string;
  goal?: Goal | null;
  experience?: Experience | null;
  targetRole?: TargetRole | null;
}

export function updateProfile(patch: ProfilePatch): Promise<Result> {
  return withClient(async (db) => {
    const user = state.user;
    if (!user) return { ok: false, error: "Sign in first." };
    const row: Record<string, unknown> = {};
    if (patch.displayName !== undefined) row.display_name = patch.displayName.trim().slice(0, 60);
    if (patch.goal !== undefined) row.goal = patch.goal;
    if (patch.experience !== undefined) row.experience = patch.experience;
    if (patch.targetRole !== undefined) row.target_role = patch.targetRole;
    const { error } = await db.from("profiles").update(row).eq("id", user.id);
    if (error) return { ok: false, error: friendlyAuthError(error) };
    await loadProfile(db, user);
    return { ok: true, value: undefined };
  });
}

export function syncAccountNow(): Promise<void> {
  return syncNow();
}

export function signOut(options: { clearDevice?: boolean; everywhere?: boolean } = {}): Promise<Result> {
  return withClient(async (db) => {
    await flushBeforeSignOut();
    const { error } = await db.auth.signOut({ scope: options.everywhere ? "global" : "local" });
    if (error) await db.auth.signOut({ scope: "local" });
    stopSync();
    if (options.clearDevice) forgetDeviceCopy();
    set({ status: "out", user: null, profile: null, recovery: false });
    return { ok: true, value: undefined };
  });
}

export function eraseSavedProgress(): Promise<Result> {
  return withClient(async (db) => {
    const user = state.user;
    if (!user) return { ok: false, error: "Sign in first." };
    stopSync();
    await eraseAccountCopy(db, user.id);
    forgetDeviceCopy();
    await startSync(db, user.id);
    return { ok: true, value: undefined };
  });
}

export function deleteAccount(): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.rpc("delete_my_account");
    if (error) return { ok: false, error: friendlyAuthError(error) };
    stopSync();
    await db.auth.signOut({ scope: "local" });
    try {
      localStorage.removeItem(SYNC_META_KEY);
    } catch {}
    set({ status: "out", user: null, profile: null, recovery: false });
    return { ok: true, value: undefined };
  });
}

export function exportMyData(): string {
  const saved: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null || !isSyncedKey(key)) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        saved[key] = JSON.parse(raw);
      } catch {}
    }
  } catch {}
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: state.user ? { email: state.user.email, createdAt: state.user.createdAt } : null,
      profile: state.profile,
      saved,
    },
    null,
    2
  );
}
