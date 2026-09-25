import { isLanguage, type LanguageKey } from "@/lib/codeLanguages";
import { packJson, unpackJson } from "@/lib/compress";

export interface SharedFile {
  name: string;
  lang: LanguageKey;
  code: string;
}

const PREFIX = "#share=";

export async function shareUrl(files: SharedFile[]): Promise<string> {
  const packed = await packJson(files.map((f) => [f.name, f.lang, f.code]));
  return `${location.origin}/practice?id=free${PREFIX}${packed}`;
}

export function hasShare(hash: string): boolean {
  return hash.startsWith(PREFIX);
}

export async function readShare(hash: string): Promise<SharedFile[] | null> {
  if (!hasShare(hash)) return null;
  try {
    const rows = await unpackJson<unknown>(hash.slice(PREFIX.length));
    if (!Array.isArray(rows)) return null;
    const files = rows
      .filter(
        (r): r is [string, string, string] =>
          Array.isArray(r) && r.length === 3 && r.every((x) => typeof x === "string")
      )
      .filter(([, lang]) => isLanguage(lang))
      .slice(0, 20)
      .map(([name, lang, code]) => ({
        name: name.slice(0, 60),
        lang: lang as LanguageKey,
        code: code.slice(0, 200_000),
      }));
    return files.length ? files : null;
  } catch {
    return null;
  }
}
