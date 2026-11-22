"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type NavFit = "full" | "text" | "icons" | "tight";

const SLACK = 12;

const seen = new WeakMap<Element, number>();

function sideWidth(header: HTMLElement, skip: Element[]): { width: number; count: number } {
  let width = 0;
  let count = 0;
  for (const child of Array.from(header.children)) {
    if (skip.includes(child)) continue;
    const style = getComputedStyle(child);
    if (style.position === "absolute" || style.position === "fixed") continue;
    const optional = child.hasAttribute("data-fit-drop");
    if (style.display === "none") {
      if (!optional || !seen.has(child)) continue;
      width += seen.get(child) ?? 0;
      count += 1;
      continue;
    }
    const size = child.getBoundingClientRect().width;
    if (optional) seen.set(child, size);
    width += size;
    count += 1;
  }
  return { width, count };
}

export function useNavFit(
  header: RefObject<HTMLElement | null>,
  nav: RefObject<HTMLElement | null>,
  ghost: RefObject<HTMLElement | null>
): NavFit | null {
  const [fit, setFit] = useState<NavFit | null>(null);

  useLayoutEffect(() => {
    const bar = header.current;
    const links = nav.current;
    const measure = ghost.current;
    if (!bar || !links || !measure) return;

    function update() {
      if (!bar || !links || !measure) return;
      const style = getComputedStyle(bar);
      const gap = parseFloat(style.columnGap) || 0;
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const sides = sideWidth(bar, [links, measure]);
      const room = bar.clientWidth - padding - sides.width - gap * sides.count;
      const full = measure.scrollWidth;
      const icons = measure.querySelectorAll("svg").length;
      const iconWidth = (measure.querySelector("svg")?.getBoundingClientRect().width ?? 0) + 7;
      const text = full - icons * iconWidth;
      const bare = icons * 40 + Math.max(0, icons - 1) * 2;
      const next: NavFit =
        room >= full + SLACK ? "full" : room >= text + SLACK ? "text" : room >= bare + SLACK ? "icons" : "tight";
      setFit((now) => (now === next ? now : next));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    for (const child of Array.from(bar.children)) if (child !== links && child !== measure) observer.observe(child);
    document.fonts?.ready.then(update).catch(() => undefined);
    return () => observer.disconnect();
  }, [header, nav, ghost]);

  return fit;
}
