"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { Compartment, EditorState } from "@codemirror/state";
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
import { defaultKeymap, history, historyKeymap, indentWithTab, toggleLineComment } from "@codemirror/commands";
import { search, searchKeymap, highlightSelectionMatches, selectNextOccurrence } from "@codemirror/search";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { lintGutter, linter, type Diagnostic } from "@codemirror/lint";
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

import { Dropdown } from "@/components/ui/select";
import { HINTS, LANGUAGES, LANG_ORDER, type LanguageKey, type LanguageMeta } from "@/lib/codeLanguages";

export interface CodeEditorHandle {
  getValue(): string;
  setValue(text: string): void;
  focus(): void;
  getLanguage(): LanguageKey;
  getLanguageMeta(): LanguageMeta;
  flashSaved(): void;
  setFontSize(px: number): number;
  getFontSize(): number;
  toggleWrap(on?: boolean): boolean;
  toggleFullscreen(on?: boolean): boolean;
  isFullscreen(): boolean;
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

function jsLinter(view: EditorView): Diagnostic[] {
  const code = view.state.doc.toString();
  try {
    new Function("return (async function () {\n" + code + "\n});");
    return [];
  } catch (err) {
    return [
      {
        from: 0,
        to: Math.min(code.length, 1),
        severity: "error",
        message: err instanceof Error ? err.message : String(err),
      },
    ];
  }
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor(
  { filename, language, value, height = 420, onChange, onRun, onSave, onLanguageChange, toolbarStart },
  ref
) {
  const initialLang: LanguageKey = (LANGUAGES[language as LanguageKey] ? language : "javascript") as LanguageKey;
  const baseName = filename.replace(/\.[^./]+$/, "");

  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const [currentLang, setCurrentLang] = useState<LanguageKey>(initialLang);
  const [fontSize, setFontSizeState] = useState(14.5);
  const [wrapped, setWrapped] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pos, setPos] = useState("Ln 1, Col 1");
  const [stats, setStats] = useState("");
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const onLanguageChangeRef = useRef(onLanguageChange);
  onLanguageChangeRef.current = onLanguageChange;

  const langCompartment = useRef(new Compartment()).current;
  const lintCompartment = useRef(new Compartment()).current;
  const wrapCompartment = useRef(new Compartment()).current;

  const extensions = useMemo(
    () => [
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
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      search({ top: true }),
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onRunRef.current?.();
            return true;
          },
        },
        {
          key: "Mod-s",
          run: () => {
            onSaveRef.current?.();
            return true;
          },
          preventDefault: true,
        },
        { key: "Mod-/", run: toggleLineComment },
        { key: "Mod-d", run: selectNextOccurrence },
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        indentWithTab,
      ]),
      langCompartment.of(LANGUAGES[initialLang].support()),
      lintCompartment.of(initialLang === "javascript" ? [lintGutter(), linter(jsLinter)] : []),
      wrapCompartment.of([]),
      cmTheme,
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    onLanguageChangeRef.current?.(initialLang, LANGUAGES[initialLang]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = cmRef.current?.view;
    if (!view) return;
    view.dispatch({
      effects: [
        langCompartment.reconfigure(LANGUAGES[currentLang].support()),
        lintCompartment.reconfigure(currentLang === "javascript" ? [lintGutter(), linter(jsLinter)] : []),
      ],
    });
    onLanguageChangeRef.current?.(currentLang, LANGUAGES[currentLang]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  useEffect(() => {
    const view = cmRef.current?.view;
    if (!view) return;
    view.dispatch({ effects: wrapCompartment.reconfigure(wrapped ? EditorView.lineWrapping : []) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapped]);

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
        setWrapped(next);
        return next;
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
        <span className="ed__tabs">
          <span className="ed__tab is-active">
            <span className="ed__tab-icon" aria-hidden="true">
              ◆
            </span>
            <span className="ed__tab-name">
              {baseName}.{meta.ext}
            </span>
            <span className="ed__tab-close" aria-hidden="true">
              ×
            </span>
          </span>
        </span>
        <span className="ed__spacer" />
        <Dropdown
          items={LANG_ORDER.map((key) => ({ value: key, label: LANGUAGES[key].label }))}
          value={currentLang}
          onChange={(key) => setCurrentLang(key as LanguageKey)}
          ariaLabel="Language"
          plain
          columns={3}
          compact
        />
        <div className="ed__tools">
          {toolbarStart}
          <button
            className="btn btn--icon"
            type="button"
            title="Smaller text"
            aria-label="Smaller text"
            onClick={() => setFontSizeState((s) => Math.max(11, s - 1))}
          >
            A−
          </button>
          <button
            className="btn btn--icon"
            type="button"
            title="Bigger text"
            aria-label="Bigger text"
            onClick={() => setFontSizeState((s) => Math.min(24, s + 1))}
          >
            A+
          </button>
          <button
            className="btn btn--icon"
            type="button"
            title="Wrap long lines"
            aria-label="Wrap long lines"
            aria-pressed={wrapped}
            style={{ borderColor: wrapped ? "var(--ink)" : undefined }}
            onClick={() => setWrapped((w) => !w)}
          >
            ↵
          </button>
          <button
            className="btn btn--icon"
            type="button"
            title="Fullscreen"
            aria-label="Fullscreen"
            onClick={() => setFullscreen((f) => !f)}
          >
            ⛶
          </button>
        </div>
      </div>
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
        />
      </div>
      <div className="ed__status">
        <span className="ed__ready">{meta.label}</span>
        <span className="ed__pos">{pos}</span>
        <span className="ed__len">{stats}</span>
        <span className="ed__spacer" />
        <span className={`ed__saved${savedFlash ? " is-on" : ""}`}>saved</span>
        <span className="ed__hint">{HINTS[meta.runnable || "none"]}</span>
      </div>
    </div>
  );
});
