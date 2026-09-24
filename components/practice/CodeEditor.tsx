"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  type ViewUpdate,
} from "@codemirror/view";
import {
  copyLineDown,
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  toggleLineComment,
} from "@codemirror/commands";
import {
  search,
  searchKeymap,
  highlightSelectionMatches,
  selectNextOccurrence,
  gotoLine,
  openSearchPanel,
} from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lintGutter, linter, lintKeymap, nextDiagnostic, type Diagnostic } from "@codemirror/lint";
import {
  bracketMatching,
  codeFolding,
  foldAll,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  syntaxHighlighting,
  unfoldAll,
  HighlightStyle,
} from "@codemirror/language";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { tags } from "@lezer/highlight";

import { CommandPalette, type Command } from "@/components/practice/CommandPalette";
import { Dropdown } from "@/components/ui/select";
import { fixAll, formatCode, FORMATS, lintCode, LINTS, type EditorProblem } from "@/lib/editor/tools";
import { loadSettings, saveSettings, type EditorSettings } from "@/lib/editor/settings";
import { inlineResults, setInlineResults, type InlineResult } from "@/lib/editor/inline";
import {
  HINTS,
  isLanguage,
  LANGUAGES,
  LANG_ORDER,
  WEB_LANGUAGES,
  WRITE_ONLY_HINT,
  type LanguageKey,
  type LanguageMeta,
} from "@/lib/codeLanguages";

export interface CodeEditorHandle {
  getValue(): string;
  setValue(text: string): void;
  focus(): void;
  getLanguage(): LanguageKey;
  setLanguage(key: LanguageKey): void;
  getLanguageMeta(): LanguageMeta;
  flashSaved(): void;
  setFontSize(px: number): number;
  getFontSize(): number;
  toggleWrap(on?: boolean): boolean;
  toggleFullscreen(on?: boolean): boolean;
  isFullscreen(): boolean;
  reveal(from: number, to?: number): void;
  showInline(results: InlineResult[]): void;
}

export interface CodeEditorProps {
  filename: string;
  language: string;
  value: string;
  height?: number;
  onChange?: (value: string) => void;
  onRun?: () => void;
  onSave?: () => void;
  onLanguageChange?: (key: LanguageKey, meta: LanguageMeta) => void;
  onProblems?: (problems: EditorProblem[]) => void;
  onShowProblems?: () => void;
  files?: FileTabsProps["files"];
  languages?: readonly LanguageKey[];
  fileActions?: Omit<FileTabsProps, "files">;

  toolbarStart?: React.ReactNode;
}

const cmHighlight = HighlightStyle.define([
  { tag: [tags.comment, tags.lineComment, tags.blockComment], class: "tok-com" },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], class: "tok-str" },
  { tag: [tags.number, tags.integer, tags.float], class: "tok-num" },
  { tag: [tags.keyword, tags.controlKeyword, tags.moduleKeyword, tags.operatorKeyword], class: "tok-key" },
  { tag: [tags.bool, tags.null, tags.atom, tags.self], class: "tok-lit" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: "tok-fn" },
  { tag: [tags.operator, tags.punctuation, tags.bracket, tags.paren], class: "tok-op" },
  { tag: [tags.className, tags.typeName, tags.namespace], class: "tok-cls" },
  { tag: [tags.tagName, tags.angleBracket], class: "tok-key" },
  { tag: [tags.attributeName, tags.propertyName], class: "tok-fn" },
]);

const cmTheme = EditorView.theme({
  "&": {
    height: "100%",
    color: "var(--ide-fg)",
    backgroundColor: "transparent",
  },
  ".cm-content": {
    fontVariantLigatures: "none",
    fontFamily: "var(--font-code)",
    fontSize: "var(--ed-size, 14.5px)",
    lineHeight: "1.65",
    caretColor: "var(--ide-cursor)",
    padding: "14px 16px",
  },
  ".cm-scroller": { overflow: "auto" },
  "&.cm-focused .cm-cursor": { borderLeftColor: "var(--ide-cursor)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--ide-selection) !important",
  },
  ".cm-gutters": {
    backgroundColor: "var(--ide-gutter)",
    color: "var(--ide-fg-faint)",
    border: "none",
    borderRight: "1px solid var(--ide-border)",
    fontFamily: "var(--font-code)",
    fontSize: "var(--ed-size, 14.5px)",
  },
  ".cm-activeLine": { backgroundColor: "var(--ide-selection)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--ide-selection)", color: "var(--ide-accent)", fontWeight: "700" },
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    backgroundColor: "rgba(249, 226, 175, 0.25)",
    outline: "none",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--ide-bg-elevated)",
    border: "1px solid var(--ide-border)",
    borderRadius: "8px",
    color: "var(--ide-fg)",
    fontFamily: "var(--font-code)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--ide-accent)",
    color: "var(--ide-bg)",
  },
  ".cm-panels": { backgroundColor: "var(--ide-bg-elevated)", color: "var(--ide-fg)", fontFamily: "var(--font-body)" },
  ".cm-panels.cm-panels-top": { borderBottom: "1px solid var(--ide-border)" },
  ".cm-panel input, .cm-panel button, .cm-panel label": { fontFamily: "inherit", color: "var(--ide-fg)" },
  ".cm-panel button": {
    background: "var(--ide-bg)",
    border: "1.5px solid var(--ide-border)",
    borderRadius: "6px",
    padding: "2px 8px",
    cursor: "pointer",
  },
  ".cm-searchMatch": { backgroundColor: "rgba(249, 226, 175, 0.25)" },
  ".cm-searchMatch-selected": { backgroundColor: "rgba(243, 139, 168, 0.35)" },
  ".cm-selectionMatch": { backgroundColor: "rgba(166, 227, 161, 0.2)" },
  ".cm-diagnostic-error": { borderLeftColor: "var(--ide-red)" },
});

type Ref<T> = { current: T };

function makeLintSource(refs: {
  lang: Ref<LanguageKey>;
  problems: Ref<((p: EditorProblem[]) => void) | undefined>;
  setCounts: (c: { errors: number; warnings: number }) => void;
}) {
  let warmed = false;
  return async function lintSource(view: EditorView): Promise<Diagnostic[]> {
    if (!warmed) {
      await new Promise<void>((resolve) =>
        "requestIdleCallback" in window
          ? window.requestIdleCallback(() => resolve(), { timeout: 2000 })
          : setTimeout(resolve, 1000)
      );
      warmed = true;
    }
    const lang = refs.lang.current;
    const code = view.state.doc.toString();
    let problems: EditorProblem[] = [];
    try {
      problems = await lintCode(code, lang);
    } catch {
      return [];
    }
    if (view.state.doc.toString() !== code || refs.lang.current !== lang) return [];
    refs.problems.current?.(problems);
    refs.setCounts({
      errors: problems.filter((p) => p.severity === "error").length,
      warnings: problems.filter((p) => p.severity === "warning").length,
    });
    const end = view.state.doc.length;
    return problems.map((p) => ({
      from: Math.min(p.from, end),
      to: Math.min(Math.max(p.to, p.from), end),
      severity: p.severity,
      message: p.message,
      source: p.source,
      actions: p.fix ? [{ name: "Fix", apply: (v: EditorView) => v.dispatch({ changes: p.fix! }) }] : [],
    }));
  };
}

function lintExtension(lang: LanguageKey, on: boolean, source: (view: EditorView) => Promise<Diagnostic[]>) {
  return on && LINTS.has(lang) ? [lintGutter(), linter(source, { delay: 500 })] : [];
}

function tabExtension(size: number) {
  return [EditorState.tabSize.of(size), indentUnit.of(" ".repeat(size))];
}

interface EditorActions {
  format: () => Promise<void>;
  save: () => Promise<void>;
  palette: () => void;
}

function editorExtensions(ctx: {
  actions: Ref<EditorActions>;
  run: Ref<(() => void) | undefined>;
  compartments: Record<"lang" | "lint" | "wrap" | "tab" | "guides" | "vim" | "minimap", Compartment>;
  lint: Extension;
  settings: EditorSettings;
}): Extension[] {
  const { actions, run, compartments: c, settings } = ctx;
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(cmHighlight, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    codeFolding(),
    foldGutter({ openText: "⌄", closedText: "›" }),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    search({ top: true }),
    inlineResults(),
    c.vim.of([]),
    keymap.of([
      { key: "Mod-Shift-p", run: () => (actions.current.palette(), true), preventDefault: true },
      { key: "F1", run: () => (actions.current.palette(), true) },
      { key: "Shift-Alt-f", run: () => (void actions.current.format(), true), preventDefault: true },
      { key: "Mod-g", run: gotoLine, preventDefault: true },
      { key: "F8", run: nextDiagnostic },
      { key: "Mod-Enter", run: () => (run.current?.(), true) },
      { key: "Mod-s", run: () => (void actions.current.save(), true), preventDefault: true },
      { key: "Mod-/", run: toggleLineComment },
      { key: "Mod-d", run: selectNextOccurrence },
      { key: "Shift-Alt-ArrowDown", run: copyLineDown },
      ...closeBracketsKeymap,
      ...foldKeymap,
      ...lintKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    c.lang.of([]),
    c.lint.of(ctx.lint),
    c.wrap.of(settings.wrap ? EditorView.lineWrapping : []),
    c.tab.of(tabExtension(settings.tabSize)),
    c.guides.of(settings.indentGuides ? indentationMarkers() : []),
    c.minimap.of([]),
    cmTheme,
    EditorView.contentAttributes.of({ "aria-label": "Code editor" }),
  ];
}

interface FileTabsProps {
  files: { id: string; name: string; active: boolean }[];
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
}

function FileTabs({ files, onSelect, onClose, onNew, onRename }: FileTabsProps) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <span className="ed__tabs ed__tabs--files" role="list" aria-label="Files">
      {files.map((f) => (
        <span key={f.id} role="listitem" className={`ed__tab${f.active ? " is-active" : ""}`}>
          {editing === f.id ? (
            <input
              className="ed__tab-rename"
              aria-label={`Rename ${f.name}`}
              defaultValue={f.name}
              autoFocus
              onFocus={(e) => e.currentTarget.setSelectionRange(0, e.currentTarget.value.lastIndexOf(".") >>> 0)}
              onBlur={(e) => {
                onRename(f.id, e.currentTarget.value);
                setEditing(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setEditing(null);
              }}
            />
          ) : (
            <button
              type="button"
              aria-current={f.active ? "true" : undefined}
              className="ed__tab-btn"
              title="Double-click to rename"
              onClick={() => onSelect(f.id)}
              onDoubleClick={() => setEditing(f.id)}
            >
              <span className="ed__tab-icon" aria-hidden="true">
                ◆
              </span>
              <span className="ed__tab-name">{f.name}</span>
            </button>
          )}
          {files.length > 1 && (
            <button
              type="button"
              className="ed__tab-close"
              aria-label={`Close ${f.name}`}
              onClick={() => onClose(f.id)}
            >
              ×
            </button>
          )}
        </span>
      ))}
      <span role="listitem" className="ed__tab-new-item">
        <button type="button" className="ed__tab-new" aria-label="New file" title="New file" onClick={onNew}>
          +
        </button>
      </span>
    </span>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <label className="ed__switch">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={on} onChange={onChange} />
      <span className="ed__switch-track" aria-hidden="true" />
    </label>
  );
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  {
    filename,
    language,
    value,
    height = 420,
    onChange,
    onRun,
    onSave,
    onLanguageChange,
    onProblems,
    onShowProblems,
    files,
    fileActions,
    languages = LANG_ORDER.filter((k) => !WEB_LANGUAGES.includes(k)),
    toolbarStart,
  },
  ref
) {
  const initialLang: LanguageKey = isLanguage(language) ? language : "javascript";
  const baseName = filename.replace(/\.[^./]+$/, "");

  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const [currentLang, setCurrentLang] = useState<LanguageKey>(initialLang);
  const [fontSize, setFontSizeState] = useState(14.5);
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);
  const wrapped = settings.wrap;
  const [fullscreen, setFullscreen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [counts, setCounts] = useState({ errors: 0, warnings: 0 });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [viewReady, setViewReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentLangRef = useRef<LanguageKey>(initialLang);
  const settingsRef = useRef(settings);
  const [pos, setPos] = useState("Ln 1, Col 1");
  const [stats, setStats] = useState("");
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  const onSaveRef = useRef(onSave);
  const onLanguageChangeRef = useRef(onLanguageChange);
  const onProblemsRef = useRef(onProblems);
  useEffect(() => {
    onChangeRef.current = onChange;
    onRunRef.current = onRun;
    onSaveRef.current = onSave;
    onLanguageChangeRef.current = onLanguageChange;
    onProblemsRef.current = onProblems;
  });
  const actionsRef = useRef<EditorActions>({ format: async () => {}, save: async () => {}, palette: () => {} });

  const [langCompartment] = useState(() => new Compartment());
  const [lintCompartment] = useState(() => new Compartment());
  const [wrapCompartment] = useState(() => new Compartment());
  const [tabCompartment] = useState(() => new Compartment());
  const [guidesCompartment] = useState(() => new Compartment());
  const [vimCompartment] = useState(() => new Compartment());
  const [minimapCompartment] = useState(() => new Compartment());

  function flash(message: string) {
    setNotice(message);
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 2200);
  }

  // eslint-disable-next-line react-hooks/refs -- read in callbacks only, see above
  const [lintSource] = useState(() => makeLintSource({ lang: currentLangRef, problems: onProblemsRef, setCounts }));
  // eslint-disable-next-line react-hooks/refs -- read in callbacks only, see above
  const [extensions] = useState(() =>
    editorExtensions({
      actions: actionsRef,
      run: onRunRef,
      compartments: {
        lang: langCompartment,
        lint: lintCompartment,
        wrap: wrapCompartment,
        tab: tabCompartment,
        guides: guidesCompartment,
        vim: vimCompartment,
        minimap: minimapCompartment,
      },
      lint: lintExtension(initialLang, settings.lint, lintSource),
      settings,
    })
  );

  useEffect(() => {
    if (!settingsOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Element | null;
      if (t?.closest("#ed-settings, [aria-controls='ed-settings']")) return;
      setSettingsOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [settingsOpen]);

  const announcedLangRef = useRef<LanguageKey | null>(null);

  useEffect(() => {
    currentLangRef.current = currentLang;
    if (announcedLangRef.current !== currentLang) {
      announcedLangRef.current = currentLang;
      onLanguageChangeRef.current?.(currentLang, LANGUAGES[currentLang]);
    }
    const view = cmRef.current?.view;
    if (!view) return;
    if (!LINTS.has(currentLang) || !settingsRef.current.lint) onProblemsRef.current?.([]);
    view.dispatch({
      effects: lintCompartment.reconfigure(lintExtension(currentLang, settingsRef.current.lint, lintSource)),
    });
    let current = true;
    LANGUAGES[currentLang]
      .support()
      .then((ext) => {
        if (current) cmRef.current?.view?.dispatch({ effects: langCompartment.reconfigure(ext) });
      })
      .catch(() => {});
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang, viewReady]);

  useEffect(() => {
    settingsRef.current = settings;
    saveSettings(settings);
    const view = cmRef.current?.view;
    if (!view) return;
    view.dispatch({
      effects: [
        wrapCompartment.reconfigure(settings.wrap ? EditorView.lineWrapping : []),
        tabCompartment.reconfigure(tabExtension(settings.tabSize)),
        guidesCompartment.reconfigure(settings.indentGuides ? indentationMarkers() : []),
        lintCompartment.reconfigure(lintExtension(currentLangRef.current, settings.lint, lintSource)),
      ],
    });
    if (!settings.lint) onProblemsRef.current?.([]);
    let live = true;
    if (settings.vim) {
      import("@replit/codemirror-vim").then(({ vim }) => {
        if (live) cmRef.current?.view?.dispatch({ effects: vimCompartment.reconfigure(vim()) });
      });
    } else view.dispatch({ effects: vimCompartment.reconfigure([]) });
    if (settings.minimap) {
      import("@replit/codemirror-minimap").then(({ showMinimap }) => {
        if (!live) return;
        cmRef.current?.view?.dispatch({
          effects: minimapCompartment.reconfigure(
            showMinimap.compute(["doc"], () => ({
              create: () => {
                const dom = document.createElement("div");
                return { dom };
              },
              displayText: "blocks",
              showOverlay: "always",
            }))
          ),
        });
      });
    } else view.dispatch({ effects: minimapCompartment.reconfigure([]) });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, viewReady]);

  function toggle<K extends keyof EditorSettings>(key: K, value?: EditorSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value ?? !s[key] }));
  }

  async function format(): Promise<boolean> {
    const view = cmRef.current?.view;
    const lang = currentLangRef.current;
    if (!view) return false;
    if (!FORMATS.has(lang)) {
      flash(`No formatter for ${LANGUAGES[lang].label} yet`);
      return false;
    }
    const code = view.state.doc.toString();
    try {
      const out = await formatCode(code, lang, view.state.selection.main.head, settingsRef.current.tabSize);
      if (view.state.doc.toString() !== code) return false;
      if (out.code !== code) {
        view.dispatch({
          changes: { from: 0, to: code.length, insert: out.code },
          selection: { anchor: Math.min(out.cursor, out.code.length) },
          scrollIntoView: true,
        });
      }
      return true;
    } catch (err) {
      flash(`Prettier: ${(err instanceof Error ? err.message : String(err)).split("\n")[0]}`);
      return false;
    }
  }

  async function save() {
    const s = settingsRef.current;
    const formatted = s.formatOnSave && FORMATS.has(currentLangRef.current) ? await format() : false;
    onSaveRef.current?.();
    if (s.runOnSave) onRunRef.current?.();
    flash(
      formatted
        ? s.runOnSave
          ? "Formatted, saved and running"
          : "Formatted and saved"
        : s.runOnSave
          ? "Saved and running"
          : "Saved"
    );
  }

  async function fixEverything() {
    const view = cmRef.current?.view;
    const lang = currentLangRef.current;
    if (!view) return;
    if (lang !== "javascript") {
      flash("ESLint fixes are for JavaScript");
      return;
    }
    const code = view.state.doc.toString();
    const out = await fixAll(code, lang).catch(() => code);
    if (out !== code && view.state.doc.toString() === code) {
      view.dispatch({ changes: { from: 0, to: code.length, insert: out } });
      flash("Fixed what ESLint could fix");
    } else flash("Nothing ESLint can fix by itself");
  }

  useEffect(() => {
    actionsRef.current = {
      format: async () => {
        if (await format()) flash("Formatted");
      },
      save,
      palette: () => setPaletteOpen(true),
    };
  });

  const commands: Command[] = [
    { id: "run", group: "Run", label: "Run the code", keys: "⌘/Ctrl Enter", run: () => onRunRef.current?.() },
    { id: "save", group: "File", label: "Save", keys: "⌘/Ctrl S", run: () => void save() },
    {
      id: "format",
      group: "Format",
      label: "Format document (Prettier)",
      keys: "⇧⌥F",
      run: () => void actionsRef.current.format(),
    },
    { id: "fix", group: "ESLint", label: "Fix all auto-fixable problems", run: () => void fixEverything() },
    {
      id: "next-problem",
      group: "Go",
      label: "Next problem",
      keys: "F8",
      run: () => {
        const v = cmRef.current?.view;
        if (v) nextDiagnostic(v);
        v?.focus();
      },
    },
    {
      id: "goto",
      group: "Go",
      label: "Go to line…",
      keys: "⌘/Ctrl G",
      run: () => {
        const v = cmRef.current?.view;
        if (v) gotoLine(v);
      },
    },
    {
      id: "find",
      group: "Edit",
      label: "Find and replace",
      keys: "⌘/Ctrl F",
      run: () => {
        const v = cmRef.current?.view;
        if (v) openSearchPanel(v);
      },
    },
    {
      id: "fold",
      group: "View",
      label: "Fold all",
      run: () => {
        const v = cmRef.current?.view;
        if (v) foldAll(v);
      },
    },
    {
      id: "unfold",
      group: "View",
      label: "Unfold all",
      run: () => {
        const v = cmRef.current?.view;
        if (v) unfoldAll(v);
      },
    },
    {
      id: "wrap",
      group: "View",
      label: `${settings.wrap ? "Turn off" : "Turn on"} word wrap`,
      keys: "⌥Z",
      run: () => toggle("wrap"),
    },
    {
      id: "minimap",
      group: "View",
      label: `${settings.minimap ? "Hide" : "Show"} the minimap`,
      run: () => toggle("minimap"),
    },
    {
      id: "guides",
      group: "View",
      label: `${settings.indentGuides ? "Hide" : "Show"} indent guides`,
      run: () => toggle("indentGuides"),
    },
    { id: "vim", group: "Keys", label: `${settings.vim ? "Turn off" : "Turn on"} Vim mode`, run: () => toggle("vim") },
    {
      id: "lint",
      group: "ESLint",
      label: `${settings.lint ? "Turn off" : "Turn on"} linting`,
      run: () => toggle("lint"),
    },
    {
      id: "fos",
      group: "File",
      label: `${settings.formatOnSave ? "Don't format" : "Format"} on save`,
      run: () => toggle("formatOnSave"),
    },
    {
      id: "ros",
      group: "File",
      label: `${settings.runOnSave ? "Don't run" : "Run"} on save`,
      run: () => toggle("runOnSave"),
    },
    {
      id: "tab",
      group: "Format",
      label: `Indent with ${settings.tabSize === 2 ? 4 : 2} spaces`,
      run: () => toggle("tabSize", settings.tabSize === 2 ? 4 : 2),
    },
    { id: "bigger", group: "View", label: "Bigger text", run: () => setFontSizeState((s) => Math.min(24, s + 1)) },
    { id: "smaller", group: "View", label: "Smaller text", run: () => setFontSizeState((s) => Math.max(11, s - 1)) },
    {
      id: "full",
      group: "View",
      label: fullscreen ? "Leave fullscreen" : "Fullscreen",
      run: () => setFullscreen((f) => !f),
    },
    ...languages.map((key) => ({
      id: `lang-${key}`,
      group: "Language",
      label: LANGUAGES[key].label,
      run: () => setCurrentLang(key),
    })),
  ];

  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    const raf = requestAnimationFrame(() => cmRef.current?.view?.requestMeasure());
    return () => cancelAnimationFrame(raf);
  }, [fullscreen]);

  function handleUpdate(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet) {
      const cmPos = update.state.selection.main.head;
      const line = update.state.doc.lineAt(cmPos);
      setPos(`Ln ${line.number}, Col ${cmPos - line.from + 1}`);
    }
    if (update.docChanged) {
      const count = update.state.doc.lines;
      const len = update.state.doc.length;
      setStats(`${count} ${count === 1 ? "line" : "lines"} · ${len} chars`);
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => cmRef.current?.view?.state.doc.toString() ?? "",
      setValue: (text: string) => {
        const view = cmRef.current?.view;
        if (!view) return;
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text || "" } });
        view.scrollDOM.scrollTop = 0;
      },
      focus: () => cmRef.current?.view?.focus(),
      getLanguage: () => currentLang,
      setLanguage: (key: LanguageKey) => setCurrentLang(key),
      getLanguageMeta: () => LANGUAGES[currentLang],
      flashSaved: () => {
        setSavedFlash(true);
        clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSavedFlash(false), 1200);
      },
      setFontSize: (px: number) => {
        const next = Math.min(24, Math.max(11, px));
        setFontSizeState(next);
        return next;
      },
      getFontSize: () => fontSize,
      toggleWrap: (on?: boolean) => {
        const next = on == null ? !wrapped : on;
        toggle("wrap", next);
        return next;
      },
      showInline: (results: InlineResult[]) => {
        cmRef.current?.view?.dispatch({ effects: setInlineResults.of(results) });
      },
      reveal: (from: number, to?: number) => {
        const view = cmRef.current?.view;
        if (!view) return;
        const end = view.state.doc.length;
        view.dispatch({
          selection: { anchor: Math.min(from, end), head: Math.min(to ?? from, end) },
          scrollIntoView: true,
        });
        view.focus();
      },
      toggleFullscreen: (on?: boolean) => {
        const next = on == null ? !fullscreen : on;
        setFullscreen(next);
        return next;
      },
      isFullscreen: () => fullscreen,
    }),
    [currentLang, fontSize, wrapped, fullscreen]
  );

  const meta = LANGUAGES[currentLang];

  return (
    <div
      className={`ed${wrapped ? " ed--wrap" : ""}${fullscreen ? " is-fullscreen" : ""}`}
      style={{ "--ed-size": `${fontSize}px`, "--ed-height": `${height}px` } as React.CSSProperties}
    >
      <div className="ed__bar">
        <span className="ed__traffic" aria-hidden="true">
          <span className="ed__tl ed__tl--red" />
          <span className="ed__tl ed__tl--yellow" />
          <span className="ed__tl ed__tl--green" />
        </span>
        {files && fileActions ? (
          <FileTabs files={files} {...fileActions} />
        ) : (
          <span className="ed__tabs">
            <span className="ed__tab is-active">
              <span className="ed__tab-icon" aria-hidden="true">
                ◆
              </span>
              <span className="ed__tab-name">
                {baseName}.{meta.ext}
              </span>
            </span>
          </span>
        )}
        <span className="ed__spacer" />
        <Dropdown
          items={languages.map((key) => ({
            value: key,
            label: LANGUAGES[key].label,
            group: LANGUAGES[key].runnable ? "Runs here" : "Write only",
          }))}
          value={currentLang}
          onChange={(key) => setCurrentLang(key as LanguageKey)}
          ariaLabel="Language"
          plain
          columns={4}
          compact
        />
        <div className="ed__tools">
          {toolbarStart}
          <button
            className="btn btn--icon"
            type="button"
            title="Fullscreen"
            aria-label="Fullscreen"
            onClick={() => setFullscreen((f) => !f)}
          >
            ⛶
          </button>
          <button
            className="btn btn--icon"
            type="button"
            title="Command palette (⌘/Ctrl ⇧ P)"
            aria-label="Command palette"
            onClick={() => setPaletteOpen(true)}
          >
            ⌘
          </button>
          <button
            className="btn btn--icon"
            type="button"
            title="Editor settings"
            aria-label="Editor settings"
            aria-expanded={settingsOpen}
            aria-controls="ed-settings"
            onClick={() => setSettingsOpen((o) => !o)}
          >
            ⚙
          </button>
        </div>
      </div>
      {settingsOpen && (
        <div
          className="ed__settings"
          id="ed-settings"
          role="group"
          aria-label="Editor settings"
          onKeyDown={(e) => e.key === "Escape" && setSettingsOpen(false)}
        >
          <p className="ed__settings-h">On ⌘/Ctrl + S</p>
          <Switch on={settings.formatOnSave} onChange={() => toggle("formatOnSave")} label="Format with Prettier" />
          <Switch on={settings.runOnSave} onChange={() => toggle("runOnSave")} label="Run the code" />
          <p className="ed__settings-h">Editor</p>
          <Switch on={settings.lint} onChange={() => toggle("lint")} label="ESLint / type-check as I type" />
          <Switch on={settings.vim} onChange={() => toggle("vim")} label="Vim keys" />
          <Switch on={settings.minimap} onChange={() => toggle("minimap")} label="Minimap" />
          <Switch on={settings.indentGuides} onChange={() => toggle("indentGuides")} label="Indent guides" />
          <Switch on={settings.wrap} onChange={() => toggle("wrap")} label="Word wrap" />
          <div className="ed__settings-row">
            <span>Text size</span>
            <span className="ed__seg" role="group" aria-label="Text size">
              <button
                type="button"
                aria-label="Smaller text"
                onClick={() => setFontSizeState((v) => Math.max(11, v - 1))}
              >
                A−
              </button>
              <span className="ed__seg-value">{fontSize}px</span>
              <button
                type="button"
                aria-label="Bigger text"
                onClick={() => setFontSizeState((v) => Math.min(24, v + 1))}
              >
                A+
              </button>
            </span>
          </div>
          <div className="ed__settings-row">
            <span>Indent</span>
            <span className="ed__seg" role="group" aria-label="Indent size">
              {([2, 4] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={settings.tabSize === n}
                  onClick={() => toggle("tabSize", n)}
                >
                  {n} spaces
                </button>
              ))}
            </span>
          </div>
          <button
            type="button"
            className="ed__settings-link"
            onClick={() => {
              setSettingsOpen(false);
              setPaletteOpen(true);
            }}
          >
            All commands… <kbd>⌘/Ctrl ⇧ P</kbd>
          </button>
        </div>
      )}
      <CommandPalette
        open={paletteOpen}
        commands={commands}
        onClose={() => {
          setPaletteOpen(false);
          cmRef.current?.view?.focus();
        }}
      />
      <div className="ed__body">
        <CodeMirror
          ref={cmRef}
          className="ed__cm"
          height="100%"
          theme="none"
          basicSetup={false}
          indentWithTab={false}
          value={value}
          extensions={extensions}
          onChange={(next) => onChangeRef.current?.(next)}
          onUpdate={handleUpdate}
          onCreateEditor={() => setViewReady(true)}
        />
      </div>
      <div className="ed__status">
        <span className="ed__ready">{meta.label}</span>
        {settings.lint && LINTS.has(currentLang) && (
          <button
            type="button"
            className="ed__problems"
            title="Problems (F8 for the next one)"
            onClick={() => onShowProblems?.()}
            data-state={counts.errors ? "error" : counts.warnings ? "warning" : "clean"}
          >
            ✕ {counts.errors} ⚠ {counts.warnings}
          </button>
        )}
        <span className="ed__pos">{pos}</span>
        <span className="ed__len">{stats}</span>
        <span className="ed__spacer" />
        {notice ? (
          <span className="ed__notice" role="status">
            {notice}
          </span>
        ) : (
          <span className={`ed__saved${savedFlash ? " is-on" : ""}`}>saved</span>
        )}
        <span className="ed__meta">Spaces: {settings.tabSize}</span>
        {FORMATS.has(currentLang) && (
          <button
            type="button"
            className="ed__meta ed__meta--btn"
            title="Format document (⇧⌥F)"
            onClick={() => void actionsRef.current.format()}
          >
            {"{ }"} Prettier
          </button>
        )}
        {settings.vim && <span className="ed__meta">VIM</span>}
        <span className="ed__hint">{meta.runnable ? HINTS[meta.runnable] : WRITE_ONLY_HINT}</span>
      </div>
    </div>
  );
});
