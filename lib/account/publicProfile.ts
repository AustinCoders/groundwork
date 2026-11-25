import type { PublicCard } from "@/lib/profile/publicCard";
import { usernameProblem } from "@/lib/profile/publicCard";
import { friendlyAuthError } from "./errors";
import { connectAccount, reloadProfile, type EmailPrefs } from "./session";

export type Done = { ok: true } | { ok: false; error: string };

const NOT_READY = "This part of your account is still being switched on. Try again in a little while.";

function problemOf(error: { code?: string; message?: string } | null): string | null {
  if (!error) return null;
  if (error.code === "23505") return "That username is taken. Try another.";
  if (error.message?.includes("username_reserved")) return "That one is reserved. Try another.";
  if (error.code === "23514") return "That is not allowed. Check the username and try again.";
  if (error.code === "42703" || error.code === "PGRST204") return NOT_READY;
  return friendlyAuthError(error);
}

async function updateOwn(row: Record<string, unknown>): Promise<Done> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data: auth } = await db.auth.getUser();
  const id = auth.user?.id;
  if (!id) return { ok: false, error: "Sign in first." };
  const { error } = await db.from("profiles").update(row).eq("id", id);
  const problem = problemOf(error);
  if (problem) return { ok: false, error: problem };
  await reloadProfile();
  return { ok: true };
}

export async function saveUsername(value: string): Promise<Done> {
  const name = value.trim().toLowerCase();
  const problem = usernameProblem(name);
  if (problem) return { ok: false, error: problem };
  return updateOwn({ username: name });
}

export function publishPublicCard(card: PublicCard): Promise<Done> {
  return updateOwn({ is_public: true, public_card: card });
}

export function hidePublicCard(): Promise<Done> {
  return updateOwn({ is_public: false, public_card: null });
}

export function saveEmailPrefs(prefs: EmailPrefs): Promise<Done> {
  return updateOwn({ email_weekly: prefs.weekly, email_plan: prefs.plan, email_news: prefs.news });
}
