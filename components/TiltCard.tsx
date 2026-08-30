"use client";

import { useRef } from "react";
import { prefersMotion } from "@/lib/dom";

/** Wraps children in a card that tilts toward the cursor on hover — pure
 * CSS custom properties driven by mousemove, no library. */
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!prefersMotion()) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div ref={ref} className={`tilt-card${className ? ` ${className}` : ""}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}
