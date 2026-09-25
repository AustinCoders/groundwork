import { LANGUAGES, isLanguage, type LanguageKey } from "@/lib/codeLanguages";

export const TRANSLATE_MODEL = "claude-sonnet-5";
export const MAX_TRANSLATE_CHARS = 20_000;

export interface TranslateRequest {
  code: string;
  from: LanguageKey;
  to: LanguageKey;
  shape?: string;
}

export function parseTranslateRequest(body: unknown): TranslateRequest | string {
  const b = body as Partial<Record<keyof TranslateRequest, unknown>> | null;
  if (!b || typeof b.code !== "string" || !b.code.trim()) return "There is no code to translate.";
  if (b.code.length > MAX_TRANSLATE_CHARS)
    return `That is too long to translate (over ${MAX_TRANSLATE_CHARS} characters).`;
  if (typeof b.from !== "string" || !isLanguage(b.from)) return "Unknown source language.";
  if (typeof b.to !== "string" || !isLanguage(b.to)) return "Unknown target language.";
  if (b.from === b.to) return "Pick a different language to translate into.";
  const shape = typeof b.shape === "string" ? b.shape.slice(0, 2000) : undefined;
  return { code: b.code, from: b.from, to: b.to, shape };
}

export function translatePrompt(req: TranslateRequest): { system: string; user: string } {
  const from = LANGUAGES[req.from].label;
  const to = LANGUAGES[req.to].label;
  const system =
    `You translate programs between languages for a coding practice site. ` +
    `Translate the reader's ${from} into idiomatic ${to} that behaves the same: same algorithm, same outputs, same edge cases. ` +
    `Keep their structure and names where ${to} allows, and keep any comments they wrote, translated to ${to}'s comment syntax. ` +
    `Do not fix bugs or finish unfinished code; translate what is there. ` +
    `Reply with exactly one fenced code block containing the whole ${to} program and nothing else.`;
  const shape = req.shape
    ? `\n\nThe ${to} version is graded by calling a function with exactly this shape, so keep its name, parameters and return type:\n\n\`\`\`\n${req.shape}\n\`\`\``
    : "";
  return { system, user: `Translate this ${from} to ${to}.${shape}\n\n\`\`\`\n${req.code}\n\`\`\`` };
}

export function extractCode(reply: string): string | null {
  const fence = reply.match(/```[^\n`]*\n([\s\S]*?)```/);
  const code = (fence ? fence[1] : reply).replace(/\s+$/, "");
  return code.trim() ? `${code}\n` : null;
}
