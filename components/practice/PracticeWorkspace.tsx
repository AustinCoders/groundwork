"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Crumbs } from "@/components/Crumbs";
import { CodeEditor, type CodeEditorHandle } from "@/components/practice/CodeEditor";
import { Confetti } from "@/components/practice/Confetti";
import { EditorSkeleton } from "@/components/practice/EditorSkeleton";
import { ShortcutHelp } from "@/components/practice/ShortcutHelp";
import { Dropdown } from "@/components/ui/select";
import { isLanguage, LANGUAGES, type LanguageKey } from "@/lib/codeLanguages";
import { gradeResults, isResultLine, parseResultLine, withHarness } from "@/lib/polyglot/grade";
import { starterFor } from "@/lib/polyglot/starters";
import { templatesFor } from "@/lib/playgroundTemplates";
import type { Json, Polyglot } from "@/lib/polyglot/types";
import { useClientValue, useMounted } from "@/lib/hooks";
import type { PracticeExercise } from "@/lib/practiceFree";
import { runPython } from "@/lib/pythonRunner";
import { runReact } from "@/lib/reactRunner";
import { run as runnerRun, transpileTS, type RunnerOutputEntry, type RunnerTestResult } from "@/lib/runner";
import { runSQL } from "@/lib/sqlRunner";
import { isSoundEnabled, playSolvedDing, setSoundEnabled } from "@/lib/sound";
import { code as codeStore, progress, store } from "@/lib/storage";
import type { ChapterLink } from "@/app/practice/PracticeClient";
import { problemHref } from "@/lib/practiceLinks";

// One fetch per problem per visit: a problem's cases are the same in every
// language, and they only matter once the reader leaves JavaScript.
const polyglotCache = new Map<string, Promise<Polyglot>>();

function loadPolyglot(id: string): Promise<Polyglot> {
  let p = polyglotCache.get(id);
  if (!p) {
    p = fetch(`/problems/${id}/cases`)
      .then((r) => (r.ok ? (r.json() as Promise<Polyglot>) : { ok: false as const, reason: "Could not load it." }))
      .catch(() => ({ ok: false as const, reason: "Could not load it — are you offline?" }));
    polyglotCache.set(id, p);
  }
  return p;
}

const MARKS: Record<string, string> = { log: "›", info: "i", warn: "!", error: "✕", system: "·" };

const EDITOR_HEIGHT_KEY = "jsnotes:editor-height";
const EDITOR_HEIGHT_MIN = 220;
const EDITOR_HEIGHT_MAX = 900;

function ResizeHandle({ height, onResize }: { height: number; onResize: (next: number) => void }) {
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  function clamp(v: number) {
    return Math.min(EDITOR_HEIGHT_MAX, Math.max(EDITOR_HEIGHT_MIN, v));
  }

  return (
    <div
      className="resize-handle"
      role="separator"
      aria-orientation="horizontal"
      aria-label="Resize the editor"
      aria-valuenow={Math.round(height)}
      aria-valuemin={EDITOR_HEIGHT_MIN}
      aria-valuemax={EDITOR_HEIGHT_MAX}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { startY: e.clientY, startHeight: height };
      }}
      onPointerMove={(e) => {
        if (!dragRef.current) return;
        onResize(clamp(dragRef.current.startHeight + (e.clientY - dragRef.current.startY)));
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") onResize(clamp(height - 20));
        if (e.key === "ArrowDown") onResize(clamp(height + 20));
      }}
    >
      <span className="resize-handle__grip" aria-hidden="true" />
    </div>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable ||
    Boolean(target.closest(".cm-editor"))
  );
}

function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
  }
  return Promise.resolve(false);
}

function CopyButton({ onCopy, label = "Copy the code" }: { onCopy: () => string; label?: string }) {
  const [flash, setFlash] = useState<"ok" | "fail" | null>(null);

  return (
    <button
      className="btn btn--icon"
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        copyText(onCopy()).then((ok) => {
          setFlash(ok ? "ok" : "fail");
          setTimeout(() => setFlash(null), 1200);
        });
      }}
    >
      {flash === "ok" ? "✓" : flash === "fail" ? "✕" : "⧉"}
    </button>
  );
}

export interface WorkspaceOutcome {
  passed: number;
  total: number;
  hintsUsed: number;
  sawSolution: boolean;
}

export function PracticeWorkspace({
  exercise,
  isFree,
  chapter,
  prev,
  next,
  interview = false,
  onOutcome,
}: {
  exercise: PracticeExercise;
  isFree: boolean;
  chapter: ChapterLink | null;
  prev: PracticeExercise | null;
  next: PracticeExercise | null;
  /**
   * Inside a mock interview: no way off to other problems, no "solved" badge
   * from last time, and the editor starts from the starter code rather than
   * whatever was saved from practising this one before.
   */
  interview?: boolean;
  /** Called whenever the tests run, a hint is opened or the solution is shown —
   *  everything the mock interview scores a coding question on. */
  onOutcome?: (outcome: WorkspaceOutcome) => void;
}) {
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const runningRef = useRef<{ stop: () => void } | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isComponent = exercise.kind === "component";
  const currentLangRef = useRef<LanguageKey>("javascript");

  const mounted = useMounted();
  const [currentLang, setCurrentLang] = useState<LanguageKey>("javascript");
  const [activeTab, setActiveTab] = useState<"console" | "tests">("console");
  const [consoleLines, setConsoleLines] = useState<RunnerOutputEntry[]>([]);
  const [consolePhase, setConsolePhase] = useState<"idle" | "running" | "compiling" | "ran" | "cleared">("idle");
  const [runMs, setRunMs] = useState<number | null>(null);
  const runStartRef = useRef(0);
  const [testResults, setTestResults] = useState<RunnerTestResult[] | null>(null);
  const alreadySolved = useClientValue(() => !isFree && progress.isExerciseSolved(exercise.id), false);
  const [justSolved, setJustSolved] = useState(false);
  const solved = alreadySolved || justSolved;
  const [hintsShown, setHintsShown] = useState(0);
  const [sawSolution, setSawSolution] = useState(false);
  // The problem as any language sees it: its signature and recorded cases.
  const [polyglot, setPolyglot] = useState<Polyglot | null>(null);

  // Reports only when what is scored changes; a new onOutcome from the parent
  // on every render must not re-fire it.
  const reportOutcome = useEffectEvent((outcome: WorkspaceOutcome) => onOutcome?.(outcome));
  useEffect(() => {
    const results = testResults || [];
    reportOutcome({
      passed: results.filter((r) => r.ok).length,
      total: testResults?.length || exercise.tests.length,
      hintsUsed: hintsShown,
      sawSolution,
    });
  }, [testResults, hintsShown, sawSolution, exercise.tests.length]);

  const savedEditorHeight = useClientValue(() => store.get<number>(EDITOR_HEIGHT_KEY, 430), 430);
  const [editorHeightOverride, setEditorHeightOverride] = useState<number | null>(null);
  const editorHeight = editorHeightOverride ?? savedEditorHeight;

  const [soundOn, setSoundOnState] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const kick = setTimeout(() => setSoundOnState(isSoundEnabled()), 0);
    return () => clearTimeout(kick);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOnState(next);
    setSoundEnabled(next);
  }

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "?" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") setShortcutsOpen((o) => (o ? false : o));
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, []);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" && editorRef.current?.isFullscreen()) {
        editorRef.current.toggleFullscreen(false);
      }
    }
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
      runningRef.current?.stop();
    };
  }, []);

  const langKey = `jsnotes:lang:${exercise.id}`;
  // An interview starts clean: JavaScript, the starter code, nothing carried
  // over from practising the same problem last week.
  const storedLanguage = mounted && !interview ? store.get<string>(langKey, "javascript") : "javascript";
  const initialLanguage: LanguageKey = isLanguage(storedLanguage) ? storedLanguage : "javascript";
  const savedCode = mounted && !interview ? codeStore.load(exercise.id, initialLanguage) : null;
  // Opening straight into another language shows JavaScript's starter only
  // until that language's starter has loaded (see handleLanguageChange).
  const initialValue = savedCode != null ? savedCode : exercise.starter;

  /** Where a language starts: its own starter written from the problem's
   *  signature, or a note saying why this problem only works in JavaScript. */
  function starterIn(lang: LanguageKey, poly: Polyglot | null): string {
    if (isFree) return templatesFor(lang)[0]?.code ?? `${LANGUAGES[lang].comment} Playground — write anything.\n`;
    if (lang === "javascript" || lang === "sql") return lang === "sql" ? "" : exercise.starter;
    if (poly?.ok) return starterFor(lang, poly.signature, exercise.title);
    if (lang === "typescript") return exercise.starter;
    const c = LANGUAGES[lang].comment;
    return `${c} ${exercise.title}\n${c} ${poly ? poly.reason : "Loading…"}\n${c} Switch to JavaScript to solve it with its tests.\n`;
  }

  async function handleLanguageChange(lang: LanguageKey) {
    if (!interview) store.set(langKey, lang);
    currentLangRef.current = lang;
    setCurrentLang(lang);
    setTestResults(null);
    // Each language keeps its own copy of your code for this problem.
    const saved = interview ? null : codeStore.load(exercise.id, lang);
    if (saved != null) editorRef.current?.setValue(saved);
    const needsCases = !isFree && lang !== "javascript" && lang !== "sql";
    if (!needsCases) {
      if (saved == null) editorRef.current?.setValue(starterIn(lang, null));
      return;
    }
    if (saved == null) editorRef.current?.setValue(starterIn(lang, polyglot));
    const poly = await loadPolyglot(exercise.id);
    setPolyglot(poly);
    // The reader may have picked another language while this loaded.
    if (currentLangRef.current === lang && saved == null) editorRef.current?.setValue(starterIn(lang, poly));
  }

  // Tests run in JavaScript and TypeScript as written, and in any language
  // with a grader as the recorded cases.
  const hasTests = !isFree && exercise.tests.length > 0;
  const gradesInLanguage = currentLang === "python" && polyglot?.ok === true;
  const showsTestButton =
    hasTests && (currentLang === "javascript" || currentLang === "typescript" || gradesInLanguage);
  const skippedHere = gradesInLanguage && polyglot?.ok ? polyglot.skipped : 0;

  function finishTests(results: RunnerTestResult[]) {
    setTestResults(results);
    if (results.length && results.every((r) => r.ok) && !isFree) {
      progress.setExerciseSolved(exercise.id, true);
      setJustSolved(true);
      playSolvedDing();
    }
  }

  /** A run has finished: show that it did, and how long it took. */
  function markRan() {
    setConsolePhase("ran");
    setRunMs(Math.round(performance.now() - runStartRef.current));
  }

  function runCode(withTests: boolean) {
    const editor = editorRef.current;
    if (!editor) return;
    runningRef.current?.stop();

    const meta = editor.getLanguageMeta();

    setConsoleLines([]);
    setConsolePhase("running");
    setRunMs(null);
    runStartRef.current = performance.now();
    setActiveTab(withTests ? "tests" : "console");
    if (withTests) setTestResults(null);

    function startRunner(code: string, tests: boolean) {
      runningRef.current = runnerRun({
        code,
        tests: tests ? exercise.tests : [],
        timeout: 5000,
        onConsole: (entry) => setConsoleLines((prev) => [...prev, entry]),
        onDone: (payload) => {
          runningRef.current = null;
          markRan();
          if (tests) finishTests(payload.results || []);
        },
      });
    }

    if (!meta.runnable) {
      markRan();
      setConsoleLines([
        {
          kind: "system",
          text: `No ${meta.label} compiler runs in a browser, so this editor can write ${meta.label} but not run it. Run it in your own toolchain, or switch to a language marked “Runs here”.`,
        },
      ]);
      return;
    }

    if (meta.runnable === "js" && isComponent) {
      const host = previewRef.current;
      if (!host) return;
      runningRef.current = runReact({
        code: editor.getValue(),
        tests: withTests ? exercise.tests : [],
        mountApp: !withTests,
        container: host,
        timeout: 8000,
        onConsole: (entry) => setConsoleLines((prev) => [...prev, entry]),
        onDone: (payload) => {
          runningRef.current = null;
          markRan();
          if (withTests) finishTests(payload.results || []);
        },
      });
      return;
    }

    if (meta.runnable === "js") {
      startRunner(editor.getValue(), withTests);
      return;
    }

    if (meta.runnable === "python") {
      const grading = withTests && polyglot?.ok ? polyglot : null;
      const rows: [number, number, Json, string?][] = [];
      runningRef.current = runPython({
        code: grading ? withHarness("python", editor.getValue(), grading) : editor.getValue(),
        onConsole: (entry) => {
          // The grader's lines are results, not output the reader wrote.
          if (grading && entry.kind === "log" && isResultLine(entry.text)) {
            rows.push(...parseResultLine(entry.text));
            const rest = entry.text
              .split("\n")
              .filter((l) => !isResultLine(l))
              .join("\n");
            if (!rest.trim()) return;
            entry = { ...entry, text: rest };
          }
          setConsoleLines((prev) => [...prev, entry]);
        },
        onDone: () => {
          runningRef.current = null;
          markRan();
          if (grading) finishTests(gradeResults(grading, rows));
        },
      });
      return;
    }

    if (meta.runnable === "sql") {
      runningRef.current = runSQL({
        code: editor.getValue(),
        onConsole: (entry) => setConsoleLines((prev) => [...prev, entry]),
        onDone: () => {
          runningRef.current = null;
          markRan();
        },
      });
      return;
    }

    setConsolePhase("compiling");
    transpileTS(editor.getValue())
      .then((jsCode) => {
        setConsoleLines([]);
        startRunner(jsCode, withTests);
      })
      .catch((err) => {
        markRan();
        setConsoleLines([{ kind: "error", text: `Compile error: ${err && err.message ? err.message : String(err)}` }]);
      });
  }

  const allExercisesLevelHref = `/path?topic=js&level=${exercise.level}`;

  // The playground is a scratch space, not a problem: no statement beside it,
  // the output next to the code, and languages one tap away.
  const playground = isFree && !interview;
  const runnable = Boolean(LANGUAGES[currentLang].runnable);
  const errored = consoleLines.some((l) => l.kind === "error");
  const templates = templatesFor(currentLang);

  function loadTemplate(name: string) {
    const t = templates.find((x) => x.name === name);
    const editor = editorRef.current;
    if (!t || !editor) return;
    const current = editor.getValue();
    const untouched = !current.trim() || templates.some((x) => x.code === current);
    if (!untouched && !window.confirm(`Replace what is in the editor with “${t.name}”?`)) return;
    editor.setValue(t.code);
    editor.focus();
  }

  function consoleText(): string {
    return consoleLines
      .map((l) => (l.kind === "table" ? [l.columns.join("\t"), ...l.rows.map((r) => r.join("\t"))].join("\n") : l.text))
      .join("\n");
  }

  return (
    <>
      <Confetti fire={justSolved} />
      <div className={`lc-topbar${playground ? " lc-topbar--playground" : ""}`}>
        {playground ? (
          <div className="pg-head">
            <h1 className="pg-head__title">
              <span aria-hidden="true">✎</span> Playground
            </h1>
            <div className="pg-langs" role="group" aria-label="Quick language">
              {(["javascript", "typescript", "python", "sql"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className="pg-lang"
                  aria-pressed={currentLang === key}
                  onClick={() => editorRef.current?.setLanguage(key)}
                >
                  <span className="pg-lang__ext" aria-hidden="true">
                    {LANGUAGES[key].ext}
                  </span>
                  {LANGUAGES[key].label}
                </button>
              ))}
            </div>
          </div>
        ) : interview ? (
          <div />
        ) : (
          <div className="lc-topbar__nav">
            <Link className="lc-icon-btn" href="/problems" title="Problem list" aria-label="Problem list">
              ☰
            </Link>
            <span className="lc-topbar__divider" aria-hidden="true" />
            {!isFree && prev ? (
              <Link
                className="lc-icon-btn"
                href={problemHref(prev.id)}
                title={`Previous: ${prev.title}`}
                aria-label={`Previous problem: ${prev.title}`}
              >
                ‹
              </Link>
            ) : (
              <span className="lc-icon-btn is-disabled" aria-hidden="true">
                ‹
              </span>
            )}
            {!isFree && next ? (
              <Link
                className="lc-icon-btn"
                href={problemHref(next.id)}
                title={`Next: ${next.title}`}
                aria-label={`Next problem: ${next.title}`}
              >
                ›
              </Link>
            ) : (
              <span className="lc-icon-btn is-disabled" aria-hidden="true">
                ›
              </span>
            )}
          </div>
        )}
        <div className="lc-topbar__actions">
          {playground && templates.length > 1 && (
            <Dropdown
              items={templates.map((t) => ({ value: t.name, label: t.name }))}
              value=""
              placeholder="Examples"
              onChange={loadTemplate}
              ariaLabel="Load an example"
              compact
            />
          )}
          <button
            className="btn btn--run"
            type="button"
            title="Run the code (⌘/Ctrl + Enter)"
            aria-label="Run the code"
            onClick={() => runCode(false)}
          >
            ▶ Run
          </button>
          {!isFree && exercise.tests.length > 0 && (
            <button
              className="btn btn--test"
              type="button"
              style={{ display: showsTestButton ? undefined : "none" }}
              title="Submit — run every test"
              aria-label="Submit"
              onClick={() => runCode(true)}
            >
              ☁ Submit
            </button>
          )}
          <button
            className="lc-icon-btn"
            type="button"
            title={soundOn ? "Mute the solved sound" : "Unmute the solved sound"}
            aria-label={soundOn ? "Mute the solved sound" : "Unmute the solved sound"}
            onClick={toggleSound}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button
            className="lc-icon-btn"
            type="button"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            onClick={() => setShortcutsOpen(true)}
          >
            ⌨
          </button>
        </div>
      </div>

      <ShortcutHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      <div className={`practice-layout${playground ? " practice-layout--playground" : ""}`}>
        {!playground && (
          <aside className="brief" id="brief">
            <div className="brief__tabs" role="tablist" aria-label="Problem panel">
              <span className="brief__tab is-active" role="tab" aria-selected="true">
                Description
              </span>
            </div>
            <div className="brief__scroll">
              {!interview && (
                <Crumbs
                  items={[
                    { label: "All topics", href: "/" },
                    { label: "JavaScript", href: "/notes" },
                    { label: chapter ? chapter.short : "Playground" },
                  ]}
                />
              )}
              <h1 id="ex-title">{exercise.title}</h1>
              <div className="brief__meta" id="ex-meta">
                {isFree ? (
                  <span className="tag">no tests · nothing to pass</span>
                ) : (
                  <>
                    <span className={`tag tag--${exercise.level}`}>{exercise.level}</span>
                    {chapter && (
                      <span className="tag">
                        layer {chapter.num} · {chapter.short}
                      </span>
                    )}
                    <span className="tag">
                      {exercise.tests.length} {exercise.tests.length === 1 ? "test" : "tests"}
                    </span>
                    {solved && !interview && <span className="tag tag--done">solved ✓</span>}
                  </>
                )}
              </div>
              <div
                className="brief__body"
                id="ex-body"
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: exercise.brief }}
              />

              {!(isFree && !exercise.solution) && (
                <div className="brief__section" id="hint-section">
                  <h2>Stuck?</h2>
                  <div id="hint-list">
                    {exercise.hints.slice(0, hintsShown).map((hint, i) => (
                      <div className="hint" key={i}>
                        <span className="hint__num">hint {i + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: hint }} />
                      </div>
                    ))}
                  </div>
                  {!isFree && exercise.hints.length > 0 && (
                    <button
                      className="btn"
                      id="hint-btn"
                      type="button"
                      disabled={hintsShown >= exercise.hints.length}
                      onClick={() => setHintsShown((n) => Math.min(exercise.hints.length, n + 1))}
                    >
                      {hintsShown >= exercise.hints.length
                        ? "That was the last hint"
                        : hintsShown === 0
                          ? "Show a hint"
                          : `Another hint (${exercise.hints.length - hintsShown} left)`}
                    </button>
                  )}{" "}
                  {exercise.solution && (
                    <button
                      className="btn"
                      id="solution-btn"
                      type="button"
                      onClick={() => {
                        if (
                          !window.confirm("Replace what you have written with the solution? Your version is not kept.")
                        )
                          return;
                        editorRef.current?.setValue(exercise.solution!);
                        editorRef.current?.focus();
                        setSawSolution(true);
                      }}
                    >
                      Show the solution
                    </button>
                  )}
                </div>
              )}

              {!interview && (
                <nav className="brief__nav" id="ex-nav" aria-label="Other exercises">
                  <Link className="btn" href={allExercisesLevelHref}>
                    All exercises
                  </Link>
                  {!isFree && (
                    <Link className="btn" href="/practice?id=free">
                      Playground
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </aside>
        )}

        <div className="workbench">
          {mounted ? (
            <CodeEditor
              ref={editorRef}
              filename={isFree ? "playground" : exercise.id}
              language={initialLanguage}
              value={initialValue}
              height={editorHeight}
              onChange={(value) => {
                if (!interview) codeStore.save(exercise.id, value, currentLangRef.current);
              }}
              onRun={() => runCode(false)}
              onSave={() => {
                const editor = editorRef.current;
                if (!editor) return;
                codeStore.save(exercise.id, editor.getValue(), currentLangRef.current);
                editor.flashSaved();
              }}
              onLanguageChange={handleLanguageChange}
              toolbarStart={
                <>
                  <button
                    className="btn btn--icon"
                    type="button"
                    title="Reset to the starting code"
                    aria-label="Reset to the starting code"
                    onClick={() => {
                      if (!window.confirm("Throw away your version and start again?")) return;
                      const lang = currentLangRef.current;
                      codeStore.clear(exercise.id, lang);
                      editorRef.current?.setValue(starterIn(lang, polyglot));
                      editorRef.current?.focus();
                    }}
                  >
                    ↺
                  </button>
                  <CopyButton onCopy={() => editorRef.current?.getValue() ?? ""} />
                </>
              }
            />
          ) : (
            <EditorSkeleton />
          )}

          {mounted && !playground && (
            <ResizeHandle
              height={editorHeight}
              onResize={(next) => {
                setEditorHeightOverride(next);
                store.set(EDITOR_HEIGHT_KEY, next);
              }}
            />
          )}

          {isComponent && (
            <section className="panel preview-panel" aria-label="Preview">
              <div className="preview-panel__bar">Preview</div>
              <div className="preview-panel__host" ref={previewRef}>
                <p className="panel__empty">Run to see your component here.</p>
              </div>
            </section>
          )}

          <section className="panel">
            <div className="panel__tabs">
              <div className="panel__tablist" role="tablist" aria-label="Output">
                <button
                  className={`tab${activeTab === "console" ? " is-active" : ""}`}
                  id="tab-console"
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "console"}
                  aria-controls="view-console"
                  onClick={() => setActiveTab("console")}
                >
                  Console{" "}
                  <span className="tab__count" id="console-count">
                    {consoleLines.length}
                  </span>
                </button>
                {!playground && (
                  <button
                    className={`tab${activeTab === "tests" ? " is-active" : ""}`}
                    id="tab-tests"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "tests"}
                    aria-controls="view-tests"
                    onClick={() => setActiveTab("tests")}
                  >
                    Test Result{" "}
                    <span
                      className={`tab__count${testResults ? (testResults.every((r) => r.ok) ? " is-pass" : " is-fail") : ""}`}
                      id="tests-count"
                    >
                      {testResults ? `${testResults.filter((r) => r.ok).length}/${testResults.length}` : "—"}
                    </span>
                  </button>
                )}
              </div>
              <span className="ed__spacer" style={{ flex: 1 }} />
              {playground && runnable && consolePhase !== "idle" && consolePhase !== "cleared" && (
                <span
                  className="run-status"
                  data-state={consolePhase === "ran" ? (errored ? "error" : "ok") : "running"}
                  aria-live="polite"
                >
                  {consolePhase === "ran"
                    ? `${errored ? "✕ error" : "✓ ran"}${runMs !== null ? ` · ${runMs < 1000 ? `${runMs} ms` : `${(runMs / 1000).toFixed(1)} s`}` : ""}`
                    : consolePhase === "compiling"
                      ? "compiling…"
                      : "running…"}
                </span>
              )}
              {playground && consoleLines.length > 0 && <CopyButton onCopy={consoleText} label="Copy output" />}
              <button
                className="btn btn--ghost"
                id="clear-console"
                type="button"
                onClick={() => {
                  setConsoleLines([]);
                  setConsolePhase("cleared");
                }}
              >
                Clear
              </button>
            </div>

            <div className="panel__body">
              <div
                className={`panel__view${activeTab === "console" ? " is-active" : ""}`}
                id="view-console"
                role="tabpanel"
              >
                {consoleLines.length === 0 ? (
                  <p className="panel__empty">
                    {consolePhase === "compiling" ? (
                      "Compiling…"
                    ) : consolePhase === "cleared" ? (
                      "Cleared. Run something."
                    ) : consolePhase === "ran" ? (
                      "Ran with no output — nothing was logged."
                    ) : (
                      <>
                        Nothing yet — hit <b>Run</b> and whatever you log shows up here.
                      </>
                    )}
                  </p>
                ) : (
                  consoleLines.map((entry, i) =>
                    entry.kind === "table" ? (
                      <div className="sql-result" key={i}>
                        <div className="sql-result__scroll">
                          <table>
                            <thead>
                              <tr>
                                {entry.columns.map((col, c) => (
                                  <th key={c}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {entry.rows.map((row, r) => (
                                <tr key={r}>
                                  {row.map((cell, c) => (
                                    <td key={c}>{cell === null ? <em>null</em> : String(cell)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="sql-result__count">
                          {entry.rows.length} {entry.rows.length === 1 ? "row" : "rows"}
                        </p>
                      </div>
                    ) : (
                      <div className={`line line--${entry.kind}`} key={i}>
                        <span className="line__mark">{MARKS[entry.kind] || "›"}</span>
                        <span>{entry.text}</span>
                      </div>
                    )
                  )
                )}
              </div>
              <div
                className={`panel__view${activeTab === "tests" ? " is-active" : ""}`}
                id="view-tests"
                role="tabpanel"
              >
                {!testResults ? (
                  <p className="panel__empty">Submit to see how you did.</p>
                ) : testResults.length === 0 ? (
                  <p className="panel__empty">No test results — did the code crash before it got there?</p>
                ) : (
                  <>
                    <div className={`verdict verdict--${testResults.every((r) => r.ok) ? "pass" : "fail"}`}>
                      {testResults.every((r) => r.ok)
                        ? `All ${testResults.length} tests pass — nicely done.`
                        : `${testResults.filter((r) => r.ok).length} of ${testResults.length} passing. Keep going.`}
                    </div>
                    {skippedHere > 0 && (
                      <p className="test__note">
                        {skippedHere} more {skippedHere === 1 ? "test checks" : "tests check"} a property of the answer
                        (a range, a pattern, an input left alone) that only JavaScript can replay — switch to JavaScript
                        to run {skippedHere === 1 ? "it" : "them"} too.
                      </p>
                    )}
                    {testResults.map((result, i) => (
                      <div className={`test test--${result.ok ? "pass" : "fail"}`} key={i}>
                        <span className="test__mark">{result.ok ? "✓" : "✕"}</span>
                        <span>
                          {result.name}
                          {!result.ok && result.message && <span className="test__why">{result.message}</span>}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="keys">
            <span>
              <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd> run
            </span>
            <span>
              <kbd>⌘/Ctrl</kbd> + <kbd>S</kbd> save
            </span>
            <span>
              <kbd>⌘/Ctrl</kbd> + <kbd>/</kbd> comment
            </span>
            <span>
              <kbd>⌘/Ctrl</kbd> + <kbd>F</kbd> find/replace
            </span>
            <span>
              <kbd>⌘/Ctrl</kbd> + <kbd>D</kbd> select next match
            </span>
            <span>
              <kbd>Alt</kbd> + click multi-cursor
            </span>
            <span>
              <kbd>Tab</kbd> indent · <kbd>⇧Tab</kbd> outdent
            </span>
            <span>
              <kbd>Esc</kbd> leave fullscreen
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
