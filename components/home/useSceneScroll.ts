import { useEffect, type RefObject } from "react";
import { connectorProgress, DOCK_AT, type ConnectorLive } from "@/lib/connector";
import { smoothScroll } from "@/lib/scrollFx";
import { applyFx, clearFx, collect, type Fx, type FxInput } from "./fx";
import { pinStep, readScene, type PinState, type SceneState } from "@/lib/sceneScroll";

const REDUCED = "(prefers-reduced-motion: reduce)";
const PIN_WIDTH = "(min-width: 1081px)";
const STEPS = 1000;
const PRECISE = 10000;

interface Slot {
  el: HTMLElement;
  near: boolean;
  top: number;
  height: number;
  enter: number;
  exit: number;
  groups: number[] | null;
  hold: number;
  pinned: boolean;
  u: number;
  step: number;
  fx: Fx;
  dirty: boolean;
  input: FxInput;
}

function parseGroups(el: HTMLElement): number[] | null {
  const raw = el.dataset.pinGroups;
  if (!raw) return null;
  const groups = raw.split(",").map((count) => Math.max(1, Number.parseInt(count, 10) || 1));
  return groups.length > 0 ? groups : null;
}

function attach(host: HTMLElement, connectors: RefObject<ConnectorLive | null>): () => void {
  const slots: Slot[] = Array.from(host.querySelectorAll<HTMLElement>("[data-scene]"), (el) => ({
    el,
    near: false,
    top: 0,
    height: 0,
    enter: -1,
    exit: -1,
    groups: parseGroups(el),
    hold: Number(el.dataset.pinHold) || 0,
    pinned: false,
    u: -1,
    step: -1,
    fx: { items: [], input: null },
    dirty: true,
    input: { enter: 1, exit: 0, p: 0.5, u: 0, t: 0, pinned: false },
  }));
  if (slots.length === 0 || !("IntersectionObserver" in window)) return () => {};

  const header = host.querySelector("header");
  const wide = window.matchMedia(PIN_WIDTH);
  const bySection = new Map<Element, Slot>(slots.map((slot) => [slot.el, slot]));
  const state: SceneState = { p: 0, enter: 0, exit: 0 };
  const pin: PinState = { group: 0, item: 0, t: 0, step: 0 };
  let near: Slot[] = [];
  let seen = -1;
  let offset = header?.getBoundingClientRect().height ?? 0;
  let viewport = window.innerHeight;
  let viewportWidth = window.innerWidth;
  let raf = 0;

  const setPinned = () => {
    for (const slot of slots) {
      if (!slot.groups) continue;
      const on = wide.matches;
      if (on === slot.pinned) continue;
      slot.pinned = on;
      slot.step = -1;
      slot.u = -1;
      slot.input.pinned = on;
      if (on) slot.el.setAttribute("data-pinned", "");
      else {
        slot.el.removeAttribute("data-pinned");
        slot.el.removeAttribute("data-u");
        slot.dirty = true;
      }
      slot.el.dispatchEvent(new CustomEvent("scenepin"));
    }
  };

  const paint = (list: Slot[]) => {
    const scroll = window.scrollY;
    for (let i = 0; i < list.length; i++) {
      const slot = list[i];
      const box = slot.el.getBoundingClientRect();
      slot.top = box.top;
      slot.height = box.height;
    }
    for (let i = 0; i < list.length; i++) {
      const slot = list[i];
      readScene(state, slot.top, slot.height, viewport, offset);
      const enter = Math.round(state.enter * STEPS);
      const exit = Math.round(state.exit * STEPS);
      if (enter !== slot.enter) slot.el.setAttribute("data-enter", String(enter / STEPS));
      if (exit !== slot.exit) slot.el.setAttribute("data-exit", String(exit / STEPS));
      slot.enter = enter;
      slot.exit = exit;
      slot.input.enter = state.enter;
      slot.input.exit = state.exit;
      slot.input.p = state.p;
      if (slot.pinned && slot.groups) {
        const length = Math.max(0, slot.height - (viewport - offset));
        pinStep(pin, offset - slot.top, length, (slot.hold / 100) * viewport, slot.groups);
        const u = pin.step + pin.t;
        slot.input.u = u;
        slot.input.t = pin.t;
        const rounded = Math.round(u * STEPS);
        if (rounded !== slot.u) slot.el.setAttribute("data-u", String(rounded / STEPS));
        slot.u = rounded;
        if (pin.step !== slot.step) {
          slot.step = pin.step;
          slot.el.dispatchEvent(new CustomEvent("scenestep", { detail: { group: pin.group, item: pin.item } }));
        }
      }
      if (slot.dirty) {
        slot.fx = collect(slot.el);
        slot.dirty = false;
      }
      applyFx(slot.fx, slot.input, viewportWidth);
    }
    const live = connectors.current;
    if (live) {
      for (let i = 0; i < live.items.length; i++) {
        const item = live.items[i];
        const d = Math.round(connectorProgress(scroll, viewport, item.startY, item.endY) * PRECISE) / PRECISE;
        if (d !== item.d) item.el.style.setProperty("--d", String(d));
        item.d = d;
        const docked = d >= DOCK_AT;
        if (docked !== item.docked) {
          item.docked = docked;
          if (docked) item.target.setAttribute("data-docked", "");
          else item.target.removeAttribute("data-docked");
        }
      }
    }
  };

  const tick = () => {
    raf = 0;
    viewport = window.innerHeight;
    viewportWidth = window.innerWidth;
    paint(near);
  };

  const schedule = () => {
    if (!raf && !smoothScroll.active()) raf = requestAnimationFrame(tick);
  };

  const follow = () => {
    const y = window.scrollY;
    if (y === seen) return;
    seen = y;
    viewport = window.innerHeight;
    viewportWidth = window.innerWidth;
    paint(near);
  };

  const resize = () => {
    offset = header?.getBoundingClientRect().height ?? 0;
    viewport = window.innerHeight;
    viewportWidth = window.innerWidth;
    for (const slot of slots) slot.dirty = true;
    paint(slots);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const slot = bySection.get(entry.target);
        if (!slot) continue;
        slot.near = entry.isIntersecting;
        if (slot.near) slot.el.setAttribute("data-live", "");
        else {
          slot.el.removeAttribute("data-live");
          clearFx(slot.fx);
        }
      }
      near = slots.filter((slot) => slot.near);
      schedule();
    },
    { rootMargin: "100% 0px 100% 0px" }
  );
  slots.forEach((slot) => observer.observe(slot.el));
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      const slot =
        bySection.get(record.target as Element) ?? slots.find((candidate) => candidate.el.contains(record.target));
      if (slot) slot.dirty = true;
    }
  });
  slots.forEach((slot) => mutations.observe(slot.el, { childList: true, subtree: true }));
  setPinned();
  paint(slots);

  const rePin = () => {
    setPinned();
    resize();
  };
  wide.addEventListener("change", rePin);
  const unfollow = smoothScroll.onFrame(follow);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(raf);
    unfollow();
    observer.disconnect();
    mutations.disconnect();
    wide.removeEventListener("change", rePin);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", resize);
    for (const item of connectors.current?.items ?? []) {
      item.el.style.removeProperty("--d");
      item.target.removeAttribute("data-docked");
      item.d = -1;
      item.docked = false;
    }
    for (const slot of slots) {
      clearFx(slot.fx);
      slot.el.removeAttribute("data-enter");
      slot.el.removeAttribute("data-exit");
      slot.el.removeAttribute("data-u");
      slot.el.removeAttribute("data-live");
      if (slot.pinned) {
        slot.el.removeAttribute("data-pinned");
        slot.el.dispatchEvent(new CustomEvent("scenepin"));
      }
    }
  };
}

export function useSceneScroll(root: RefObject<HTMLElement | null>, connectors: RefObject<ConnectorLive | null>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduced = window.matchMedia(REDUCED);
    let detach: (() => void) | null = null;
    const sync = () => {
      detach?.();
      detach = reduced.matches ? null : attach(host, connectors);
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => {
      reduced.removeEventListener("change", sync);
      detach?.();
    };
  }, [root, connectors]);
}
