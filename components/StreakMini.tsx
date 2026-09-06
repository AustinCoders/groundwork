"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TiltCard } from "@/components/TiltCard";
import { computeStats } from "@/lib/gamification";
import { useMounted, useProgressValue } from "@/lib/hooks";
import { plural } from "@/lib/format";

export function StreakMini() {
  const mounted = useMounted();
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
