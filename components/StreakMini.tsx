"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TiltCard } from "@/components/TiltCard";
import { computeStats } from "@/lib/gamification";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

/** A one-line taste of the /progress page's streak counter, right in the
 * sidebar. Hidden until there's an actual streak to show — a "0 day
 * streak" pill on every page load isn't a nudge, it's a nag. */
export function StreakMini() {
  const mounted = useMounted();
  // computeStats() builds a fresh object every call — useSyncExternalStore
  // (behind useProgressValue) needs a stable snapshot, so go through a
  // string the same way /progress does.
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const streak = useMemo(() => (statsKey ? (JSON.parse(statsKey).streak as number) : 0), [statsKey]);

  if (!mounted || streak === 0) return null;

  return (
    <TiltCard className="streak-mini">
      <Link href="/progress" className="streak-mini__link">
        <span className="streak-mini__flame" aria-hidden="true">
          🔥
        </span>
        <span className="streak-mini__text">
          <b>{streak}</b> {plural(streak, "day")} streak
        </span>
      </Link>
    </TiltCard>
  );
}
