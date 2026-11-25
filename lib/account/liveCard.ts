"use client";

import { useEffect } from "react";
import { useProgressValue } from "@/lib/hooks";
import { currentCard } from "@/lib/profile/cardNow";
import { activity, dayKey, solvedOn } from "@/lib/storage";
import { shareMilestones } from "./feedMilestones";
import { networkCardDue, publishNetworkCard } from "./network";
import type { AccountUser, Profile } from "./session";

const WAIT_MS = 20_000;
const MIN_GAP_MS = 10 * 60_000;
let lastSent = 0;

export function useLiveNetworkCard(user: AccountUser | null, profile: Profile | null): void {
  const pulse = useProgressValue(() => {
    const today = dayKey();
    const done = Object.values(solvedOn()).filter((d) => d === today).length;
    return `${today}:${activity.all()[today] ?? 0}:${done}`;
  }, "");

  useEffect(() => {
    if (!user || !profile?.username || !pulse) return;
    const timer = window.setTimeout(() => {
      const now = Date.now();
      if (now - lastSent < MIN_GAP_MS) return;
      void networkCardDue(now, MIN_GAP_MS).then((due) => {
        if (!due) return;
        lastSent = Date.now();
        void publishNetworkCard(currentCard(user, profile, [])).then((r) => {
          if (r.ok) void shareMilestones();
        });
      });
    }, WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [user, profile, pulse]);
}
