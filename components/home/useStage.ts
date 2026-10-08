import { useEffect, useRef } from "react";
import { pointerUnit } from "@/lib/stageMotion";
import { setParallax } from "./fx";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const EASE = 0.18;
const SETTLED = 0.002;

export function useStage<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const reduced = window.matchMedia(REDUCED);
    const fine = window.matchMedia(FINE_POINTER);
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let latest: PointerEvent | null = null;
    const goal = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };

    const glide = () => {
      frame = 0;
      if (latest) {
        const box = stage.getBoundingClientRect();
        goal.x = pointerUnit(latest.clientX, box.left, box.width);
        goal.y = pointerUnit(latest.clientY, box.top, box.height);
      }
      now.x += (goal.x - now.x) * EASE;
      now.y += (goal.y - now.y) * EASE;
      const settled = Math.abs(goal.x - now.x) < SETTLED && Math.abs(goal.y - now.y) < SETTLED;
      if (settled) {
        now.x = goal.x;
        now.y = goal.y;
      }
      setParallax(stage, now.x, now.y);
      if (!settled || latest) frame = requestAnimationFrame(glide);
    };

    const rest = () => {
      latest = null;
      goal.x = 0;
      goal.y = 0;
      if (!frame) frame = requestAnimationFrame(glide);
    };

    const arm = () => {
      observer?.disconnect();
      observer = null;
      stage.removeAttribute("data-in");
      if (reduced.matches) return;
      if (!("IntersectionObserver" in window)) {
        stage.setAttribute("data-in", "");
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          stage.setAttribute("data-in", "");
          observer?.disconnect();
        },
        { threshold: 0.2 }
      );
      observer.observe(stage);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduced.matches || !fine.matches) return;
      latest = event;
      if (!frame) frame = requestAnimationFrame(glide);
    };

    arm();
    reduced.addEventListener("change", arm);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", rest);
    return () => {
      reduced.removeEventListener("change", arm);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", rest);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      setParallax(stage, 0, 0);
    };
  }, []);

  return ref;
}
