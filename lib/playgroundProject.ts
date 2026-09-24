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

function valid(p: unknown): p is Project {
  const project = p as Project;
  return (
    Boolean(project) &&
    Array.isArray(project.files) &&
    project.files.length > 0 &&
    project.files.every((f) => typeof f.id === "string" && typeof f.code === "string" && isLanguage(f.lang))
  );
}

/** The saved project, or one built from the per-language code the playground
 *  kept before it had files, or a single JavaScript scratch file. */
export function loadProject(): Project {
  const saved = store.get<unknown>(KEY, null);
  if (valid(saved)) {
    return saved.files.some((f) => f.id === saved.active) ? saved : { ...saved, active: saved.files[0].id };
  }
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
