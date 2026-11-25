import { friendlyAuthError } from "./errors";
import { connectAccount } from "./session";

export type BackupResult<T> = { ok: true; value: T } | { ok: false; error: string };

const CODE = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;

export function cleanBackupCode(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
}

export function formatBackupCode(value: string): string {
  const clean = cleanBackupCode(value);
  return [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8, 12)].filter(Boolean).join("-");
}

export function backupCodesText(codes: string[], email: string, when: Date): string {
  return [
    "Groundwork backup codes",
    `Account: ${email}`,
    `Made: ${when.toISOString().slice(0, 10)}`,
    "",
    "Each code works once. Use one if you lose your authenticator app.",
    "Using a code switches two-step sign-in off so you can set it up again.",
    "",
    ...codes.map((code, i) => `${String(i + 1).padStart(2, " ")}. ${code}`),
    "",
  ].join("\n");
}

function problem(error: { code?: string; message?: string }): string {
  if (error.code === "PGRST202" || error.code === "42883")
    return "Backup codes are still being switched on. Try again in a little while.";
  if (error.message?.includes("second_step"))
    return "Sign in with your authenticator code first, then make backup codes.";
  if (error.message?.includes("signed_out")) return "Sign in first.";
  return friendlyAuthError(error);
}

export async function createBackupCodes(): Promise<BackupResult<string[]>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.rpc("create_backup_codes");
  if (error) return { ok: false, error: problem(error) };
  const codes = Array.isArray(data) ? data.filter((c): c is string => typeof c === "string" && CODE.test(c)) : [];
  if (codes.length !== 10) return { ok: false, error: "Something went wrong. Try again." };
  return { ok: true, value: codes };
}

export async function backupCodesLeft(): Promise<BackupResult<number | null>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.rpc("backup_codes_left");
  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") return { ok: true, value: null };
    return { ok: false, error: problem(error) };
  }
  return { ok: true, value: typeof data === "number" && data >= 0 ? Math.min(10, Math.floor(data)) : 0 };
}

export async function redeemBackupCode(code: string): Promise<BackupResult<null>> {
  const clean = cleanBackupCode(code);
  if (clean.length !== 12)
    return { ok: false, error: "A backup code has 12 letters and numbers in three groups of four." };
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.rpc("use_backup_code", { code: clean });
  if (error) return { ok: false, error: problem(error) };
  const status = data && typeof data === "object" && "status" in data ? String(data.status) : "";
  if (status === "limit") return { ok: false, error: "Too many tries. Wait an hour and try again." };
  if (status !== "used") return { ok: false, error: "That code is not right, or it was already used." };
  try {
    sessionStorage.setItem(BACKUP_USED_KEY, "1");
  } catch {}
  await db.auth.refreshSession();
  return { ok: true, value: null };
}

export const BACKUP_USED_KEY = "gw:backup-used";
