"use client";

import { useEffect, useMemo } from "react";
import { useClientValue, useProgressValue } from "@/lib/hooks";
import { announceStoredChanges, dayKey, solvedOn, store } from "@/lib/storage";
import { rememberDailyPick, weekInput } from "./cardExtras";
import { DAILY_KEY, readPick, readSavedDaily, type SavedDaily } from "./daily";
import { CHALLENGES_KEY, challengeState, sanitizeWins, type ChallengeState } from "./weekly";

const asked = new Set<string>();

export function useToday(): string {
  return useClientValue(dayKey, "");
}

export function useDaily(): { pick: SavedDaily | null; done: boolean; today: string } {
  const today = useToday();
  const key = useProgressValue(() => JSON.stringify(readSavedDaily(store.get<unknown>(DAILY_KEY, null), dayKey())), "");
  const pick = useMemo(() => (key ? (JSON.parse(key) as SavedDaily | null) : null), [key]);
  const done = useProgressValue(() => Boolean(pick && solvedOn()[pick.id] === dayKey()), false);

  useEffect(() => {
    if (!today || pick || asked.has(today)) return;
    asked.add(today);
    void fetch(`/api/daily?day=${today}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const found = readPick(data);
        if (!found) return;
        rememberDailyPick(today, found);
        announceStoredChanges([DAILY_KEY]);
      })
      .catch(() => {
        asked.delete(today);
      });
  }, [today, pick]);

  return { pick, done, today };
}

export function useChallenge(): ChallengeState | null {
  const key = useProgressValue(() => JSON.stringify(challengeState(dayKey(), weekInput())), "");
  const state = useMemo(() => (key ? (JSON.parse(key) as ChallengeState) : null), [key]);
  const wins = useProgressValue(() => Object.keys(sanitizeWins(store.get<unknown>(CHALLENGES_KEY, null))).length, 0);

  useEffect(() => {
    if (!state?.done) return;
    const saved = sanitizeWins(store.get<unknown>(CHALLENGES_KEY, null));
    if (saved[state.week] === state.challenge.id) return;
    store.set(CHALLENGES_KEY, { ...saved, [state.week]: state.challenge.id });
    announceStoredChanges([CHALLENGES_KEY]);
  }, [state]);

  return state ? { ...state, wins } : null;
}
