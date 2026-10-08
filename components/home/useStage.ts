import { useEffect, useRef } from "react";
import { pointerUnit } from "@/lib/stageMotion";

const REDUCED = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

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

    const rest = () => {
      stage.style.removeProperty("--px");
      stage.style.removeProperty("--py");
    };

    const arm = () => {
      observer?.disconnect();
      observer = null;
      stage.removeAttribute("data-in");
      stage.removeAttribute("data-armed");
      rest();
      if (reduced.matches) return;
      stage.setAttribute("data-armed", "");
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

    const apply = () => {
      frame = 0;
      if (!latest) return;
      const box = stage.getBoundingClientRect();
      stage.style.setProperty("--px", pointerUnit(latest.clientX, box.left, box.width).toFixed(3));
      stage.style.setProperty("--py", pointerUnit(latest.clientY, box.top, box.height).toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || reduced.matches || !fine.matches) return;
      latest = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      latest = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rest();
    };

    arm();
    reduced.addEventListener("change", arm);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      reduced.removeEventListener("change", arm);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
