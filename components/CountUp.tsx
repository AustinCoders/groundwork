"use client";

import { useEffect, useState } from "react";
import { prefersMotion } from "@/lib/dom";

/** Counts up from 0 to `value` on mount — same eased-cubic animation
 * HomeView's hero stats use, pulled out so /progress can reuse it. */
export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!prefersMotion()) {
      // Deferred rather than a direct call — see lib/hooks.ts's useMounted
      // convention: setState synchronously in an effect body cascades.
      const kick = setTimeout(() => setDisplay(value), 0);
      return () => clearTimeout(kick);
    }

    let raf = 0;
    let startTime: number | null = null;
    function frame(now: number) {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
}
