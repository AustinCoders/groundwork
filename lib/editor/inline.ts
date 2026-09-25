import { StateEffect, StateField, type Extension } from "@codemirror/state";
import { Decoration, EditorView, WidgetType, type DecorationSet } from "@codemirror/view";

export interface InlineResult {
  line: number;
  text: string;
  kind: "log" | "error";
  count: number;
}

class ResultWidget extends WidgetType {
  constructor(readonly result: InlineResult) {
    super();
  }

  eq(other: ResultWidget) {
    const a = this.result;
    const b = other.result;
    return a.text === b.text && a.kind === b.kind && a.count === b.count;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = `cm-inline-result cm-inline-result--${this.result.kind}`;
    const text = this.result.text.replace(/\s+/g, " ");
    span.textContent = `${this.result.kind === "error" ? "✕ " : "// "}${text.length > 90 ? `${text.slice(0, 89)}…` : text}${this.result.count > 1 ? `  ×${this.result.count}` : ""}`;
    span.title = this.result.text;
    return span;
  }

  ignoreEvent() {
    return true;
  }
}

export const setInlineResults = StateEffect.define<InlineResult[]>();

const inlineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(set, tr) {
    for (const effect of tr.effects) {
      if (!effect.is(setInlineResults)) continue;
      const doc = tr.state.doc;
      const widgets = effect.value
        .filter((r) => r.line >= 1 && r.line <= doc.lines)
        .sort((a, b) => a.line - b.line)
        .map((r) => Decoration.widget({ widget: new ResultWidget(r), side: 1 }).range(doc.line(r.line).to));
      return Decoration.set(widgets, true);
    }
    return tr.docChanged ? set.map(tr.changes) : set;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export const setDebugLine = StateEffect.define<number | null>();

const debugLineMark = Decoration.line({ class: "cm-debug-line" });

const debugField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(set, tr) {
    for (const effect of tr.effects) {
      if (!effect.is(setDebugLine)) continue;
      const line = effect.value;
      if (line === null || line < 1 || line > tr.state.doc.lines) return Decoration.none;
      return Decoration.set([debugLineMark.range(tr.state.doc.line(line).from)]);
    }
    return tr.docChanged ? Decoration.none : set;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export function inlineResults(): Extension {
  return [inlineField, debugField];
}

export function groupByLine(
  entries: ({ line?: number; text: string; kind: string } | { kind: "table" })[]
): InlineResult[] {
  const byLine = new Map<number, InlineResult>();
  for (const e of entries) {
    if (!("text" in e) || !e.line || (e.kind !== "log" && e.kind !== "info" && e.kind !== "warn" && e.kind !== "error"))
      continue;
    const kind = e.kind === "error" ? "error" : "log";
    const text =
      kind === "error"
        ? (e.text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .pop() ?? e.text)
        : e.text;
    const prev = byLine.get(e.line);
    if (prev && prev.kind === "error" && kind === "log") continue;
    byLine.set(e.line, { line: e.line, text, kind, count: prev && prev.kind === kind ? prev.count + 1 : 1 });
  }
  return [...byLine.values()];
}
