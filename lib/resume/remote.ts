import { connectAccount } from "@/lib/account/session";
import type { Extracted } from "./extract";
import { trimRead } from "./request";
import type { ResumeAnalysis } from "./types";

export class RemoteError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function looksLikeAnalysis(value: unknown): value is ResumeAnalysis {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ResumeAnalysis>;
  return item.version === 1 && Array.isArray(item.questions) && Array.isArray(item.fixes) && !!item.parsed;
}

export async function analyseOnServer(read: Extracted, jd: string): Promise<ResumeAnalysis> {
  const db = await connectAccount();
  if (!db) throw new RemoteError("Accounts are not available right now.", 503);
  const { data } = await db.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new RemoteError("Sign in to see the result.", 401);
  let res: Response;
  try {
    res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ read: trimRead(read), jd }),
      cache: "no-store",
    });
  } catch {
    throw new RemoteError("Could not reach Groundwork. Check your connection and try again.", 0);
  }
  const body: unknown = await res.json().catch(() => null);
  const error = body && typeof body === "object" ? (body as { error?: unknown }).error : null;
  if (!res.ok) {
    throw new RemoteError(
      typeof error === "string" ? error : "Could not check the resume. Try again in a moment.",
      res.status
    );
  }
  const analysis = body && typeof body === "object" ? (body as { analysis?: unknown }).analysis : null;
  if (!looksLikeAnalysis(analysis)) throw new RemoteError("The result came back incomplete. Try again.", 502);
  return analysis;
}
