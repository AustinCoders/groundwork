"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./types";

export function useActiveHeading(toc: TocItem[]) {
  const [active, setActive] = useState<string | null>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let ticking = false;
    function update() {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const frac = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setPct(Math.round(frac * 100));
      const line = Math.min(window.innerHeight * 0.3, 260);
      const atEnd = max > 0 && window.scrollY >= max - 4;
      let current: string | null = null;
      for (const item of toc) {
        const h = document.getElementById(item.id);
        if (!h) continue;
        const top = h.getBoundingClientRect().top;
        if (top < line || (atEnd && top < window.innerHeight - 40)) current = item.id;
      }
      setActive(current);
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [toc]);

  return { active, pct };
}
