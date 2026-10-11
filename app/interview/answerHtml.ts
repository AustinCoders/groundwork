import { escapeHtml } from "@/lib/format";

export interface AnswerParts {
  a?: string | null;
  code?: { label?: string; code: string }[];
  say?: string | null;
  trap?: string | null;
  note?: string | null;
  after?: string | null;
  fu?: string[];
}

const DEFAULT_CODE_LABEL = "example";

export function codeBlockHtml(block: { label?: string; code: string }): string {
  const label = block.label || DEFAULT_CODE_LABEL;
  const style = escapeHtml(`--code-label: ${JSON.stringify(label)}`);
  return `<div style="${style}"><pre data-scroll-region="${escapeHtml(`Code: ${label}`)}"><code>${block.code}</code></pre></div>`;
}

export function sayHtml(html: string): string {
  return `<div class="say"><span class="ttl">Say it like this</span>${html}</div>`;
}

export function trapHtml(html: string): string {
  return `<div class="warn"><span class="ttl">The answer that loses the room</span>${html}</div>`;
}

export function noteHtml(html: string): string {
  return `<div class="sticky mint"><span class="ttl">2026 note</span>${html}</div>`;
}

export function followUpsHtml(fu: string[]): string {
  if (!fu.length) return "";
  return `<div class="sticky"><span class="ttl">They will push with</span><ol>${fu.map((f) => `<li>${f}</li>`).join("")}</ol></div>`;
}

export function answerHtml(parts: AnswerParts): string {
  return [
    parts.a ?? "",
    ...(parts.code ?? []).map(codeBlockHtml),
    parts.say ? sayHtml(parts.say) : "",
    parts.trap ? trapHtml(parts.trap) : "",
    parts.note ? noteHtml(parts.note) : "",
    parts.after ?? "",
    followUpsHtml(parts.fu ?? []),
  ].join("");
}
