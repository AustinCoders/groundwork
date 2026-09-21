import { composeReactSource, transpileJsx } from "@/lib/reactSource";
import type { RunnerDonePayload, RunnerOutputEntry } from "@/lib/runner";
import type { ExerciseTest } from "@/content/types";

export interface ReactRunOptions {
  code: string;
  tests: ExerciseTest[];
  // Render `App` into the preview when the code defines one (the Run button).
  mountApp?: boolean;
  container: HTMLElement;
  timeout?: number;
  onConsole?: (entry: RunnerOutputEntry) => void;
  onDone?: (payload: RunnerDonePayload) => void;
}

const SRCDOC =
  '<!doctype html><html><head><meta charset="utf-8"><style>' +
  "body{margin:0;padding:12px;font:15px/1.5 system-ui,sans-serif;color:#1f2430;background:#fff}" +
  "button,input,select,textarea{font:inherit}" +
  '</style></head><body><div id="root"></div><script src="/wasm/react-sandbox.js"></script></body></html>';

let tsPromise: Promise<typeof import("typescript")> | null = null;
function loadTypeScript() {
  if (!tsPromise) tsPromise = import("typescript");
  return tsPromise;
}

// The learner's component runs in an iframe with an opaque origin: it cannot
// reach this page's storage or cookies, and removing the frame stops it.
export function runReact(options: ReactRunOptions): { stop: () => void } {
  const onConsole = options.onConsole || (() => {});
  const onDone = options.onDone || (() => {});
  const timeout = options.timeout || 8000;

  let iframe: HTMLIFrameElement | null = null;
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let listener: ((event: MessageEvent) => void) | null = null;

  function finish(payload: RunnerDonePayload, keepFrame: boolean) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    if (listener) window.removeEventListener("message", listener);
    if (!keepFrame && iframe) iframe.remove();
    onDone(payload);
  }

  loadTypeScript()
    .then((ts) => {
      if (finished) return;
      const source = composeReactSource(options.code, options.tests, { mountApp: options.mountApp });
      const compiled = transpileJsx(ts, source);
      if (compiled.error) {
        onConsole({ kind: "error", text: "SyntaxError: " + compiled.error });
        finish({ results: [], crashed: true, syntax: true }, true);
        return;
      }

      options.container.replaceChildren();
      iframe = document.createElement("iframe");
      iframe.title = "Preview";
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.className = "preview-frame";
      iframe.srcdoc = SRCDOC;

      listener = (event: MessageEvent) => {
        if (!iframe || event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!data) return;
        if (data.type === "ready") {
          iframe.contentWindow?.postMessage({ type: "run", source: compiled.output }, "*");
        } else if (data.type === "console") {
          onConsole(data.payload as RunnerOutputEntry);
        } else if (data.type === "done") {
          finish(data.payload as RunnerDonePayload, true);
        }
      };
      window.addEventListener("message", listener);
      options.container.appendChild(iframe);

      timer = setTimeout(() => {
        onConsole({
          kind: "system",
          text: "⏱ stopped after " + timeout / 1000 + "s — an endless loop, or a test that never finishes?",
        });
        finish({ results: [], timedOut: true }, false);
      }, timeout);
    })
    .catch((err) => {
      onConsole({ kind: "error", text: err instanceof Error ? err.message : String(err) });
      finish({ results: [], crashed: true }, true);
    });

  return {
    stop: () => finish({ results: [], stopped: true }, false),
  };
}
