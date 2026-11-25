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
import { extrasToMetadata, readExtras, type EditableExtras, type ProfileExtras } from "@/lib/account/profileExtras";
import { isSyncedKey } from "@/lib/account/syncRules";
import { isPlainObject } from "@/lib/storage";

export type AccountStatus = "off" | "loading" | "out" | "in";

export type Goal = "learn" | "interview" | "switch" | "upskill";
export type Experience = "beginner" | "intermediate" | "advanced";
export type TargetRole = "frontend" | "backend" | "fullstack" | "other";

export interface EmailPrefs {
  weekly: boolean;
  plan: boolean;
  news: boolean;
}

export interface Profile {
  displayName: string;
  goal: Goal | null;
  experience: Experience | null;
  targetRole: TargetRole | null;
  plan: "free" | "pro";
  planExpiresAt: string | null;
  username: string | null;
  isPublic: boolean;
  publicAt: string | null;
  emails: EmailPrefs | null;
}

export interface AccountUser {
  id: string;
  email: string;
  name: string;
  providers: string[];
  createdAt: string;
  emailConfirmed: boolean;
  extras: ProfileExtras;
}

export type MfaState = "none" | "needed" | "on";

export interface AccountState {
  status: AccountStatus;
  user: AccountUser | null;
  profile: Profile | null;
  recovery: boolean;
  mfa: MfaState;
  photo: string | null;
}

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

const SERVER_STATE: AccountState = {
  status: "loading",
  user: null,
  profile: null,
  recovery: false,
  mfa: "none",
  photo: null,
};

const AVATAR_BUCKET = "avatars";
const PHOTO_SECONDS = 60 * 60 * 24 * 7;
let photoFor: string | null = null;

let state: AccountState = SERVER_STATE;
let booted = false;
let subscribed = false;
let syncingFor: string | null = null;
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
    extras: readExtras(meta),
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
    username: typeof r.username === "string" && r.username ? r.username : null,
    isPublic: r.is_public === true,
    publicAt: typeof r.public_at === "string" ? r.public_at : null,
    emails:
      typeof r.email_weekly === "boolean"
        ? { weekly: r.email_weekly, plan: r.email_plan === true, news: r.email_news === true }
        : null,
  };
}

const PROFILE_COLUMNS = "display_name, goal, experience, target_role, plan, plan_expires_at";
const PROFILE_PLUS_COLUMNS = `${PROFILE_COLUMNS}, username, is_public, public_at, email_weekly, email_plan, email_news`;

async function loadProfile(db: SupabaseClient, user: AccountUser) {
  const plus = await db.from("profiles").select(PROFILE_PLUS_COLUMNS).eq("id", user.id).maybeSingle();
  const { data } = plus.error
    ? await db.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle()
    : plus;
  if (state.user?.id === user.id) set({ profile: toProfile(data, user.name) });
}

export function reloadProfile(): Promise<void> {
  return withClient(async (db) => {
    if (state.user) await loadProfile(db, state.user);
    return { ok: true, value: undefined };
  }).then(() => undefined);
}

async function mfaState(db: SupabaseClient): Promise<MfaState> {
  try {
    const { data } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (!data || data.nextLevel !== "aal2") return "none";
    return data.currentLevel === "aal2" ? "on" : "needed";
  } catch {
    return "none";
  }
}

async function loadPhoto(db: SupabaseClient, user: AccountUser) {
  const path = user.extras.avatarPath;
  photoFor = path;
  if (!path || !path.startsWith(`${user.id}/`)) {
    set({ photo: null });
    return;
  }
  const { data } = await db.storage.from(AVATAR_BUCKET).createSignedUrl(path, PHOTO_SECONDS);
  if (photoFor === path && state.user?.id === user.id) set({ photo: data?.signedUrl ?? null });
}

async function clearPhotos(db: SupabaseClient, userId: string, keep?: string): Promise<boolean> {
  try {
    const listed = await db.storage.from(AVATAR_BUCKET).list(userId, { limit: 100 });
    if (listed.error) return false;
    const stale = (listed.data ?? []).map((file) => `${userId}/${file.name}`).filter((path) => path !== keep);
    if (!stale.length) return true;
    const removed = await db.storage.from(AVATAR_BUCKET).remove(stale);
    return !removed.error;
  } catch {
    return false;
  }
}

async function handleSession(db: SupabaseClient, event: AuthChangeEvent | "INITIAL", session: Session | null) {
  if (event === "PASSWORD_RECOVERY") set({ recovery: true });
  if (!session) {
    stopSync();
    syncingFor = null;
    photoFor = null;
    set({ status: "out", user: null, profile: null, recovery: false, mfa: "none", photo: null });
    return;
  }
  const user = toUser(session.user);
  const mfa = await mfaState(db);
  const changed = state.user?.id !== user.id;
  set({ status: "in", user, mfa, profile: changed ? null : state.profile });
  if (mfa === "needed") {
    if (syncingFor) stopSync();
    syncingFor = null;
    return;
  }
  if (photoFor !== user.extras.avatarPath) void loadPhoto(db, user);
  const fresh = syncingFor !== user.id;
  if (changed || fresh || event === "USER_UPDATED") void loadProfile(db, user);
  if (fresh) {
    syncingFor = user.id;
    void startSync(db, user.id);
  }
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
      setTimeout(() => void handleSession(db, event, session), 0);
    });
    const { data } = await db.auth.getSession();
    await handleSession(db, "INITIAL", data.session);
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

export type EmailStatus =
  | { status: "none" }
  | { status: "exists"; password: boolean; confirmed: boolean; providers: ("email" | "google" | "github")[] }
  | { status: "unknown" };

const EMAIL_PROVIDERS = ["email", "google", "github"] as const;

export function readEmailStatus(value: unknown): EmailStatus {
  if (!isPlainObject(value)) return { status: "unknown" };
  if (value.status === "none") return { status: "none" };
  if (value.status !== "exists") return { status: "unknown" };
  const providers = Array.isArray(value.providers)
    ? EMAIL_PROVIDERS.filter((provider) => (value.providers as unknown[]).includes(provider))
    : [];
  return { status: "exists", password: value.password === true, confirmed: value.confirmed !== false, providers };
}

export async function emailStatus(email: string): Promise<EmailStatus> {
  try {
    const db = await connect();
    if (!db) return { status: "unknown" };
    const { data, error } = await db.rpc("email_status", { address: email.trim() });
    return error ? { status: "unknown" } : readEmailStatus(data);
  } catch {
    return { status: "unknown" };
  }
}

export function signInWithPassword(email: string, password: string, captchaToken?: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithPassword({ email: email.trim(), password, options: { captchaToken } });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function signUpWithPassword(
  name: string,
  email: string,
  password: string,
  next: string,
  captchaToken?: string
): Promise<Result<{ confirm: boolean; taken: boolean }>> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: callbackUrl(next),
        data: { display_name: name.trim().slice(0, 60) },
        captchaToken,
      },
    });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    const taken = !data.session && Array.isArray(data.user?.identities) && data.user.identities.length === 0;
    return { ok: true, value: { confirm: !data.session && !taken, taken } };
  });
}

export function resendSignupEmail(email: string, next: string, captchaToken?: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(next), captchaToken },
    });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function sendMagicLink(email: string, next: string, captchaToken?: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true, captchaToken },
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

export function verifySignupCode(email: string, code: string): Promise<Result> {
  return withClient(async (db) => {
    const first = await db.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (!first.error) return { ok: true, value: undefined };
    const second = await db.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "signup" });
    return second.error ? { ok: false, error: friendlyAuthError(first.error) } : { ok: true, value: undefined };
  });
}

export type OAuthProvider = OAuthProviderId;

export function signInWithProvider(provider: OAuthProvider, next: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.signInWithOAuth({ provider, options: { redirectTo: callbackUrl(next) } });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function sendPasswordReset(email: string, captchaToken?: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl("/account", "recovery"),
      captchaToken,
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

export function changeEmail(email: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.updateUser({ email: email.trim() }, { emailRedirectTo: callbackUrl("/account") });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export interface LinkedIdentity {
  provider: string;
  email: string | null;
}

export function linkedIdentities(): Promise<Result<LinkedIdentity[]>> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.getUserIdentities();
    if (error) return { ok: false, error: friendlyAuthError(error) };
    return {
      ok: true,
      value: (data?.identities ?? []).map((identity) => ({
        provider: identity.provider,
        email: typeof identity.identity_data?.email === "string" ? identity.identity_data.email : null,
      })),
    };
  });
}

export function linkProvider(provider: OAuthProvider): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.linkIdentity({ provider, options: { redirectTo: callbackUrl("/account") } });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function unlinkProvider(provider: string): Promise<Result> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.getUserIdentities();
    if (error) return { ok: false, error: friendlyAuthError(error) };
    const identities = data?.identities ?? [];
    if (identities.length < 2) return { ok: false, error: "Keep at least one way to sign in." };
    const identity = identities.find((item) => item.provider === provider);
    if (!identity) return { ok: true, value: undefined };
    const unlinked = await db.auth.unlinkIdentity(identity);
    if (unlinked.error) return { ok: false, error: friendlyAuthError(unlinked.error) };
    await db.auth.refreshSession();
    return { ok: true, value: undefined };
  });
}

export interface TotpEnrollment {
  factorId: string;
  qr: string;
  secret: string;
  uri: string | null;
}

export interface TotpFactor {
  id: string;
  createdAt: string;
}

export function totpFactors(): Promise<Result<TotpFactor[]>> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.mfa.listFactors();
    if (error) return { ok: false, error: friendlyAuthError(error) };
    return { ok: true, value: (data?.totp ?? []).map((f) => ({ id: f.id, createdAt: f.created_at })) };
  });
}

function qrDataUrl(raw: string): string {
  let svg = raw;
  while (svg.startsWith("data:")) svg = svg.slice(svg.indexOf(",") + 1);
  let text = svg;
  try {
    text = decodeURIComponent(svg);
  } catch {}
  return `data:image/svg+xml,${encodeURIComponent(text)}`;
}

export function startTotp(): Promise<Result<TotpEnrollment>> {
  return withClient(async (db) => {
    const listed = await db.auth.mfa.listFactors();
    for (const factor of listed.data?.all ?? []) {
      if (factor.status !== "verified") await db.auth.mfa.unenroll({ factorId: factor.id });
    }
    const { data, error } = await db.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Groundwork",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}`,
    });
    if (error || !data) return { ok: false, error: friendlyAuthError(error) };
    const uri = typeof data.totp.uri === "string" && data.totp.uri.startsWith("otpauth://totp/") ? data.totp.uri : null;
    return {
      ok: true,
      value: { factorId: data.id, qr: qrDataUrl(data.totp.qr_code), secret: data.totp.secret, uri },
    };
  });
}

export function confirmTotp(factorId: string, code: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true, value: undefined };
  });
}

export function verifyTotpSignIn(code: string): Promise<Result> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.mfa.listFactors();
    if (error) return { ok: false, error: friendlyAuthError(error) };
    const factor = data?.totp[0];
    if (!factor) return { ok: false, error: "No authenticator app is set up on this account." };
    const verified = await db.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.trim() });
    return verified.error ? { ok: false, error: friendlyAuthError(verified.error) } : { ok: true, value: undefined };
  });
}

export function removeTotp(factorId: string): Promise<Result> {
  return withClient(async (db) => {
    const { error } = await db.auth.mfa.unenroll({ factorId });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    await db.auth.refreshSession();
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

export function updateProfileExtras(extras: EditableExtras): Promise<Result> {
  return withClient(async (db) => {
    const { data, error } = await db.auth.updateUser({ data: extrasToMetadata(extras) });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    if (data.user && state.user?.id === data.user.id) set({ user: toUser(data.user) });
    return { ok: true, value: undefined };
  });
}

export function uploadAvatar(image: Blob): Promise<Result> {
  return withClient(async (db) => {
    const user = state.user;
    if (!user) return { ok: false, error: "Sign in first." };
    if (image.size > 512 * 1024) return { ok: false, error: "That picture is still too large. Try a smaller one." };
    const webp = image.type === "image/webp";
    const path = `${user.id}/avatar-${Date.now()}.${webp ? "webp" : "jpg"}`;
    const send = () =>
      db.storage.from(AVATAR_BUCKET).upload(path, image, {
        contentType: webp ? "image/webp" : "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });
    let uploaded = await send();
    if (uploaded.error && (await clearPhotos(db, user.id, user.extras.avatarPath))) uploaded = await send();
    if (uploaded.error) return { ok: false, error: "Could not upload the picture. Try again in a moment." };
    const { data, error } = await db.auth.updateUser({ data: { avatar_path: path } });
    if (error) {
      await db.storage.from(AVATAR_BUCKET).remove([path]);
      return { ok: false, error: friendlyAuthError(error) };
    }
    await clearPhotos(db, user.id, path);
    if (data.user) {
      const next = toUser(data.user);
      set({ user: next });
      await loadPhoto(db, next);
    }
    return { ok: true, value: undefined };
  });
}

export function removeAvatar(): Promise<Result> {
  return withClient(async (db) => {
    const user = state.user;
    if (!user) return { ok: false, error: "Sign in first." };
    if (!(await clearPhotos(db, user.id))) {
      return { ok: false, error: "Could not delete the photo just now. Try again in a moment." };
    }
    const { data, error } = await db.auth.updateUser({ data: { avatar_path: "" } });
    if (error) return { ok: false, error: friendlyAuthError(error) };
    if (data.user) set({ user: toUser(data.user), photo: null });
    photoFor = "";
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
    syncingFor = null;
    set({ status: "out", user: null, profile: null, recovery: false, mfa: "none", photo: null });
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
    if (state.user && !(await clearPhotos(db, state.user.id))) {
      return { ok: false, error: "Could not delete your photo first, so the account was kept. Try again in a moment." };
    }
    const { error } = await db.rpc("delete_my_account");
    if (error) return { ok: false, error: friendlyAuthError(error) };
    stopSync();
    await db.auth.signOut({ scope: "local" });
    try {
      localStorage.removeItem(SYNC_META_KEY);
    } catch {}
    syncingFor = null;
    set({ status: "out", user: null, profile: null, recovery: false, mfa: "none", photo: null });
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
