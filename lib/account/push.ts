import { isPlainObject } from "@/lib/storage";
import { friendlyAuthError } from "./errors";
import { connectAccount } from "./session";

export const VAPID_PUBLIC_KEY =
  "BHfgSxw9cbw-PCOkW3Wix-4y8ojkaty8bZ77YD1nN4yoOJ-E0D22ipapRte94FAJR4w-hfD-_c3ZwBrWmxFlxBU";

export interface PushPrefs {
  mocks: boolean;
  goal: boolean;
  news: boolean;
}

export type PushState =
  { kind: "unsupported"; ios: boolean } | { kind: "blocked" } | { kind: "off" } | { kind: "on"; prefs: PushPrefs };

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
  );
}

export function isIos(): boolean {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  return existing ?? navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

function zone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return { kind: "unsupported", ios: isIos() && !isStandalone() };
  if (Notification.permission === "denied") return { kind: "blocked" };
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return { kind: "off" };
  const db = await connectAccount();
  if (!db) return { kind: "off" };
  const { data } = await db.rpc("push_get", { endpoint: sub.endpoint });
  if (!isPlainObject(data)) return { kind: "off" };
  return { kind: "on", prefs: { mocks: data.mocks !== false, goal: data.goal !== false, news: data.news !== false } };
}

export async function turnOnPush(prefs: PushPrefs): Promise<{ ok: boolean; error?: string }> {
  if (!pushSupported()) return { ok: false, error: "This browser cannot show notifications." };
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    return { ok: false, error: "Notifications are blocked for this site in your browser settings." };
  try {
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }));
    return await savePush(sub, prefs);
  } catch {
    return { ok: false, error: "Could not turn on notifications on this device. Try again." };
  }
}

export async function savePush(sub: PushSubscription, prefs: PushPrefs): Promise<{ ok: boolean; error?: string }> {
  const json = sub.toJSON();
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { error } = await db.rpc("push_save", {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
    tz: zone(),
    mocks: prefs.mocks,
    goal: prefs.goal,
    news: prefs.news,
  });
  return error ? { ok: false, error: friendlyAuthError(error) } : { ok: true };
}

export async function updatePush(prefs: PushPrefs): Promise<{ ok: boolean; error?: string }> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return { ok: false, error: "Notifications are off on this device." };
  return savePush(sub, prefs);
}

export async function turnOffPush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  const db = await connectAccount();
  if (db) await db.rpc("push_drop", { endpoint: sub.endpoint });
  await sub.unsubscribe();
}
