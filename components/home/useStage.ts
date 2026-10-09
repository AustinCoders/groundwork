import { useEffect, useRef } from "react";
import { REDUCED_MOTION } from "@/lib/dom";
import { pointerUnit } from "@/lib/stageMotion";
import { setParallax } from "./fx";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const EASE = 0.18;
const SETTLED = 0.002;

export function useStage<T extends HTMLElement>(pointer = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const reduced = window.matchMedia(REDUCED_MOTION);
    const fine = window.matchMedia(FINE_POINTER);
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let latest: PointerEvent | null = null;
    let moved = false;
    const goal = { x: 0, y: 0 };
    const now = { x: 0, y: 0 };

    const glide = () => {
      frame = 0;
      if (latest && moved) {
        const box = stage.getBoundingClientRect();
        goal.x = pointerUnit(latest.clientX, box.left, box.width);
        goal.y = pointerUnit(latest.clientY, box.top, box.height);
        moved = false;
      }
      now.x += (goal.x - now.x) * EASE;
      now.y += (goal.y - now.y) * EASE;
      const settled = Math.abs(goal.x - now.x) < SETTLED && Math.abs(goal.y - now.y) < SETTLED;
      if (settled) {
        now.x = goal.x;
        now.y = goal.y;
      }
      setParallax(stage, now.x, now.y);
      if (!settled) frame = requestAnimationFrame(glide);
    };

    const clear = () => {
      latest = null;
      moved = false;
      goal.x = 0;
      goal.y = 0;
      now.x = 0;
      now.y = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setParallax(stage, 0, 0);
    };

    const rest = () => {
      latest = null;
      moved = false;
      goal.x = 0;
      goal.y = 0;
      if (!frame) frame = requestAnimationFrame(glide);
    };

    const arm = () => {
      observer?.disconnect();
      observer = null;
      stage.removeAttribute("data-in");
      if (reduced.matches) {
        if (pointer) clear();
        return;
      }
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
      moved = true;
      if (!frame) frame = requestAnimationFrame(glide);
    };

    arm();
    reduced.addEventListener("change", arm);
    if (pointer) {
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", rest);
    }
    return () => {
      reduced.removeEventListener("change", arm);
      observer?.disconnect();
      if (!pointer) return;
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", rest);
      if (frame) cancelAnimationFrame(frame);
      setParallax(stage, 0, 0);
    };
  }, [pointer]);

  return ref;
}
