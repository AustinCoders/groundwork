export const AUTH_STORAGE_KEY = "gw-auth";
export const SYNC_META_KEY = "gw-sync";
export const OPEN_AUTH_EVENT = "groundwork:open-auth";

export type AuthMode = "sign-in" | "sign-up" | "magic" | "forgot" | "welcome";

export type OAuthProviderId = "google" | "github";

export interface AccountConfig {
  url: string;
  key: string;
}

export function accountConfig(): AccountConfig | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
  if (!url || !key || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url)) return null;
  return { url, key };
}

export function accountsEnabled(): boolean {
  return accountConfig() !== null;
}

export function authProviders(): OAuthProviderId[] {
  const raw = process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "";
  const found = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part): part is OAuthProviderId => part === "google" || part === "github");
  return [...new Set(found)];
}

export function accountOrigin(): string {
  return accountConfig()?.url ?? "";
}

export function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function safeNext(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  for (let i = 0; i < value.length; i++) {
    if (value.charCodeAt(i) < 32) return fallback;
  }
  if (value.startsWith("/auth")) return fallback;
  return value.slice(0, 500);
}

export function openAuth(mode: AuthMode = "sign-in", next?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_AUTH_EVENT, { detail: { mode, next } }));
}
