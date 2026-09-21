// A small Testing Library: queries by role, text and label, plus user events.
// It runs inside the sandbox iframe, against the real DOM React rendered.

import { flushSync } from "react-dom";

export type Matcher = string | RegExp | ((text: string, el: Element) => boolean);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const settle = () => sleep(0);

const normalise = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function matches(matcher: Matcher, text: string, el: Element): boolean {
  const t = normalise(text);
  if (typeof matcher === "string") return t === normalise(matcher);
  if (matcher instanceof RegExp) {
    matcher.lastIndex = 0;
    return matcher.test(t);
  }
  return matcher(t, el);
}

function describeMatcher(matcher: Matcher): string {
  return typeof matcher === "string" ? JSON.stringify(matcher) : String(matcher);
}

function isHidden(el: Element): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") return true;
    const style = node.ownerDocument.defaultView?.getComputedStyle(node);
    if (style && (style.display === "none" || style.visibility === "hidden")) return true;
  }
  return false;
}

export function roleOf(el: Element): string | null {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit.split(/\s+/)[0];
  const tag = el.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return "heading";
  switch (tag) {
    case "button":
      return "button";
    case "a":
      return el.hasAttribute("href") ? "link" : null;
    case "input": {
      const type = (el.getAttribute("type") || "text").toLowerCase();
      if (["button", "submit", "reset", "image"].includes(type)) return "button";
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "search") return "searchbox";
      if (type === "hidden") return null;
      return el.hasAttribute("list") ? "combobox" : "textbox";
    }
    case "textarea":
      return "textbox";
    case "select":
      return (el as HTMLSelectElement).multiple ? "listbox" : "combobox";
    case "ul":
    case "ol":
      return "list";
    case "li":
      return "listitem";
    case "img":
      return el.getAttribute("alt") === "" ? "presentation" : "img";
    case "table":
      return "table";
    case "tr":
      return "row";
    case "td":
      return "cell";
    case "th":
      return "columnheader";
    case "nav":
      return "navigation";
    case "main":
      return "main";
    case "dialog":
      return "dialog";
    case "option":
      return "option";
    case "progress":
      return "progressbar";
    case "article":
      return "article";
    case "form":
      return el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby") ? "form" : null;
    default:
      return null;
  }
}

export function nameOf(el: Element): string {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    return normalise(
      labelledBy
        .split(/\s+/)
        .map((id) => el.ownerDocument.getElementById(id)?.textContent ?? "")
        .join(" ")
    );
  }
  const aria = el.getAttribute("aria-label");
  if (aria !== null) return normalise(aria);
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") {
    const labels = (el as HTMLInputElement).labels;
    if (labels && labels.length) {
      return normalise(
        Array.from(labels)
          .map((l) => l.textContent)
          .join(" ")
      );
    }
    const type = (el.getAttribute("type") || "").toLowerCase();
    if (["button", "submit", "reset"].includes(type)) return normalise((el as HTMLInputElement).value);
    return normalise(el.getAttribute("title"));
  }
  if (tag === "img") return normalise(el.getAttribute("alt"));
  return normalise(el.textContent) || normalise(el.getAttribute("title"));
}

function ownText(el: Element): string {
  return Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join("");
}

export interface RoleOptions {
  name?: Matcher;
  checked?: boolean;
  level?: number;
  hidden?: boolean;
  selected?: boolean;
  pressed?: boolean;
  expanded?: boolean;
}

type Finder = (root: HTMLElement, matcher: Matcher, options?: RoleOptions) => Element[];

const finders: Record<string, Finder> = {
  Role(root, matcher, options = {}) {
    return Array.from(root.querySelectorAll("*")).filter((el) => {
      const role = roleOf(el);
      if (role === null || !matches(matcher, role, el)) return false;
      if (!options.hidden && isHidden(el)) return false;
      if (options.name !== undefined && !matches(options.name, nameOf(el), el)) return false;
      if (options.checked !== undefined) {
        const checked = (el as HTMLInputElement).checked ?? el.getAttribute("aria-checked") === "true";
        if (Boolean(checked) !== options.checked) return false;
      }
      if (options.level !== undefined && el.tagName.toLowerCase() !== `h${options.level}`) {
        if (el.getAttribute("aria-level") !== String(options.level)) return false;
      }
      if (options.selected !== undefined && (el.getAttribute("aria-selected") === "true") !== options.selected)
        return false;
      if (options.pressed !== undefined && (el.getAttribute("aria-pressed") === "true") !== options.pressed)
        return false;
      if (options.expanded !== undefined && (el.getAttribute("aria-expanded") === "true") !== options.expanded)
        return false;
      return true;
    });
  },
  Text(root, matcher) {
    return Array.from(root.querySelectorAll("*")).filter((el) => {
      if (["SCRIPT", "STYLE"].includes(el.tagName)) return false;
      const text = ownText(el);
      return normalise(text) !== "" && matches(matcher, text, el);
    });
  },
  LabelText(root, matcher) {
    const found = new Set<Element>();
    for (const label of Array.from(root.querySelectorAll("label"))) {
      if (!matches(matcher, label.textContent ?? "", label)) continue;
      const control = (label as HTMLLabelElement).control;
      if (control) found.add(control);
    }
    for (const el of Array.from(root.querySelectorAll("[aria-label]"))) {
      if (matches(matcher, el.getAttribute("aria-label") ?? "", el)) found.add(el);
    }
    return Array.from(found);
  },
  PlaceholderText(root, matcher) {
    return Array.from(root.querySelectorAll("[placeholder]")).filter((el) =>
      matches(matcher, el.getAttribute("placeholder") ?? "", el)
    );
  },
  TestId(root, matcher) {
    return Array.from(root.querySelectorAll("[data-testid]")).filter((el) =>
      matches(matcher, el.getAttribute("data-testid") ?? "", el)
    );
  },
  AltText(root, matcher) {
    return Array.from(root.querySelectorAll("img[alt]")).filter((el) =>
      matches(matcher, el.getAttribute("alt") ?? "", el)
    );
  },
  DisplayValue(root, matcher) {
    return Array.from(root.querySelectorAll("input, textarea, select")).filter((el) =>
      matches(matcher, (el as HTMLInputElement).value ?? "", el)
    );
  },
};

function summary(root: HTMLElement): string {
  const roles = new Set<string>();
  root.querySelectorAll("*").forEach((el) => {
    const r = roleOf(el);
    if (r) roles.add(r + (nameOf(el) ? ` "${nameOf(el).slice(0, 30)}"` : ""));
  });
  const text = normalise(root.textContent).slice(0, 160);
  return `\nText on the page: ${JSON.stringify(text)}\nRoles found: ${Array.from(roles).slice(0, 12).join(", ") || "none"}`;
}

export function makeQueries(
  getRoot: () => HTMLElement,
  wait: <T>(fn: () => T) => Promise<T>
): Record<string, (matcher: Matcher, options?: RoleOptions) => unknown> {
  const api: Record<string, (matcher: Matcher, options?: RoleOptions) => unknown> = {};
  for (const [kind, finder] of Object.entries(finders)) {
    const all = (matcher: Matcher, options?: RoleOptions) => finder(getRoot(), matcher, options);
    const describe = (matcher: Matcher) => `${kind}(${describeMatcher(matcher)})`;
    const getAll = (m: Matcher, o?: RoleOptions) => {
      const els = all(m, o);
      if (els.length === 0) throw new Error(`Unable to find an element by ${describe(m)}.${summary(getRoot())}`);
      return els;
    };
    const get = (m: Matcher, o?: RoleOptions) => {
      const els = getAll(m, o);
      if (els.length > 1) throw new Error(`Found ${els.length} elements by ${describe(m)}; expected exactly one.`);
      return els[0];
    };
    api[`queryAllBy${kind}`] = all;
    api[`getAllBy${kind}`] = getAll;
    api[`queryBy${kind}`] = (m, o) => {
      const els = all(m, o);
      if (els.length > 1) throw new Error(`Found ${els.length} elements by ${describe(m)}; expected at most one.`);
      return els[0] ?? null;
    };
    api[`getBy${kind}`] = get;
    api[`findAllBy${kind}`] = (m, o) => wait(() => getAll(m, o));
    api[`findBy${kind}`] = (m, o) => wait(() => get(m, o));
  }
  return api;
}

function isFocusable(el: Element): boolean {
  return (
    el instanceof HTMLElement &&
    !el.hasAttribute("disabled") &&
    (["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) || el.tabIndex >= 0 || el.isContentEditable)
  );
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = Object.getPrototypeOf(el);
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

export async function click(el: Element) {
  if (el instanceof HTMLElement && el.hasAttribute("disabled")) return;
  const view = el.ownerDocument.defaultView as Window;
  const init = { bubbles: true, cancelable: true, view };
  flushSync(() => {
    el.dispatchEvent(new MouseEvent("mousedown", init));
    if (isFocusable(el)) (el as HTMLElement).focus();
    el.dispatchEvent(new MouseEvent("mouseup", init));
    el.dispatchEvent(new MouseEvent("click", init));
  });
  await settle();
}

export async function hover(el: Element) {
  const view = el.ownerDocument.defaultView as Window;
  flushSync(() => {
    el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, view }));
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false, view }));
  });
  await settle();
}

export async function unhover(el: Element) {
  const view = el.ownerDocument.defaultView as Window;
  flushSync(() => {
    el.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: null, view }));
    el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false, relatedTarget: null, view }));
  });
  await settle();
}

export async function type(el: Element, text: string) {
  const field = el as HTMLInputElement | HTMLTextAreaElement;
  if (field.hasAttribute("disabled")) return;
  field.focus();
  for (const ch of text) {
    flushSync(() => {
      field.dispatchEvent(new KeyboardEvent("keydown", { key: ch, bubbles: true, cancelable: true }));
      setNativeValue(field, field.value + ch);
      field.dispatchEvent(new InputEvent("input", { bubbles: true, data: ch, inputType: "insertText" }));
      field.dispatchEvent(new KeyboardEvent("keyup", { key: ch, bubbles: true, cancelable: true }));
    });
  }
  await settle();
}

export async function clear(el: Element) {
  const field = el as HTMLInputElement | HTMLTextAreaElement;
  field.focus();
  flushSync(() => {
    setNativeValue(field, "");
    field.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
  });
  await settle();
}

export async function selectOption(el: Element, value: string) {
  const select = el as HTMLSelectElement;
  flushSync(() => {
    setNativeValue(select, value);
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await settle();
}

export async function press(el: Element, key: string, init: KeyboardEventInit = {}) {
  flushSync(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init }));
    el.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true, ...init }));
  });
  await settle();
}

// Tab moves focus along the document order, the way the keyboard would.
export async function tab(options: { shift?: boolean } = {}) {
  const order = Array.from(document.querySelectorAll("*")).filter(
    (el) => isFocusable(el) && (el as HTMLElement).tabIndex >= 0
  );
  const current = order.indexOf(document.activeElement as Element);
  const step = options.shift ? -1 : 1;
  const nextIndex =
    current === -1 ? (options.shift ? order.length - 1 : 0) : (current + step + order.length) % order.length;
  flushSync(() => (order[nextIndex] as HTMLElement | undefined)?.focus());
  await settle();
}

export async function waitFor<T>(fn: () => T, options: { timeout?: number; interval?: number } = {}): Promise<T> {
  const timeout = options.timeout ?? 1500;
  const interval = options.interval ?? 15;
  const end = Date.now() + timeout;
  let last: unknown;
  for (;;) {
    try {
      return fn();
    } catch (err) {
      last = err;
    }
    if (Date.now() >= end) throw last;
    await sleep(interval);
  }
}

export { sleep };
