import type { CodeLanguage } from "@/lib/codeLanguage";

type Translations = Record<string, string>;

const loaded = new Map<string, Promise<Translations | null>>();
const originals = new WeakMap<HTMLElement, string>();

function load(chapterId: string, language: Exclude<CodeLanguage, "javascript">): Promise<Translations | null> {
  const key = `${chapterId}/${language}`;
  const hit = loaded.get(key);
  if (hit) return hit;
  const pending = import(`@/content/dsa/code/${chapterId}/${language}`).then(
    (module: { code: Translations }) => module.code,
    () => {
      loaded.delete(key);
      return null;
    }
  );
  loaded.set(key, pending);
  return pending;
}

function show(block: HTMLElement, code: HTMLElement, html: string, language: CodeLanguage) {
  if (code.innerHTML !== html) code.innerHTML = html;
  block.dataset.lang = language;
}

function markJavaScriptOnly(container: HTMLElement, language: CodeLanguage) {
  const flagged = language !== "javascript";
  for (const pre of Array.from(container.querySelectorAll<HTMLElement>("pre"))) {
    if (pre.closest("[data-island]")) continue;
    const translated = pre.closest("[data-code]");
    const stillJavaScript = translated instanceof HTMLElement && translated.dataset.lang === "javascript";
    pre.toggleAttribute("data-js-only", flagged && (!translated || stillJavaScript));
  }
}

export async function applyCodeLanguage(
  container: HTMLElement,
  chapterId: string,
  language: CodeLanguage,
  isCurrent: () => boolean = () => true
): Promise<boolean> {
  const blocks = Array.from(container.querySelectorAll<HTMLElement>("[data-code]"));
  if (blocks.length === 0) return true;
  const finish = (complete: boolean) => {
    markJavaScriptOnly(container, language);
    return complete;
  };

  if (language === "javascript") {
    for (const block of blocks) {
      const code = block.querySelector<HTMLElement>("pre > code");
      const original = code ? originals.get(code) : undefined;
      if (code && original !== undefined) show(block, code, original, language);
    }
    return finish(true);
  }

  const translations = await load(chapterId, language);
  if (!isCurrent()) return false;
  let complete = translations !== null;
  for (const block of blocks) {
    const code = block.querySelector<HTMLElement>("pre > code");
    if (!code) continue;
    const html = translations?.[block.dataset.code ?? ""];
    if (html === undefined) {
      const original = originals.get(code);
      if (original !== undefined) show(block, code, original, "javascript");
      else block.dataset.lang = "javascript";
      complete = false;
      continue;
    }
    if (!originals.has(code)) originals.set(code, code.innerHTML);
    show(block, code, html, language);
  }
  return finish(complete);
}
