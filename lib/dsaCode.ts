import { cppLanguage } from "@codemirror/lang-cpp";
import { javaLanguage } from "@codemirror/lang-java";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import { pythonLanguage } from "@codemirror/lang-python";
import type { CodeLanguage } from "@/lib/codeLanguage";

export type TranslatedLanguage = Exclude<CodeLanguage, "javascript">;

export const TRANSLATED_LANGUAGES: TranslatedLanguage[] = ["python", "java", "cpp"];

const BLOCK = /<div data-code="([^"]*)"><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/g;
const MARKED = /data-code="/g;

export function markedBlockCount(body: string): number {
  return (body.match(MARKED) ?? []).length;
}

export function javascriptBlocks(body: string): Record<string, string> {
  const blocks: Record<string, string> = {};
  for (const match of body.matchAll(BLOCK)) blocks[match[1]] = match[2];
  return blocks;
}

export function duplicateBlockIds(body: string): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const match of body.matchAll(BLOCK)) {
    if (seen.has(match[1])) repeated.add(match[1]);
    seen.add(match[1]);
  }
  return [...repeated];
}

export function blockSource(html: string): string {
  return html
    .replace(/<\/?span[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

const PARSERS: Record<CodeLanguage, typeof javascriptLanguage.parser> = {
  javascript: javascriptLanguage.parser,
  python: pythonLanguage.parser,
  java: javaLanguage.parser,
  cpp: cppLanguage.parser,
};

export function syntaxErrors(language: CodeLanguage, source: string): string[] {
  const text = language === "java" ? `class Snippet {\n${source}\n}` : source;
  const found: string[] = [];
  PARSERS[language].parse(text).iterate({
    enter(node) {
      if (node.type.isError) found.push(text.slice(node.from, node.from + 40).split("\n")[0]);
    },
  });
  return found;
}

export function translationGaps(
  ids: string[],
  translations: Partial<Record<TranslatedLanguage, Record<string, string>>>
): string[] {
  const gaps: string[] = [];
  for (const language of TRANSLATED_LANGUAGES) {
    const code = translations[language];
    if (!code) {
      gaps.push(`${language}: no file`);
      continue;
    }
    for (const id of ids) {
      if (typeof code[id] !== "string" || code[id].trim() === "") gaps.push(`${language}: ${id} missing or empty`);
    }
    for (const id of Object.keys(code)) {
      if (!ids.includes(id)) gaps.push(`${language}: ${id} is not a block in the chapter`);
    }
  }
  return gaps;
}
