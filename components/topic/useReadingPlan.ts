"use client";

import { useMemo, useState } from "react";
import { progress, store } from "@/lib/storage";
import { useClientValue, useMounted, useProgressValue } from "@/lib/hooks";

export interface Station {
  id: string;
  num: string;
  short: string;
  subtitle: string;
  minutes: number;
  exercises: number;
  ready: boolean;
}

const BUDGET_KEY = "jsnotes:reading-budget";
export const BUDGET_STEPS = [10, 20, 30, 45, 60, 90];
const DEFAULT_BUDGET = 30;

export function useReadingPlan(stations: Station[], topicId: string) {
  const mounted = useMounted();
  const savedBudget = useClientValue(() => {
    const value = store.get<number>(BUDGET_KEY, DEFAULT_BUDGET);
    return typeof value === "number" ? value : DEFAULT_BUDGET;
  }, DEFAULT_BUDGET);
  const [budgetOverride, setBudgetOverride] = useState<number | null>(null);
  const budget = budgetOverride ?? savedBudget;

  const readable = useMemo(() => stations.filter((s) => s.ready), [stations]);

  const doneKey = useProgressValue(() => readable.map((s) => (progress.isChapterDone(s.id) ? "1" : "0")).join(""), "");
  const done = useMemo(() => {
    const set = new Set<string>();
    if (!doneKey) return set;
    readable.forEach((s, i) => {
      if (doneKey[i] === "1") set.add(s.id);
    });
    return set;
  }, [doneKey, readable]);

  const next = useMemo(() => readable.find((s) => !done.has(s.id)) ?? null, [readable, done]);

  const reach = useMemo(() => {
    const set = new Set<string>();
    if (!next) return set;
    let spent = 0;
    for (let i = readable.indexOf(next); i < readable.length; i++) {
      const s = readable[i];
      if (done.has(s.id)) continue;
      if (spent + s.minutes > budget) break;
      spent += s.minutes;
      set.add(s.id);
    }
    return set;
  }, [readable, next, done, budget]);

  const minutesLeft = readable.filter((s) => !done.has(s.id)).reduce((sum, s) => sum + s.minutes, 0);
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
  };
}
