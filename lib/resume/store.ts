import { connectAccount } from "@/lib/account/session";
import { isPlainObject } from "@/lib/storage";
import type { ResumeAnalysis } from "./types";

export type Mark = "known" | "fixed";
export type Marks = Record<string, Mark>;

export interface SavedResume {
  id: string;
  title: string;
  createdAt: string;
}

export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_MARKS = 600;

export const MAX_SAVED = 5;

function failure(error: unknown, fallback: string): { ok: false; error: string } {
  const message = isPlainObject(error) && typeof error.message === "string" ? error.message : "";
  if (/resume_limit/.test(message)) {
    return { ok: false, error: `You can keep ${MAX_SAVED} resumes. Delete one before saving another.` };
  }
  if (/insufficient_aal|row-level security/i.test(message)) {
    return { ok: false, error: "Enter the code from your authenticator app first, then try again." };
  }
  if (/failed to fetch|network/i.test(message)) {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
  return { ok: false, error: fallback };
}

export function readMarks(value: unknown): Marks {
  if (!isPlainObject(value)) return {};
  const out: Marks = {};
  for (const [key, mark] of Object.entries(value).slice(0, MAX_MARKS)) {
    if (/^[a-z0-9]{1,16}$/.test(key) && (mark === "known" || mark === "fixed")) out[key] = mark;
  }
  return out;
}

export function isAnalysis(value: unknown): value is ResumeAnalysis {
  return (
    isPlainObject(value) &&
    value.version === 1 &&
    isPlainObject(value.parsed) &&
    Array.isArray(value.questions) &&
    Array.isArray(value.fixes) &&
    Array.isArray(value.study)
  );
}

export async function listResumes(): Promise<StoreResult<SavedResume[]>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db
    .from("resume_docs")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_SAVED);
  if (error) return failure(error, "Could not load your saved resumes.");
  return {
    ok: true,
    value: (data ?? []).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      createdAt: String(row.created_at),
    })),
  };
}

export async function openResume(id: string): Promise<StoreResult<{ analysis: ResumeAnalysis; marks: Marks }>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db.from("resume_docs").select("analysis, marks").eq("id", id).maybeSingle();
  if (error) return failure(error, "Could not open that resume.");
  if (!data || !isAnalysis(data.analysis)) return { ok: false, error: "That saved resume could not be read." };
  return { ok: true, value: { analysis: data.analysis, marks: readMarks(data.marks) } };
}

export async function saveResume(title: string, analysis: ResumeAnalysis): Promise<StoreResult<string>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { data, error } = await db
    .from("resume_docs")
    .insert({ title: title.trim().slice(0, 120) || "Resume", analysis })
    .select("id")
    .single();
  if (error) return failure(error, "Could not save the resume to your account.");
  return { ok: true, value: String(data.id) };
}

export async function saveMarks(id: string, marks: Marks): Promise<StoreResult<null>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { error } = await db
    .from("resume_docs")
    .update({ marks: readMarks(marks) })
    .eq("id", id);
  return error ? failure(error, "Could not save your progress on this resume.") : { ok: true, value: null };
}

export async function updateAnalysis(id: string, analysis: ResumeAnalysis): Promise<StoreResult<null>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { error } = await db.from("resume_docs").update({ analysis }).eq("id", id);
  return error ? failure(error, "Could not update the saved result.") : { ok: true, value: null };
}

export async function deleteResume(id: string): Promise<StoreResult<null>> {
  const db = await connectAccount();
  if (!db) return { ok: false, error: "Accounts are not available right now." };
  const { error } = await db.from("resume_docs").delete().eq("id", id);
  return error ? failure(error, "Could not delete that resume.") : { ok: true, value: null };
}
