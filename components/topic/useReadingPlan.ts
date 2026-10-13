"use client";

import { useCallback, useMemo, useState } from "react";
import { progress, store } from "@/lib/storage";
import { useClientValue, useMounted, useProgressValue } from "@/lib/hooks";
import { nextChapter, requiresCheck, type Completion } from "@/lib/completion";
import { readingPlan } from "@/lib/placementPlan";
import { usePlacement } from "@/lib/placementStore";
import type { LevelId } from "@/content/types";

export interface Station {
  id: string;
  num: string;
  short: string;
  subtitle: string;
  level: LevelId;
  minutes: number;
  exercises: number;
  ready: boolean;
}

const BUDGET_KEY = "jsnotes:reading-budget";
export const BUDGET_STEPS = [10, 20, 30, 45, 60, 90];
const DEFAULT_BUDGET = 30;

export function useReadingPlan(stations: Station[], topicId: string, completion?: Completion) {
  const mounted = useMounted();
  const savedBudget = useClientValue(() => {
    const value = store.get<unknown>(BUDGET_KEY, DEFAULT_BUDGET);
    return typeof value === "number" && BUDGET_STEPS.includes(value) ? value : DEFAULT_BUDGET;
  }, DEFAULT_BUDGET);
  const [budgetOverride, setBudgetOverride] = useState<number | null>(null);
  const budget = budgetOverride ?? savedBudget;

  const placement = usePlacement();
  const readable = useMemo(() => stations.filter((s) => s.ready), [stations]);
  const plan = useMemo(
    () => (requiresCheck(completion) ? readingPlan(placement, readable) : null),
    [completion, placement, readable]
  );
  const testedOut = useMemo(() => new Set(plan?.testedOut ?? []), [plan]);
  const allotted = useMemo(() => (plan ? new Set(plan.allotted) : null), [plan]);

  const doneKey = useProgressValue(() => readable.map((s) => (progress.isChapterDone(s.id) ? "1" : "0")).join(""), "");
  const done = useMemo(() => {
    const set = new Set<string>();
    if (!doneKey) return set;
    readable.forEach((s, i) => {
      if (doneKey[i] === "1") set.add(s.id);
    });
    return set;
  }, [doneKey, readable]);

  const inPlan = useCallback((id: string) => (allotted ? allotted.has(id) : true), [allotted]);

  const next = useMemo(() => nextChapter(completion, readable, done, plan, true), [completion, readable, done, plan]);

  const reach = useMemo(() => {
    const set = new Set<string>();
    if (!next) return set;
    let spent = 0;
    for (let i = readable.indexOf(next); i < readable.length; i++) {
      const s = readable[i];
      if (done.has(s.id) || !inPlan(s.id)) continue;
      if (spent + s.minutes > budget) break;
      spent += s.minutes;
      set.add(s.id);
    }
    return set;
  }, [readable, next, done, budget, inPlan]);

  const minutesLeft = readable.filter((s) => !done.has(s.id) && inPlan(s.id)).reduce((sum, s) => sum + s.minutes, 0);
  const lastInReach = readable.filter((s) => reach.has(s.id)).slice(-1)[0] ?? null;

  function setBudget(value: number) {
    setBudgetOverride(value);
    store.set(BUDGET_KEY, value);
  }

  return {
    mounted,
    budget,
    setBudget,
    readable,
    done,
    next,
    reach,
    minutesLeft,
    lastInReach,
    readCount: done.size,
    planned: allotted !== null,
    reviseLeft: readable.filter((s) => !done.has(s.id) && !testedOut.has(s.id) && !inPlan(s.id)).length,
  };
}
