"use client";

import { useSyncExternalStore } from "react";
import { activity, store } from "@/lib/storage";
import { freezesToApply } from "./freeze";
import { EMPTY_PLAN, PLAN_KEY, sanitizePlan, type StudyPlan } from "./planData";

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cached: StudyPlan = EMPTY_PLAN;

function read(): StudyPlan {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PLAN_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = sanitizePlan(store.get<unknown>(PLAN_KEY, null));
  }
  return cached;
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PLAN_KEY || e.key === null) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

function serverPlan(): StudyPlan {
  return EMPTY_PLAN;
}

export const plan = {
  all: read,
  update(patch: Partial<StudyPlan>): StudyPlan {
    const next = sanitizePlan({ ...read(), ...patch });
    store.set(PLAN_KEY, next);
    listeners.forEach((fn) => fn());
    return next;
  },
  applyFreezes(now: number = Date.now()): string[] {
    const current = read();
    const add = freezesToApply(activity.all(), current.freezes, now);
    if (add.length > 0) plan.update({ freezes: [...current.freezes, ...add] });
    return add;
  },
};

export function usePlan(): StudyPlan {
  return useSyncExternalStore(subscribe, read, serverPlan);
}
