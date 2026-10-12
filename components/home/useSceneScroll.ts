import { useEffect, type RefObject } from "react";
import { connectorLook, connectorProgress, DOCK_AT, type ConnectorLive, type ConnectorLook } from "@/lib/connector";
import { WIDE } from "@/lib/breakpoints";
import { pageHeader, REDUCED_MOTION } from "@/lib/dom";
import { smoothScroll } from "@/lib/scrollFx";
import { applyFx, clearFx, collect, release, type Fx, type FxInput } from "./fx";
import { chase, pinStep, readScene, type PinState, type SceneState } from "@/lib/sceneScroll";

const STEPS = 1000;
const PRECISE = 10000;
const SETTLE_MS = 140;

interface Slot {
  el: HTMLElement;
  near: boolean;
  top: number;
  height: number;
  enter: number;
  exit: number;
  groups: number[] | null;
  densest: number;
  hold: number;
  cap: number;
  shown: number;
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

function densest(groups: number[] | null): number {
  return groups ? Math.max(...groups) : 1;
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
    densest: densest(parseGroups(el)),
    hold: Number(el.dataset.pinHold) || 0,
    cap: Number(el.dataset.pinCap) || 0,
    shown: -1,
    pinned: false,
    u: -1,
    step: -1,
    fx: { items: [], input: null },
    dirty: true,
    input: { enter: 1, exit: 0, p: 0.5, u: 0, pinned: false },
  }));
  if (slots.length === 0 || !("IntersectionObserver" in window)) return () => {};

  const header = pageHeader(host);
  const wide = window.matchMedia(WIDE);
  const bySection = new Map<Element, Slot>(slots.map((slot) => [slot.el, slot]));
  const state: SceneState = { p: 0, enter: 0, exit: 0 };
  const pin: PinState = { group: 0, item: 0, t: 0, step: 0 };
  const look: ConnectorLook = {
    dash: 0,
    label: 1,
    sparkle: 0,
    turn: 0,
    along: 0,
    fact: 0,
    rider: 0,
  };
  let near: Slot[] = [];
  let seen = -1;
  let offset = header?.getBoundingClientRect().height ?? 0;
  let viewport = window.innerHeight;
  let viewportWidth = window.innerWidth;
  let raf = 0;
  let settling = false;
  let idle = 0;

  const setPinned = () => {
    for (const slot of slots) {
      if (!slot.groups) continue;
      const on = wide.matches;
      if (on === slot.pinned) continue;
      slot.pinned = on;
      slot.step = -1;
      slot.u = -1;
      slot.shown = -1;
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
    settling = false;
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
        const holdLength = (slot.hold / 100) * viewport;
        let along = Math.min(Math.max(offset - slot.top, 0), length);
        if (slot.cap > 0) {
          const limit = (Math.max(1, length - holdLength) / (slot.groups.length * slot.densest)) * slot.cap;
          slot.shown = chase(slot.shown, along, limit);
          if (slot.shown !== along) settling = true;
          along = slot.shown;
        }
        pinStep(pin, along, length, holdLength, slot.groups);
        const u = pin.step + pin.t;
        slot.input.u = u;
        const rounded = Math.round(u * STEPS);
        if (rounded !== slot.u) slot.el.setAttribute("data-u", String(rounded / STEPS));
        slot.u = rounded;
        if (pin.step !== slot.step) {
          slot.step = pin.step;
          slot.el.dispatchEvent(new CustomEvent("scenestep", { detail: { group: pin.group, item: pin.item } }));
        }
      }
      if (slot.dirty) {
        release(slot.fx);
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
        if (d !== item.d) {
          item.el.setAttribute("data-d", String(d));
          const { reveal, label, sparkle, fact, rider } = item.parts;
          connectorLook(look, d);
          reveal.style.strokeDashoffset = String(look.dash);
          label.style.opacity = String(look.label);
          sparkle.style.offsetDistance = `${look.along}%`;
          sparkle.style.opacity = String(look.sparkle);
          sparkle.style.rotate = `${look.turn}deg`;
          fact.style.offsetDistance = `${look.along}%`;
          fact.style.opacity = String(look.fact);
          rider.style.offsetDistance = `${look.along}%`;
          rider.style.opacity = String(look.rider);
        }
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
    if (settling) raf = requestAnimationFrame(tick);
  };

  const follow = () => {
    const y = window.scrollY;
    if (y === seen && !settling) return;
    seen = y;
    viewport = window.innerHeight;
    viewportWidth = window.innerWidth;
    paint(near);
  };

  const settleSoon = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(() => {
      seen = -1;
      follow();
    }, SETTLE_MS);
  };

  const schedule = () => {
    settleSoon();
    if (!raf && !smoothScroll.active()) raf = requestAnimationFrame(tick);
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
        slot.shown = -1;
        if (slot.near) slot.el.setAttribute("data-live", "");
        else {
          slot.el.removeAttribute("data-live");
          clearFx(slot.fx);
        }
      }
      near = slots.filter((slot) => slot.near);
      seen = -1;
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
    seen = -1;
    schedule();
  });
  slots.forEach((slot) =>
    mutations.observe(slot.el, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] })
  );
  const sizes = new ResizeObserver(() => resize());
  slots.forEach((slot) => sizes.observe(slot.el));
  if (header) sizes.observe(header);
  let disposed = false;
  void document.fonts?.ready.then(() => {
    if (!disposed) resize();
  });
  setPinned();
  paint(slots);

  const rePin = () => {
    setPinned();
    resize();
  };
  wide.addEventListener("change", rePin);
  const unfollow = smoothScroll.onFrame(follow);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("scrollend", settleSoon);
  window.addEventListener("resize", resize);
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(idle);
    unfollow();
    observer.disconnect();
    mutations.disconnect();
    sizes.disconnect();
    wide.removeEventListener("change", rePin);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("scrollend", settleSoon);
    window.removeEventListener("resize", resize);
    for (const item of connectors.current?.items ?? []) {
      item.el.removeAttribute("data-d");
      const { reveal, label, sparkle, fact, rider } = item.parts;
      reveal.style.removeProperty("stroke-dashoffset");
      label.style.removeProperty("opacity");
      for (const part of [sparkle, fact, rider]) {
        part.style.removeProperty("offset-distance");
        part.style.removeProperty("opacity");
      }
      sparkle.style.removeProperty("rotate");
      item.target.removeAttribute("data-docked");
      item.d = -1;
      item.docked = false;
    }
    for (const slot of slots) {
      clearFx(slot.fx);
      release(slot.fx);
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
    const reduced = window.matchMedia(REDUCED_MOTION);
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
