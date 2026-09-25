"use client";

import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { Crumbs } from "@/components/Crumbs";
import { BackButton } from "@/components/practice/BackButton";
import { CodeEditor, type CodeEditorHandle } from "@/components/practice/CodeEditor";
import { Confetti } from "@/components/practice/Confetti";
import { EditorSkeleton } from "@/components/practice/EditorSkeleton";
import { ShortcutHelp } from "@/components/practice/ShortcutHelp";
import { TopIcon } from "@/components/practice/TopIcon";
import { SiteDrawer } from "@/components/SiteDrawer";
import { Dropdown } from "@/components/ui/select";
import { isLanguage, LANG_ORDER, LANGUAGES, type LanguageKey } from "@/lib/codeLanguages";
import { canGrade, gradeResults, isResultLine, parseResultLine, withHarness } from "@/lib/polyglot/grade";
import { starterFor } from "@/lib/polyglot/starters";
import { instrumentCode, type EditorProblem } from "@/lib/editor/tools";
import type { Trace } from "@/lib/debug/view";
import { DebugPanel } from "@/components/practice/DebugPanel";
import { groupByLine } from "@/lib/editor/inline";
import { PAGE_SCRIPT, templatesFor } from "@/lib/playgroundTemplates";
import { buildPage, pageFor, PREVIEW_MESSAGE } from "@/lib/webPreview";
import { hasShare, readShare, shareUrl } from "@/lib/shareLink";
import {
  clearRuns,
  recordRun,
  runsSnapshot,
  serverRunsSnapshot,
  subscribeRuns,
  type RunRecord,
} from "@/lib/runHistory";
import {
  langForName,
  loadProject,
  uniqueName,
  makeFile,
  saveProject,
  starterCode,
  type PgFile,
  type Project,
} from "@/lib/playgroundProject";
import type { Json, Polyglot } from "@/lib/polyglot/types";
import { useClientValue, useMounted } from "@/lib/hooks";
import type { PracticeExercise } from "@/lib/practiceFree";
import { runPython } from "@/lib/pythonRunner";
import { runScript, warmScript } from "@/lib/scriptRunner";
import { runReact } from "@/lib/reactRunner";
import { run as runnerRun, transpileTS, type RunnerOutputEntry, type RunnerTestResult } from "@/lib/runner";
import { runSQL } from "@/lib/sqlRunner";
import { isSoundEnabled, playSolvedDing, setSoundEnabled } from "@/lib/sound";
import { code as codeStore, progress, store } from "@/lib/storage";
import type { ChapterLink, NeighbourLink } from "@/app/practice/PracticeClient";
import { problemHref } from "@/lib/problemHref";

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
const LIVE_KEY = "jsnotes:playground-live";
const STDIN_KEY = "groundwork:playground:stdin";
const QUICK_LANGS: readonly LanguageKey[] = ["javascript", "typescript", "python", "sql", "html", "css"];
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
      data-tip={label}
      aria-label={label}
      onClick={() => {
        copyText(onCopy()).then((ok) => {
          setFlash(ok ? "ok" : "fail");
          setTimeout(() => setFlash(null), 1200);
        });
      }}
    >
      <TopIcon name={flash === "ok" ? "check" : flash === "fail" ? "cross" : "copy"} size={16} />
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
  prev: NeighbourLink | null;
  next: NeighbourLink | null;
  interview?: boolean;
  onOutcome?: (outcome: WorkspaceOutcome) => void;
}) {
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const runningRef = useRef<{ stop: () => void } | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const isComponent = exercise.kind === "component";
  const currentLangRef = useRef<LanguageKey>("javascript");

  const mounted = useMounted();
  const [currentLang, setCurrentLang] = useState<LanguageKey>("javascript");
  const [debugRun, setDebugRun] = useState<{ trace: Trace; output: RunnerOutputEntry[] } | null>(null);
  const showDebugLine = useCallback((line: number | null) => editorRef.current?.showDebugLine(line), []);
  const [activeTab, setActiveTab] = useState<
    "console" | "tests" | "problems" | "preview" | "history" | "input" | "debug"
  >("console");
  const storedStdin = useClientValue(() => (isFree && !interview ? store.get<string>(STDIN_KEY, "") : ""), "");
  const [stdinOverride, setStdin] = useState<string | null>(null);
  const stdin = stdinOverride ?? storedStdin;
  const runs = useSyncExternalStore(subscribeRuns, runsSnapshot, serverRunsSnapshot);
  const recordedRunRef = useRef(0);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewRun, setPreviewRun] = useState(0);
  const pageFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [problems, setProblems] = useState<EditorProblem[]>([]);
  const [consoleLines, setConsoleLines] = useState<RunnerOutputEntry[]>([]);
  const [consolePhase, setConsolePhase] = useState<"idle" | "running" | "compiling" | "ran" | "cleared">("idle");
  const [runMs, setRunMs] = useState<number | null>(null);
  const storedLive = useClientValue(() => isFree && !interview && store.get<boolean>(LIVE_KEY, false), false);
  const [liveOverride, setLive] = useState<boolean | null>(null);
  const live = liveOverride ?? storedLive;
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runStartRef = useRef(0);
  const [testResults, setTestResults] = useState<RunnerTestResult[] | null>(null);
  const alreadySolved = useClientValue(() => !isFree && progress.isExerciseSolved(exercise.id), false);
  const [justSolved, setJustSolved] = useState(false);
  const solved = alreadySolved || justSolved;
  const [hintsShown, setHintsShown] = useState(0);
  const [sawSolution, setSawSolution] = useState(false);
  const [polyglot, setPolyglot] = useState<Polyglot | null>(null);

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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

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
  const [project, setProject] = useState<Project | null>(() =>
    isFree && !interview && typeof window !== "undefined" ? loadProject() : null
  );
  const projectRef = useRef(project);
  const projectSaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeFile = project?.files.find((f) => f.id === project.active) ?? null;

  const storedLanguage = mounted && !interview ? store.get<string>(langKey, "javascript") : "javascript";
  const initialLanguage: LanguageKey = activeFile
    ? activeFile.lang
    : isLanguage(storedLanguage)
      ? storedLanguage
      : "javascript";
  const savedCode = mounted && !interview && !activeFile ? codeStore.load(exercise.id, initialLanguage) : null;
  const initialValue = activeFile ? activeFile.code : savedCode != null ? savedCode : exercise.starter;

  function commitProject(next: Project) {
    projectRef.current = next;
    setProject(next);
    clearTimeout(projectSaveRef.current);
    saveProject(next);
  }

  function activate(next: Project, file: PgFile) {
    commitProject({ ...next, active: file.id });
    const editor = editorRef.current;
    if (!editor) return;
    editor.setValue(file.code);
    if (editor.getLanguage() !== file.lang) editor.setLanguage(file.lang);
    editor.focus();
  }

  function openLanguage(lang: LanguageKey) {
    const p = projectRef.current!;
    currentLangRef.current = lang;
    setCurrentLang(lang);
    const active = p.files.find((f) => f.id === p.active);
    if (active?.lang === lang) return;
    const existing = p.files.find((f) => f.lang === lang);
    if (existing) return activate(p, existing);
    if (lang === "html") return activate(...newPage(p.files));
    const file = makeFile(p.files, lang, undefined, lang === "css" ? "style" : "scratch");
    activate({ ...p, files: [...p.files, file] }, file);
  }

  function newPage(files: PgFile[]): [Project, PgFile] {
    const page = makeFile(files, "html", undefined, "index");
    const next = [...files, page];
    if (!next.some((f) => f.name === "style.css")) next.push(makeFile(next, "css", undefined, "style"));
    if (!next.some((f) => f.name === "script.js")) next.push(makeFile(next, "javascript", PAGE_SCRIPT, "script"));
    return [{ files: next, active: page.id }, page];
  }

  const hasPage = mounted && Boolean(project?.files.some((f) => f.lang === "html"));
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed" | "too-big">("idle");

  async function share() {
    const p = projectRef.current;
    if (!p) return;
    const url = await shareUrl(p.files.map(({ name, lang, code }) => ({ name, lang, code })));
    const state = url.length > 60_000 ? "too-big" : (await copyText(url)) ? "copied" : "failed";
    setShareState(state);
    setTimeout(() => setShareState("idle"), 2500);
  }

  useEffect(() => {
    if (!projectRef.current) return;
    async function openShared() {
      if (!hasShare(location.hash)) return;
      const shared = await readShare(location.hash);
      history.replaceState(null, "", location.pathname + location.search);
      const p = projectRef.current;
      if (!shared || !p) return;
      const files = [...p.files];
      const added = shared.map((f) => {
        const base = f.name.replace(/\.[^.]+$/, "") || "shared";
        const file = { ...makeFile(files, f.lang, f.code, base) };
        files.push(file);
        return file;
      });
      activate({ ...p, files }, added[0]);
      setConsoleLines([
        {
          kind: "system",
          text: `Opened ${added.length} shared ${added.length === 1 ? "file" : "files"} as new tabs — your own files are untouched.`,
        },
      ]);
    }
    void openShared();
    window.addEventListener("hashchange", openShared);
    return () => window.removeEventListener("hashchange", openShared);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function webPage(): PgFile | null {
    const p = projectRef.current;
    if (!p) return null;
    return pageFor(p.files, p.files.find((f) => f.id === p.active) ?? null);
  }

  function renderPreview() {
    const p = projectRef.current;
    const page = webPage();
    if (!p || !page) return false;
    runningRef.current?.stop();
    setConsoleLines([]);
    setConsolePhase("running");
    setRunMs(null);
    runStartRef.current = performance.now();
    setPreviewDoc(buildPage(p.files, page));
    setPreviewRun((n) => n + 1);
    setActiveTab("preview");
    return true;
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { source?: string; kind?: string; text?: string } | null;
      if (!data || data.source !== PREVIEW_MESSAGE || event.source !== pageFrameRef.current?.contentWindow) return;
      if (data.kind === "ready") return markRan();
      const kind = data.kind === "warn" || data.kind === "error" || data.kind === "info" ? data.kind : "log";
      setConsoleLines((prev) => [...prev, { kind, text: String(data.text ?? "") }]);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  const [closed, setClosed] = useState<PgFile[] | null>(null);
  const closedTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function rememberClosed(files: PgFile[]) {
    clearTimeout(closedTimerRef.current);
    setClosed(files.length ? files : null);
    if (files.length) closedTimerRef.current = setTimeout(() => setClosed(null), 10_000);
  }

  function reopenClosed() {
    const p = projectRef.current;
    if (!p || !closed?.length) return;
    const files = [...p.files];
    const back = closed.map((f) => {
      const file = { ...f, name: uniqueName(files, f.name.replace(/\.[^.]+$/, ""), LANGUAGES[f.lang].ext) };
      files.push(file);
      return file;
    });
    clearTimeout(closedTimerRef.current);
    setClosed(null);
    activate({ ...p, files }, back[0]);
  }

  const fileActions = {
    onSelect(id: string) {
      const p = projectRef.current!;
      const file = p.files.find((f) => f.id === id);
      if (file && id !== p.active) activate(p, file);
    },
    onClose(id: string) {
      const p = projectRef.current!;
      const file = p.files.find((f) => f.id === id);
      if (!file || p.files.length < 2) return;
      rememberClosed([file]);
      const index = p.files.indexOf(file);
      const files = p.files.filter((f) => f.id !== id);
      if (id !== p.active) return commitProject({ ...p, files });
      activate({ ...p, files }, files[Math.min(index, files.length - 1)]);
    },
    onCloseMany(ids: string[]) {
      const p = projectRef.current!;
      const closing = p.files.filter((f) => ids.includes(f.id));
      if (!closing.length) return;
      rememberClosed(closing.filter((f) => f.code.trim() && f.code !== starterCode(f.lang)));
      const kept = p.files.filter((f) => !ids.includes(f.id));
      const files = kept.length ? kept : [makeFile([], currentLangRef.current)];
      const active = files.find((f) => f.id === p.active) ?? files[0];
      activate({ ...p, files }, active);
    },
    onNew() {
      const p = projectRef.current!;
      const file = makeFile(p.files, currentLangRef.current);
      activate({ ...p, files: [...p.files, file] }, file);
    },
    onRename(id: string, name: string) {
      const p = projectRef.current!;
      const file = p.files.find((f) => f.id === id);
      const clean = name.trim().replace(/[\\/]/g, "");
      if (!file || !clean || clean === file.name || p.files.some((f) => f.id !== id && f.name === clean)) return;
      const lang = langForName(clean) ?? file.lang;
      const renamed = { ...file, name: clean, lang };
      const next = { ...p, files: p.files.map((f) => (f.id === id ? renamed : f)) };
      commitProject(next);
      if (id === p.active && lang !== file.lang) editorRef.current?.setLanguage(lang);
    },
  };

  function rememberCode(value: string) {
    const p = projectRef.current;
    if (!p) return false;
    const next = { ...p, files: p.files.map((f) => (f.id === p.active ? { ...f, code: value } : f)) };
    projectRef.current = next;
    clearTimeout(projectSaveRef.current);
    projectSaveRef.current = setTimeout(() => saveProject(next), 300);
    return true;
  }

  function starterIn(lang: LanguageKey, poly: Polyglot | null): string {
    if (isFree) return templatesFor(lang)[0]?.code ?? `${LANGUAGES[lang].comment} Playground — write anything.\n`;
    if (lang === "javascript" || lang === "sql") return lang === "sql" ? "" : exercise.starter;
    if (lang === "html" || lang === "css") return "";
    if (poly?.ok) return starterFor(lang, poly.signature, exercise.title);
    if (lang === "typescript") return exercise.starter;
    const c = LANGUAGES[lang].comment;
    return `${c} ${exercise.title}\n${c} ${poly ? poly.reason : "Loading…"}\n${c} Switch to JavaScript to solve it with its tests.\n`;
  }

  async function handleLanguageChange(lang: LanguageKey) {
    if (lang === "c" || lang === "cpp" || lang === "ruby" || lang === "php" || lang === "lua") warmScript(lang);
    if (projectRef.current) return openLanguage(lang);
    if (!interview) store.set(langKey, lang);
    currentLangRef.current = lang;
    setCurrentLang(lang);
    setTestResults(null);
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
    if (currentLangRef.current === lang && saved == null) editorRef.current?.setValue(starterIn(lang, poly));
  }

  const hasTests = !isFree && exercise.tests.length > 0;
  const gradesInLanguage = polyglot?.ok === true && canGrade(currentLang, polyglot.signature);
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

  useEffect(() => {
    if (consolePhase !== "ran") return;
    const lang = currentLangRef.current;
    if (["javascript", "python", "ruby", "lua", "c", "cpp"].includes(lang))
      editorRef.current?.showInline(groupByLine(consoleLines));
    const p = projectRef.current;
    const file = p?.files.find((f) => f.id === p.active);
    if (!file || !LANGUAGES[file.lang].runnable || recordedRunRef.current === runStartRef.current) return;
    recordedRunRef.current = runStartRef.current;
    const first = consoleLines.find((l) => l.kind !== "table" && l.kind !== "system");
    recordRun({
      at: Date.now(),
      file: file.name,
      lang: file.lang,
      code: file.code,
      ms: runMs,
      ok: !consoleLines.some((l) => l.kind === "error"),
      summary: first && first.kind !== "table" ? first.text.split("\n")[0].slice(0, 80) : "no output",
    });
  }, [consolePhase, consoleLines, runMs]);

  function reopenRun(run: RunRecord) {
    const p = projectRef.current;
    if (!p) return;
    const base = `${run.file.replace(/\.[^.]+$/, "")}-earlier`;
    const file = makeFile(p.files, run.lang, run.code, base);
    activate({ ...p, files: [...p.files, file] }, file);
  }

  useEffect(() => () => clearTimeout(liveTimerRef.current), []);

  function toggleLive() {
    const next = !live;
    setLive(next);
    store.set(LIVE_KEY, next);
    if (next) runCode(false);
  }

  async function debugCode() {
    const editor = editorRef.current;
    const lang = currentLangRef.current;
    if (!editor || (lang !== "javascript" && lang !== "typescript" && lang !== "python") || isComponent) return;
    runningRef.current?.stop();
    setDebugRun(null);
    setActiveTab("debug");
    setConsolePhase("running");
    let code = editor.getValue();
    if (!isFree) {
      const poly = await loadPolyglot(exercise.id);
      const first = poly.ok ? poly.tests[0]?.cases[0] : undefined;
      if (poly.ok && first && lang === "python")
        code += `\n${poly.signature.name}(*__import__("json").loads(${JSON.stringify(JSON.stringify(first.args))}))\n`;
      else if (poly.ok && first)
        code += `\n${poly.signature.name}(${first.args.map((a) => JSON.stringify(a)).join(", ")});\n`;
    }
    const output: RunnerOutputEntry[] = [];
    const finish = (trace: Trace | undefined) => {
      runningRef.current = null;
      setConsolePhase("ran");
      setConsoleLines(output.map((o) => ({ ...o, line: undefined })));
      setDebugRun({ trace: trace ?? { steps: [], truncated: false }, output });
    };
    if (lang === "python") {
      runningRef.current = runPython({
        code,
        stdin,
        trace: true,
        onConsole: (entry) => output.push(entry),
        onDone: (payload) => finish(payload.trace),
      });
      return;
    }
    let instrumented: string;
    try {
      instrumented = await instrumentCode(code, lang);
    } catch (err) {
      setConsolePhase("ran");
      setConsoleLines([
        { kind: "error", text: `Could not debug: ${err instanceof Error ? err.message : String(err)}` },
      ]);
      setActiveTab("console");
      return;
    }
    runningRef.current = runnerRun({
      code: instrumented,
      stdin,
      trace: true,
      timeout: 8000,
      onConsole: (entry) => output.push(entry),
      onDone: (payload) => finish(payload.trace),
    });
  }

  function markRan() {
    setConsolePhase("ran");
    setRunMs(Math.round(performance.now() - runStartRef.current));
  }

  function runCode(withTests: boolean) {
    const editor = editorRef.current;
    if (!editor) return;
    if (!withTests && renderPreview()) return;
    runningRef.current?.stop();

    const meta = editor.getLanguageMeta();

    editor.showInline([]);
    setConsoleLines([]);
    setConsolePhase("running");
    setRunMs(null);
    runStartRef.current = performance.now();
    setActiveTab(withTests ? "tests" : "console");
    if (withTests) setTestResults(null);

    function startRunner(code: string, tests: boolean) {
      runningRef.current = runnerRun({
        code,
        stdin: tests ? "" : stdin,
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

    if (
      meta.runnable === "python" ||
      meta.runnable === "ruby" ||
      meta.runnable === "php" ||
      meta.runnable === "lua" ||
      meta.runnable === "c" ||
      meta.runnable === "cpp"
    ) {
      const kind = meta.runnable;
      const grading = withTests && polyglot?.ok && canGrade(kind, polyglot.signature) ? polyglot : null;
      const rows: [number, number, Json, string?][] = [];
      const options = {
        code: grading ? withHarness(kind, editor.getValue(), grading) : editor.getValue(),
        stdin: grading ? "" : stdin,
        onConsole: (entry: RunnerOutputEntry) => {
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
      };
      runningRef.current = kind === "python" ? runPython(options) : runScript({ ...options, lang: kind });
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
            <span className="lc-topbar__group">
              <BackButton variant="icon" className="lc-icon-btn" fallbackHref="/" fallbackLabel="Home" />
              <button
                type="button"
                className="lc-icon-btn"
                aria-label="Menu"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                data-tip="Pages, theme and handwriting"
                onClick={() => setMenuOpen(true)}
              >
                <TopIcon name="menu" />
              </button>
            </span>
            <h1 className="pg-head__title">
              <span aria-hidden="true">✎</span> Playground
            </h1>
            <div className="pg-langs" role="group" aria-label="Quick language">
              <span className="pg-langs__scroll">
                {QUICK_LANGS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="pg-lang"
                    aria-pressed={currentLang === key}
                    onClick={() => editorRef.current?.setLanguage(key)}
                  >
                    {LANGUAGES[key].label}
                  </button>
                ))}
              </span>
              <span className={`pg-more${QUICK_LANGS.includes(currentLang) ? "" : " is-current"}`}>
                <Dropdown
                  items={LANG_ORDER.map((key) => ({
                    value: key,
                    label: LANGUAGES[key].label,
                    short: QUICK_LANGS.includes(key) ? "More" : LANGUAGES[key].label,
                    group: LANGUAGES[key].runnable ? "Runs here" : "Write only",
                  }))}
                  value={currentLang}
                  placeholder="More"
                  onChange={(key) => editorRef.current?.setLanguage(key as LanguageKey)}
                  ariaLabel="Language"
                  columns={4}
                  compact
                />
              </span>
            </div>
          </div>
        ) : interview ? (
          <div />
        ) : (
          <div className="lc-topbar__nav">
            <BackButton
              variant="icon"
              className="lc-icon-btn"
              fallbackHref={chapter ? chapter.href : "/problems"}
              fallbackLabel={chapter ? `Back to ${chapter.short}` : "All problems"}
            />
            <button
              type="button"
              className="lc-icon-btn"
              aria-label="Menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              data-tip="Pages, theme and handwriting"
              onClick={() => setMenuOpen(true)}
            >
              <TopIcon name="menu" />
            </button>
            <span className="lc-topbar__divider" aria-hidden="true" />
            <Link className="lc-icon-btn" href="/problems" data-tip="All problems" aria-label="Problem list">
              <TopIcon name="list" />
            </Link>
            <span className="lc-topbar__divider" aria-hidden="true" />
            {!isFree && prev ? (
              <Link
                className="lc-icon-btn"
                href={problemHref(prev.id)}
                data-tip={`Previous: ${prev.title}`}
                aria-label={`Previous problem: ${prev.title}`}
              >
                <TopIcon name="prev" />
              </Link>
            ) : (
              <span className="lc-icon-btn is-disabled" aria-hidden="true">
                <TopIcon name="prev" />
              </span>
            )}
            {!isFree && next ? (
              <Link
                className="lc-icon-btn"
                href={problemHref(next.id)}
                data-tip={`Next: ${next.title}`}
                aria-label={`Next problem: ${next.title}`}
              >
                <TopIcon name="next" />
              </Link>
            ) : (
              <span className="lc-icon-btn is-disabled" aria-hidden="true">
                <TopIcon name="next" />
              </span>
            )}
          </div>
        )}
        <div className="lc-topbar__actions">
          {playground && ["javascript", "typescript", "html", "css"].includes(currentLang) && (
            <button
              type="button"
              className="btn live-btn"
              aria-label="Live"
              aria-pressed={live}
              data-tip="Run as you type"
              onClick={toggleLive}
            >
              <TopIcon name="live" size={16} /> <span className="pg-btn__label">Live</span>
            </button>
          )}
          {playground && (
            <button
              type="button"
              className="btn"
              data-tip="Copy a link to these files"
              aria-label={shareState === "copied" ? "Link copied" : "Share a link to these files"}
              onClick={() => void share()}
            >
              <TopIcon name="link" size={16} />{" "}
              <span className={shareState === "idle" ? "pg-btn__label" : undefined}>
                {shareState === "copied"
                  ? "Link copied"
                  : shareState === "failed"
                    ? "Could not copy"
                    : shareState === "too-big"
                      ? "Too big for a link"
                      : "Share"}
              </span>
            </button>
          )}
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
            className="btn btn--run pg-run"
            type="button"
            title="Run the code (⌘/Ctrl + Enter)"
            aria-label="Run the code"
            onClick={() => runCode(false)}
          >
            ▶ Run
          </button>
          {(currentLang === "javascript" || currentLang === "typescript" || currentLang === "python") &&
            !isComponent &&
            !interview && (
              <button
                className="btn"
                type="button"
                aria-label="Debug"
                data-tip={isFree ? "Step through line by line" : "Step through on the first test"}
                onClick={() => void debugCode()}
              >
                <TopIcon name="debug" size={16} /> <span className="pg-btn__label">Debug</span>
              </button>
            )}
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
          {!playground && (
            <>
              <button
                className="lc-icon-btn"
                type="button"
                data-tip={soundOn ? "Mute the solved sound" : "Unmute the solved sound"}
                aria-label={soundOn ? "Mute the solved sound" : "Unmute the solved sound"}
                aria-pressed={!soundOn}
                onClick={toggleSound}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 9h4l5-4v14l-5-4H4z" />
                  {soundOn ? (
                    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
                  ) : (
                    <path d="M17 9l5 6M22 9l-5 6" />
                  )}
                </svg>
              </button>
              <button
                className="lc-icon-btn"
                type="button"
                data-tip="Keyboard shortcuts — ?"
                aria-label="Keyboard shortcuts"
                onClick={() => setShortcutsOpen(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2.5" y="6" width="19" height="12" rx="2" />
                  <path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <ShortcutHelp open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <SiteDrawer open={menuOpen} onClose={closeMenu} />

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
                if (!rememberCode(value) && !interview) codeStore.save(exercise.id, value, currentLangRef.current);
                const lang = currentLangRef.current;
                if (live && (lang === "javascript" || lang === "typescript" || lang === "html" || lang === "css")) {
                  clearTimeout(liveTimerRef.current);
                  liveTimerRef.current = setTimeout(() => runCode(false), 700);
                }
              }}
              onRun={() => runCode(false)}
              onSave={() => {
                const editor = editorRef.current;
                if (!editor) return;
                if (projectRef.current) {
                  rememberCode(editor.getValue());
                  clearTimeout(projectSaveRef.current);
                  saveProject(projectRef.current);
                } else codeStore.save(exercise.id, editor.getValue(), currentLangRef.current);
                editor.flashSaved();
              }}
              onLanguageChange={handleLanguageChange}
              onProblems={setProblems}
              onShowProblems={() => setActiveTab("problems")}
              files={project?.files.map((f) => ({ id: f.id, name: f.name, active: f.id === project.active }))}
              fileActions={
                project
                  ? {
                      ...fileActions,
                      reopen: closed?.length
                        ? { label: closed.length === 1 ? closed[0].name : `${closed.length} files`, run: reopenClosed }
                        : null,
                    }
                  : undefined
              }
              languages={project ? LANG_ORDER : undefined}
              showLanguagePicker={!playground}
              toolbarStart={
                <>
                  <button
                    className="btn btn--icon"
                    type="button"
                    data-tip="Start again"
                    aria-label="Reset to the starting code"
                    onClick={() => {
                      if (!window.confirm("Throw away your version and start again?")) return;
                      const lang = currentLangRef.current;
                      if (!projectRef.current) codeStore.clear(exercise.id, lang);
                      editorRef.current?.setValue(starterIn(lang, polyglot));
                      editorRef.current?.focus();
                    }}
                  >
                    <TopIcon name="reset" size={16} />
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
                {debugRun && (
                  <button
                    className={`tab${activeTab === "debug" ? " is-active" : ""}`}
                    id="tab-debug"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "debug"}
                    aria-controls="view-debug"
                    onClick={() => setActiveTab("debug")}
                  >
                    Debug{" "}
                    <span className="tab__count" id="debug-count">
                      {debugRun.trace.steps.length}
                    </span>
                  </button>
                )}
                <button
                  className={`tab${activeTab === "problems" ? " is-active" : ""}`}
                  id="tab-problems"
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "problems"}
                  aria-controls="view-problems"
                  onClick={() => setActiveTab("problems")}
                >
                  Problems{" "}
                  <span
                    className={`tab__count${problems.some((p) => p.severity === "error") ? " is-fail" : ""}`}
                    id="problems-count"
                  >
                    {problems.length}
                  </span>
                </button>
                {playground && (
                  <button
                    className={`tab${activeTab === "history" ? " is-active" : ""}`}
                    id="tab-history"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "history"}
                    aria-controls="view-history"
                    onClick={() => setActiveTab("history")}
                  >
                    History{" "}
                    <span className="tab__count" id="history-count">
                      {runs.length}
                    </span>
                  </button>
                )}
                {playground && (
                  <button
                    className={`tab${activeTab === "input" ? " is-active" : ""}`}
                    id="tab-input"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "input"}
                    aria-controls="view-input"
                    onClick={() => setActiveTab("input")}
                  >
                    Input{" "}
                    <span className="tab__count" id="input-count">
                      {stdin ? stdin.replace(/\n$/, "").split("\n").length : 0}
                    </span>
                  </button>
                )}
                {playground && hasPage && (
                  <button
                    className={`tab${activeTab === "preview" ? " is-active" : ""}`}
                    id="tab-preview"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "preview"}
                    aria-controls="view-preview"
                    onClick={() => (previewDoc ? setActiveTab("preview") : renderPreview() || setActiveTab("preview"))}
                  >
                    Preview
                  </button>
                )}
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
              {debugRun && (
                <div
                  className={`panel__view${activeTab === "debug" ? " is-active" : ""}`}
                  id="view-debug"
                  role="tabpanel"
                >
                  {activeTab === "debug" && (
                    <DebugPanel
                      key={debugRun.trace.steps.length + ":" + debugRun.output.length}
                      trace={debugRun.trace}
                      output={debugRun.output}
                      onLine={showDebugLine}
                    />
                  )}
                </div>
              )}
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
                        Nothing yet — press <b>Run</b> or <kbd>⌘/Ctrl</kbd> + <kbd>Enter</kbd>, and whatever you log
                        shows up here.
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
              {playground && hasPage && (
                <div
                  className={`panel__view panel__view--preview${activeTab === "preview" ? " is-active" : ""}`}
                  id="view-preview"
                  role="tabpanel"
                >
                  {previewDoc ? (
                    <iframe
                      key={previewRun}
                      ref={pageFrameRef}
                      className="page-preview"
                      title="Preview of your page"
                      sandbox="allow-scripts allow-modals allow-forms"
                      srcDoc={previewDoc}
                    />
                  ) : (
                    <p className="panel__empty">
                      Run an HTML file, or a stylesheet or script it links, to see the page here.
                    </p>
                  )}
                </div>
              )}
              {playground && (
                <div
                  className={`panel__view${activeTab === "input" ? " is-active" : ""}`}
                  id="view-input"
                  role="tabpanel"
                >
                  <label className="stdin">
                    <span className="stdin__label">
                      Each line is one answer to <code>input()</code> in Python, or <code>prompt()</code> /{" "}
                      <code>readline()</code> in JavaScript.
                    </span>
                    <textarea
                      className="stdin__box"
                      value={stdin}
                      spellCheck={false}
                      rows={8}
                      placeholder={"5\nAda\n3 4 7"}
                      onChange={(e) => {
                        setStdin(e.target.value);
                        store.set(STDIN_KEY, e.target.value);
                      }}
                    />
                  </label>
                </div>
              )}
              {playground && (
                <div
                  className={`panel__view${activeTab === "history" ? " is-active" : ""}`}
                  id="view-history"
                  role="tabpanel"
                >
                  {runs.length === 0 ? (
                    <p className="panel__empty">Every run is kept here: what ran, how long it took, and its code.</p>
                  ) : (
                    <>
                      <ol className="runs">
                        {runs.map((run) => (
                          <li key={run.at} className="run" data-ok={run.ok}>
                            <span className="run__mark" aria-label={run.ok ? "ran" : "error"}>
                              {run.ok ? "✓" : "✕"}
                            </span>
                            <span className="run__file">{run.file}</span>
                            <span className="run__summary">{run.summary}</span>
                            <span className="run__meta">
                              {new Date(run.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {run.ms !== null ? ` · ${run.ms} ms` : ""}
                            </span>
                            <button type="button" className="run__open" onClick={() => reopenRun(run)}>
                              Open this code
                            </button>
                          </li>
                        ))}
                      </ol>
                      <button type="button" className="btn btn--ghost" onClick={clearRuns}>
                        Clear history
                      </button>
                    </>
                  )}
                </div>
              )}
              <div
                className={`panel__view${activeTab === "problems" ? " is-active" : ""}`}
                id="view-problems"
                role="tabpanel"
              >
                {problems.length === 0 ? (
                  <p className="panel__empty">
                    No problems. ESLint checks JavaScript and the type checker checks TypeScript as you type.
                  </p>
                ) : (
                  <ul className="problems">
                    {problems.map((p, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          className="problem"
                          data-severity={p.severity}
                          onClick={() => editorRef.current?.reveal(p.from, p.to)}
                        >
                          <span className="problem__mark" aria-label={p.severity}>
                            {p.severity === "error" ? "✕" : "⚠"}
                          </span>
                          <span className="problem__msg">{p.message}</span>
                          <span className="problem__src">{p.source}</span>
                          <span className="problem__pos">
                            Ln {p.line}, Col {p.column}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
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
        </div>
      </div>
    </>
  );
}
