import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { prefersMotion } from "@/lib/dom";
import { pinOffset } from "@/lib/sceneScroll";
import { smoothScroll } from "@/lib/scrollFx";

const LAND_AT = 0.8;

export function usePin(ref: RefObject<HTMLElement | null>, onStep: (group: number, item: number) => void) {
  const [pinned, setPinned] = useState(false);
  const step = useRef(onStep);

  useEffect(() => {
    step.current = onStep;
  });

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>("section");
    if (!section) return;
    const sync = () => setPinned(section.hasAttribute("data-pinned"));
    const move = (event: Event) => {
      const { group, item } = (event as CustomEvent<{ group: number; item: number }>).detail;
      step.current(group, item);
    };
    sync();
    section.addEventListener("scenepin", sync);
    section.addEventListener("scenestep", move);
    return () => {
      section.removeEventListener("scenepin", sync);
      section.removeEventListener("scenestep", move);
    };
  }, [ref]);

  const go = useCallback(
    (group: number, item: number) => {
      const section = ref.current?.closest<HTMLElement>("section");
      const groups = section?.dataset.pinGroups?.split(",").map(Number);
      if (!section || !groups) return;
      const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const box = section.getBoundingClientRect();
      const length = Math.max(0, box.height - (window.innerHeight - header));
      const hold = ((Number(section.dataset.pinHold) || 0) / 100) * window.innerHeight;
      const target = box.top + window.scrollY - header + pinOffset(length, hold, groups, group, item, LAND_AT);
      smoothScroll.to(Math.max(0, target), !prefersMotion());
    },
    [ref]
  );

  return { pinned, go };
}
