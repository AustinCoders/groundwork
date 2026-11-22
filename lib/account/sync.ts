import type { SupabaseClient } from "@supabase/supabase-js";
import { SYNC_META_KEY } from "@/lib/account/config";
import { MAX_SYNCED_CHARS, isSyncedKey, mergeValues, sameJson, syncStrategy, type Side } from "@/lib/account/syncRules";
import { announceStoredChanges, isPlainObject } from "@/lib/storage";

export type SyncState = "off" | "idle" | "syncing" | "error" | "offline";

export interface SyncStatus {
  state: SyncState;
  lastSyncedAt: number | null;
  keys: number;
  error: string | null;
}

interface SyncMeta {
  user: string | null;
  at: Record<string, number>;
  pulledAt: number;
}

interface RemoteRow {
  key: string;
  value: unknown;
  client_at: number;
}

const SCAN_EVERY_MS = 5000;
const PULL_AFTER_MS = 60_000;
const PAGE = 1000;
const BATCH = 50;

let client: SupabaseClient | null = null;
let userId: string | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let queue: Promise<void> = Promise.resolve();
const lastSeen = new Map<string, string>();
const dirty = new Set<string>();
const rejected = new Set<string>();
let status: SyncStatus = { state: "off", lastSyncedAt: null, keys: 0, error: null };
const listeners = new Set<() => void>();

function setStatus(next: Partial<SyncStatus>) {
  status = { ...status, ...next };
  listeners.forEach((fn) => fn());
}

export function syncStatus(): SyncStatus {
  return status;
}

export function subscribeSync(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isPlainObject(parsed) && isPlainObject(parsed.at)) {
      const at: Record<string, number> = {};
      for (const [key, value] of Object.entries(parsed.at)) {
        if (typeof value === "number" && Number.isFinite(value) && value > 0) at[key] = value;
      }
      return {
        user: typeof parsed.user === "string" ? parsed.user : null,
        at,
        pulledAt: typeof parsed.pulledAt === "number" ? parsed.pulledAt : 0,
      };
    }
  } catch {}
  return { user: null, at: {}, pulledAt: 0 };
}

function writeMeta(meta: SyncMeta) {
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
  } catch {}
}

function localKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null && isSyncedKey(key)) keys.push(key);
    }
  } catch {}
  return keys;
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse(raw: string | null): { ok: true; value: unknown } | { ok: false } {
  if (raw === null) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}

function serial(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task, task);
  return queue;
}

function describe(error: unknown): string {
  if (isPlainObject(error) && typeof error.message === "string") return error.message;
  return error instanceof Error ? error.message : "Sync failed";
}

async function fetchRemote(db: SupabaseClient): Promise<RemoteRow[]> {
  const rows: RemoteRow[] = [];
  for (let from = 0; from < 10 * PAGE; from += PAGE) {
    const { data, error } = await db
      .from("user_state")
      .select("key, value, client_at")
      .order("key")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const page = (data ?? []) as RemoteRow[];
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

async function pushKeys(db: SupabaseClient, user: string, keys: string[], meta: SyncMeta): Promise<void> {
  const rows: { user_id: string; key: string; value: unknown; client_at: number }[] = [];
  for (const key of keys) {
    if (rejected.has(key)) continue;
    const raw = readRaw(key);
    if (raw === null || raw.length > MAX_SYNCED_CHARS) continue;
    const parsed = parse(raw);
    if (!parsed.ok || parsed.value === undefined) continue;
    const at = meta.at[key] ?? Date.now();
    meta.at[key] = at;
    rows.push({ user_id: user, key, value: parsed.value, client_at: Math.floor(at) });
  }
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await db.from("user_state").upsert(batch, { onConflict: "user_id,key" });
    if (!error) continue;
    let lastError: unknown = error;
    let saved = 0;
    for (const row of batch) {
      const single = await db.from("user_state").upsert(row, { onConflict: "user_id,key" });
      if (!single.error) {
        saved++;
        continue;
      }
      lastError = single.error;
      if (single.error.code === "23514") rejected.add(row.key);
    }
    if (saved === 0 && batch.some((row) => !rejected.has(row.key))) throw lastError;
  }
}

function writeLocal(key: string, raw: string): boolean {
  try {
    localStorage.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
}

function removeLocal(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

async function pull(db: SupabaseClient, user: string): Promise<void> {
  const meta = readMeta();
  const foreign = meta.user !== null && meta.user !== user;
  if (foreign) meta.at = {};
  meta.user = user;
  const rows = await fetchRemote(db);
  const remote = new Map<string, RemoteRow>();
  for (const row of rows) if (isSyncedKey(row.key)) remote.set(row.key, row);
  const changed: string[] = [];
  const toPush: string[] = [];
  const keys = new Set([...localKeys(), ...remote.keys()]);
  for (const key of keys) {
    const strategy = syncStrategy(key);
    if (!strategy) continue;
    const localRaw = readRaw(key);
    const remoteRow = remote.get(key) ?? null;
    if (foreign && !remoteRow) {
      if (localRaw !== null) {
        removeLocal(key);
        changed.push(key);
      }
      lastSeen.delete(key);
      delete meta.at[key];
      continue;
    }
    const parsed = foreign ? ({ ok: false } as const) : parse(localRaw);
    const local: Side | null = parsed.ok ? { value: parsed.value, at: meta.at[key] ?? 0 } : null;
    const remoteSide: Side | null = remoteRow ? { value: remoteRow.value, at: Number(remoteRow.client_at) || 0 } : null;
    const merged = mergeValues(strategy, local, remoteSide);
    if (merged === undefined) continue;
    const mergedRaw = JSON.stringify(merged);
    if (mergedRaw.length > MAX_SYNCED_CHARS) continue;
    if (mergedRaw !== localRaw && writeLocal(key, mergedRaw)) changed.push(key);
    if (remoteSide !== null && sameJson(merged, remoteSide.value)) meta.at[key] = remoteSide.at || Date.now();
    else {
      meta.at[key] = Date.now();
      toPush.push(key);
    }
    lastSeen.set(key, readRaw(key) ?? mergedRaw);
    dirty.delete(key);
  }
  meta.pulledAt = Date.now();
  writeMeta(meta);
  if (toPush.length) await pushKeys(db, user, toPush, meta);
  writeMeta(meta);
  announceStoredChanges(changed);
}

function scan(): string[] {
  const meta = readMeta();
  const now = Date.now();
  let touched = false;
  for (const key of localKeys()) {
    const raw = readRaw(key);
    if (raw === null) continue;
    if (lastSeen.get(key) !== raw) {
      lastSeen.set(key, raw);
      meta.at[key] = now;
      dirty.add(key);
      touched = true;
    }
  }
  if (touched) writeMeta(meta);
  return [...dirty];
}

function flush(): Promise<void> {
  return serial(async () => {
    const db = client;
    const user = userId;
    if (!db || !user) return;
    const keys = scan();
    if (keys.length === 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus({ state: "offline" });
      return;
    }
    setStatus({ state: "syncing" });
    try {
      const meta = readMeta();
      await pushKeys(db, user, keys, meta);
      writeMeta(meta);
      keys.forEach((key) => dirty.delete(key));
      setStatus({ state: "idle", lastSyncedAt: Date.now(), keys: localKeys().length, error: null });
    } catch (error) {
      setStatus({ state: "error", error: describe(error) });
    }
  });
}

export function syncNow(): Promise<void> {
  return serial(async () => {
    const db = client;
    const user = userId;
    if (!db || !user) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus({ state: "offline" });
      return;
    }
    setStatus({ state: "syncing" });
    try {
      scan();
      await pull(db, user);
      setStatus({ state: "idle", lastSyncedAt: Date.now(), keys: localKeys().length, error: null });
    } catch (error) {
      setStatus({ state: "error", error: describe(error) });
    }
  });
}

function onVisibility() {
  if (document.visibilityState === "hidden") {
    void flush();
    return;
  }
  if (Date.now() - readMeta().pulledAt > PULL_AFTER_MS) void syncNow();
  else void flush();
}

function onOnline() {
  void syncNow();
}

function onPageHide() {
  void flush();
}

export function startSync(db: SupabaseClient, user: string): Promise<void> {
  if (client === db && userId === user && timer !== null) return queue;
  stopSync();
  client = db;
  userId = user;
  lastSeen.clear();
  dirty.clear();
  rejected.clear();
  timer = setInterval(() => {
    if (document.visibilityState === "visible") void flush();
  }, SCAN_EVERY_MS);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", onOnline);
  window.addEventListener("pagehide", onPageHide);
  return syncNow();
}

export function stopSync() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
  if (typeof window !== "undefined") {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("pagehide", onPageHide);
  }
  client = null;
  userId = null;
  dirty.clear();
  setStatus({ state: "off", error: null });
}

export async function flushBeforeSignOut(): Promise<void> {
  await flush();
}

export function forgetDeviceCopy(): void {
  const keys = localKeys();
  keys.forEach(removeLocal);
  removeLocal(SYNC_META_KEY);
  lastSeen.clear();
  announceStoredChanges(keys);
}

export async function eraseAccountCopy(db: SupabaseClient, user: string): Promise<void> {
  await serial(async () => {
    const { error } = await db.from("user_state").delete().eq("user_id", user);
    if (error) throw error;
    const meta = readMeta();
    meta.at = {};
    meta.pulledAt = 0;
    writeMeta(meta);
    lastSeen.clear();
  });
}
