import type { PgFile } from "@/lib/playgroundProject";

export const PREVIEW_MESSAGE = "groundwork-preview";

const BRIDGE = `<script>
(() => {
  const send = (kind, args) => {
    const text = args.map((a) => {
      if (typeof a === "string") return a;
      try { return JSON.stringify(a); } catch { return String(a); }
    }).join(" ");
    parent.postMessage({ source: "${PREVIEW_MESSAGE}", kind, text }, "*");
  };
  for (const kind of ["log", "info", "warn", "error"]) {
    const original = console[kind].bind(console);
    console[kind] = (...args) => { send(kind, args); original(...args); };
  }
  addEventListener("error", (e) => send("error", [e.message]));
  addEventListener("unhandledrejection", (e) => send("error", ["Uncaught (in promise) " + (e.reason && e.reason.message || e.reason)]));
  addEventListener("load", () => parent.postMessage({ source: "${PREVIEW_MESSAGE}", kind: "ready" }, "*"));
})();
</script>`;

function refersTo(html: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:src|href)\\s*=\\s*["'](?:\\./)?${escaped}["']`).test(html);
}

/** The page a file belongs to: itself if it is HTML, or the HTML file that
 *  links it with a <link href> or <script src>. */
export function pageFor(files: PgFile[], active: PgFile | null): PgFile | null {
  if (!active) return null;
  if (active.lang === "html") return active;
  if (active.lang !== "css" && active.lang !== "javascript") return null;
  return files.find((f) => f.lang === "html" && refersTo(f.code, active.name)) ?? null;
}

function safeInline(code: string, tag: "script" | "style"): string {
  return code.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
}

/** The HTML with every linked stylesheet and script from the project put
 *  inline, and a console bridge first in the head. */
export function buildPage(files: PgFile[], page: PgFile): string {
  const byName = new Map(files.map((f) => [f.name.replace(/^\.\//, ""), f]));
  let html = page.code
    .replace(/<link\b[^>]*href\s*=\s*["'](?:\.\/)?([^"']+)["'][^>]*>/gi, (tag, name: string) => {
      const file = byName.get(name);
      return file?.lang === "css"
        ? `<style data-file="${file.name}">\n${safeInline(file.code, "style")}\n</style>`
        : tag;
    })
    .replace(
      /<script\b([^>]*)\bsrc\s*=\s*["'](?:\.\/)?([^"']+)["']([^>]*)>\s*<\/script>/gi,
      (tag, before: string, name: string, after: string) => {
        const file = byName.get(name);
        if (file?.lang !== "javascript") return tag;
        return `<script${before}${after} data-file="${file.name}">\n${safeInline(file.code, "script")}\n</script>`;
      }
    );
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (h) => `${h}\n${BRIDGE}`) : `${BRIDGE}\n${html}`;
  return html;
}
