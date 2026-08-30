"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Crumbs } from "@/components/Crumbs";
import { CodeEditor, type CodeEditorHandle } from "@/components/practice/CodeEditor";
import { EditorSkeleton } from "@/components/practice/EditorSkeleton";
import type { LanguageKey, LanguageMeta } from "@/lib/codeLanguages";
import { useClientValue, useMounted } from "@/lib/hooks";
import type { PracticeExercise } from "@/lib/practiceFree";
import { run as runnerRun, transpileTS, type RunnerConsoleEntry, type RunnerTestResult } from "@/lib/runner";
import { code as codeStore, progress, store } from "@/lib/storage";
import type { ChapterLink } from "@/app/practice/PracticeClient";

const MARKS: Record<string, string> = { log: "›", info: "i", warn: "!", error: "✕", system: "·" };

function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => false
    );
  }
  return Promise.resolve(false);
}

function CopyButton({ onCopy }: { onCopy: () => string }) {
  const [flash, setFlash] = useState<"ok" | "fail" | null>(null);

  return (
    <button
      className="btn btn--icon"
      type="button"
      title="Copy the code"
      aria-label="Copy the code"
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

export function PracticeWorkspace({
  exercise,
  isFree,
  chapter,
  prev,
  next,
}: {
  exercise: PracticeExercise;
  isFree: boolean;
  chapter: ChapterLink | null;
  prev: PracticeExercise | null;
  next: PracticeExercise | null;
}) {
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const runningRef = useRef<{ stop: () => void } | null>(null);

  const mounted = useMounted();
  const [currentLang, setCurrentLang] = useState<LanguageKey>("javascript");
  const [currentLangMeta, setCurrentLangMeta] = useState<LanguageMeta | null>(null);
  const [activeTab, setActiveTab] = useState<"console" | "tests">("console");
  const [consoleLines, setConsoleLines] = useState<RunnerConsoleEntry[]>([]);
  const [consolePhase, setConsolePhase] = useState<"idle" | "compiling" | "ran" | "cleared">("idle");
  const [testResults, setTestResults] = useState<RunnerTestResult[] | null>(null);
  const alreadySolved = useClientValue(() => !isFree && progress.isExerciseSolved(exercise.id), false);
  const [justSolved, setJustSolved] = useState(false);
  const solved = alreadySolved || justSolved;
  const [hintsShown, setHintsShown] = useState(0);

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
  const savedCode = mounted ? codeStore.load(exercise.id) : null;
  const initialLanguage = mounted ? store.get<string>(langKey, "javascript") : "javascript";
  const initialValue = savedCode == null ? exercise.starter : savedCode;

  function handleLanguageChange(lang: LanguageKey, meta: LanguageMeta) {
    store.set(langKey, lang);
    setCurrentLang(lang);
    setCurrentLangMeta(meta);
  }

  const canRun = currentLangMeta ? currentLangMeta.runnable !== null : true;
  const showsTestButton = !isFree && exercise.tests.length > 0 && currentLang === "javascript";

  function runCode(withTests: boolean) {
    const editor = editorRef.current;
    if (!editor) return;
    runningRef.current?.stop();

    const meta = editor.getLanguageMeta();

    if (meta.runnable === null) {
      setConsoleLines([
        {
          kind: "system",
          text: `✎ ${meta.label} has no in-browser runner here — there's no backend to compile or execute it, this editor is for writing it only.`,
        },
      ]);
      setConsolePhase("ran");
      setActiveTab("console");
      return;
    }

    setConsoleLines([]);
    setConsolePhase("idle");
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
          setConsolePhase("ran");
          if (tests) {
            const results = payload.results || [];
            setTestResults(results);
            if (results.length && results.every((r) => r.ok) && !isFree) {
              progress.setExerciseSolved(exercise.id, true);
              setJustSolved(true);
            }
          }
        },
      });
    }

    if (meta.runnable === "js") {
      startRunner(editor.getValue(), withTests);
      return;
    }

    setConsolePhase("compiling");
    transpileTS(editor.getValue())
      .then((jsCode) => {
        setConsoleLines([]);
        startRunner(jsCode, false);
      })
      .catch((err) => {
        setConsolePhase("ran");
        setConsoleLines([{ kind: "error", text: `Compile error: ${err && err.message ? err.message : String(err)}` }]);
      });
  }

  const allExercisesLevelHref = `/path?topic=js&level=${exercise.level}`;

  return (
    <>
      <div className="lc-topbar">
        <div className="lc-topbar__nav">
          <Link className="lc-icon-btn" href="/problems" title="Problem list" aria-label="Problem list">
            ☰
          </Link>
          <span className="lc-topbar__divider" aria-hidden="true" />
          {!isFree && prev ? (
            <Link
              className="lc-icon-btn"
              href={`/practice?id=${prev.id}`}
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
              href={`/practice?id=${next.id}`}
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
        <div className="lc-topbar__actions">
          <button
            className="btn btn--run"
            type="button"
            disabled={!canRun}
            title={
              canRun
                ? "Run the code (⌘/Ctrl + Enter)"
                : `${currentLangMeta?.label ?? "This language"} has no in-browser runner here — there's no backend to compile it.`
            }
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
        </div>
      </div>

      <div className="practice-layout">
        <aside className="brief" id="brief">
          <div className="brief__tabs" role="tablist" aria-label="Problem panel">
            <span className="brief__tab is-active" role="tab" aria-selected="true">
              Description
            </span>
          </div>
          <div className="brief__scroll">
            <Crumbs
              items={[
                { label: "All topics", href: "/" },
                { label: "JavaScript", href: "/notes" },
                { label: chapter ? chapter.short : "Playground" },
              ]}
            />
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
                  {solved && <span className="tag tag--done">solved ✓</span>}
                </>
              )}
            </div>
            <div className="brief__body" id="ex-body" dangerouslySetInnerHTML={{ __html: exercise.brief }} />

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
                      if (!window.confirm("Replace what you have written with the solution? Your version is not kept."))
                        return;
                      editorRef.current?.setValue(exercise.solution!);
                      editorRef.current?.focus();
                    }}
                  >
                    Show the solution
                  </button>
                )}
              </div>
            )}

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
          </div>
        </aside>

        <div className="workbench">
          {mounted ? (
            <CodeEditor
              ref={editorRef}
              filename={isFree ? "playground" : exercise.id}
              language={initialLanguage}
              value={initialValue}
              height={430}
              onChange={(value) => codeStore.save(exercise.id, value)}
              onRun={() => runCode(false)}
              onSave={() => {
                const editor = editorRef.current;
                if (!editor) return;
                codeStore.save(exercise.id, editor.getValue());
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
                      codeStore.clear(exercise.id);
                      editorRef.current?.setValue(exercise.starter);
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

          <section className="panel">
            <div className="panel__tabs" role="tablist">
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
              <span className="ed__spacer" style={{ flex: 1 }} />
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
                  consoleLines.map((entry, i) => (
                    <div className={`line line--${entry.kind}`} key={i}>
                      <span className="line__mark">{MARKS[entry.kind] || "›"}</span>
                      <span>{entry.text}</span>
                    </div>
                  ))
                )}
              </div>
              <div className={`panel__view${activeTab === "tests" ? " is-active" : ""}`} id="view-tests" role="tabpanel">
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
