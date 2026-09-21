// Runs inside the sandbox iframe. The parent sends already-compiled code and
// tests; this file gives them React, a DOM to render into, and a small
// Testing Library, then reports results back. Bundled by
// scripts/build-react-sandbox.mjs into public/wasm/react-sandbox.js.

import * as React from "react";
import { createPortal, flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { assert, fmt } from "../assertKit";
import * as dom from "./dom";

const container = document.getElementById("root") as HTMLDivElement;
let root: Root | null = null;
let uncaught: unknown = null;
const originalFetch = window.fetch.bind(window);

function post(type: string, payload?: unknown) {
  window.parent.postMessage({ type, payload }, "*");
}

for (const kind of ["log", "info", "warn", "error", "debug"] as const) {
  console[kind] = (...args: unknown[]) => {
    post("console", { kind: kind === "debug" ? "log" : kind, text: args.map((a) => fmt(a, 0)).join(" ") });
  };
}

window.addEventListener("error", (event) => {
  post("console", { kind: "error", text: event.message });
});
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  post("console", {
    kind: "error",
    text: `Uncaught (in promise) ${reason && reason.message ? reason.message : fmt(reason, 0)}`,
  });
});

// A form submit or a link click would navigate the iframe away; tests are
// about what the component does with the event, so stop the navigation.
document.addEventListener("submit", (event) => event.preventDefault());
document.addEventListener("click", (event) => {
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (link && !event.defaultPrevented) event.preventDefault();
});

function rethrowUncaught() {
  if (uncaught !== null) {
    const error = uncaught;
    uncaught = null;
    throw error;
  }
}

function cleanup() {
  if (root) {
    flushSync(() => root!.unmount());
    root = null;
  }
  container.innerHTML = "";
  window.fetch = originalFetch;
}

function render(ui: React.ReactNode) {
  if (!root) {
    root = createRoot(container, {
      onUncaughtError: (error) => {
        uncaught = error;
      },
      onCaughtError: () => {},
      onRecoverableError: () => {},
    });
  }
  const current = root;
  flushSync(() => current.render(ui));
  rethrowUncaught();
  return {
    container,
    rerender(next: React.ReactNode) {
      flushSync(() => current.render(next));
      rethrowUncaught();
    },
    unmount() {
      cleanup();
    },
  };
}

function renderHook<Result, Props>(hook: (props: Props) => Result, options: { initialProps?: Props } = {}) {
  const result = { current: undefined as Result };
  function Probe({ props }: { props: Props }) {
    result.current = hook(props);
    return null;
  }
  const view = render(React.createElement(Probe, { props: options.initialProps as Props }));
  return {
    result,
    rerender(props?: Props) {
      view.rerender(React.createElement(Probe, { props: props as Props }));
    },
    unmount: view.unmount,
  };
}

function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  const calls: { url: string; init?: RequestInit }[] = [];
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    calls.push({ url, init });
    if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const aborted = new Promise<never>((_, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
    const result = await Promise.race([Promise.resolve(handler(url, init)), aborted]);
    if (result instanceof Response) return result;
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { calls };
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const delay = <T>(ms: number, value?: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value as T), ms));

const screen = dom.makeQueries(
  () => container,
  (fn) => dom.waitFor(fn)
);
const within = (el: Element) =>
  dom.makeQueries(
    () => el as HTMLElement,
    (fn) => dom.waitFor(fn)
  );

const env: Record<string, unknown> = {
  React,
  Component: React.Component,
  PureComponent: React.PureComponent,
  Fragment: React.Fragment,
  StrictMode: React.StrictMode,
  Suspense: React.Suspense,
  Children: React.Children,
  createElement: React.createElement,
  cloneElement: React.cloneElement,
  isValidElement: React.isValidElement,
  createContext: React.createContext,
  forwardRef: React.forwardRef,
  memo: React.memo,
  lazy: React.lazy,
  startTransition: React.startTransition,
  use: React.use,
  useState: React.useState,
  useEffect: React.useEffect,
  useLayoutEffect: React.useLayoutEffect,
  useRef: React.useRef,
  useReducer: React.useReducer,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useContext: React.useContext,
  useId: React.useId,
  useTransition: React.useTransition,
  useDeferredValue: React.useDeferredValue,
  useOptimistic: React.useOptimistic,
  useActionState: React.useActionState,
  useSyncExternalStore: React.useSyncExternalStore,
  useImperativeHandle: React.useImperativeHandle,
  useDebugValue: React.useDebugValue,
  createPortal,
  flushSync,
  assert,
  render,
  renderHook,
  cleanup,
  screen,
  within,
  click: dom.click,
  hover: dom.hover,
  unhover: dom.unhover,
  type: dom.type,
  clear: dom.clear,
  selectOption: dom.selectOption,
  press: dom.press,
  tab: dom.tab,
  waitFor: dom.waitFor,
  sleep: dom.sleep,
  delay,
  mockFetch,
  jsonResponse,
};

window.addEventListener("message", async (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== "run" || typeof data.source !== "string") return;
  cleanup();
  const names = Object.keys(env);
  try {
    const fn = new Function(...names, "return (async function () {\n" + data.source + "\n})();") as (
      ...args: unknown[]
    ) => Promise<{ results: unknown[] } | undefined>;
    const out = await fn(...names.map((name) => env[name]));
    post("done", { results: out?.results ?? [] });
  } catch (err) {
    post("console", { kind: "error", text: err instanceof Error ? err.message : String(err) });
    post("done", { results: [], crashed: true });
  }
});

post("ready");
