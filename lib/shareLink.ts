import { isLanguage, type LanguageKey } from "@/lib/codeLanguages";

export interface SharedFile {
  name: string;
  lang: LanguageKey;
  code: string;
}

const PREFIX = "#share=";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function shareUrl(files: SharedFile[]): Promise<string> {
  const json = JSON.stringify(files.map((f) => [f.name, f.lang, f.code]));
  const packed = await pipe(new TextEncoder().encode(json), new CompressionStream("deflate-raw"));
  return `${location.origin}/practice?id=free${PREFIX}${toBase64Url(packed)}`;
}

export function hasShare(hash: string): boolean {
  return hash.startsWith(PREFIX);
}

export async function readShare(hash: string): Promise<SharedFile[] | null> {
  if (!hasShare(hash)) return null;
  try {
    const bytes = await pipe(fromBase64Url(hash.slice(PREFIX.length)), new DecompressionStream("deflate-raw"));
    const rows = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
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
