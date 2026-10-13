import { LANGUAGES, LANG_ORDER, isLanguage, type LanguageKey } from "@/lib/codeLanguages";
import { templatesFor } from "@/lib/playgroundTemplates";
import { code as codeStore, store } from "@/lib/storage";

export interface PgFile {
  id: string;
  name: string;
  lang: LanguageKey;
  code: string;
}

export interface Project {
  files: PgFile[];
  active: string;
}

const KEY = "groundwork:playground:project";

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function starterCode(lang: LanguageKey): string {
  return templatesFor(lang)[0]?.code ?? `${LANGUAGES[lang].comment} ${LANGUAGES[lang].label}\n`;
}

export function uniqueName(files: PgFile[], base: string, ext: string, except?: string): string {
  const taken = new Set(files.filter((f) => f.id !== except).map((f) => f.name));
  if (!taken.has(`${base}.${ext}`)) return `${base}.${ext}`;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}.${ext}`)) return `${base}-${n}.${ext}`;
}

export function makeFile(files: PgFile[], lang: LanguageKey, code = starterCode(lang), base = "scratch"): PgFile {
  return { id: newId(), name: uniqueName(files, base, LANGUAGES[lang].ext), lang, code };
}

export function langForName(name: string): LanguageKey | null {
  const ext = name.split(".").pop()?.toLowerCase();
  return LANG_ORDER.find((k) => LANGUAGES[k].ext === ext) ?? null;
}

const MAX_FILES = 200;

function validFile(f: unknown): f is PgFile {
  if (f === null || typeof f !== "object") return false;
  const file = f as Record<string, unknown>;
  return (
    typeof file.id === "string" &&
    typeof file.name === "string" &&
    typeof file.code === "string" &&
    typeof file.lang === "string" &&
    isLanguage(file.lang)
  );
}

export function sanitizeProject(p: unknown): Project | null {
  if (p === null || typeof p !== "object" || !Array.isArray((p as Project).files)) return null;
  const files = (p as Project).files.filter(validFile).slice(0, MAX_FILES);
  if (files.length === 0) return null;
  const active = (p as Project).active;
  return { files, active: files.some((f) => f.id === active) ? active : files[0].id };
}

export function loadProject(): Project {
  const saved = sanitizeProject(store.get<unknown>(KEY, null));
  if (saved) return saved;
  const files: PgFile[] = [];
  for (const lang of LANG_ORDER) {
    const code = codeStore.load("free", lang);
    if (code != null && code.trim()) files.push(makeFile(files, lang, code));
  }
  if (!files.length) files.push(makeFile(files, "javascript"));
  return { files, active: files[0].id };
}

export function saveProject(project: Project) {
  store.set(KEY, project);
}
