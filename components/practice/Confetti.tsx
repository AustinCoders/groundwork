"use client";

import { useEffect, useRef } from "react";
import { prefersMotion } from "@/lib/dom";

// Reuses the page's own theme tokens for the pieces' colors, so the burst
// matches whichever of the 9 themes is active instead of a fixed palette.
const PIECE_COLORS = ["--red", "--green", "--hl-yellow", "--ink", "--ink-soft"];
const PIECE_COUNT = 60;

/** Fires a one-shot confetti burst whenever `fire` flips to true. */
export function Confetti({ fire }: { fire: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fire) return;
    const host = hostRef.current;
    if (!host || !prefersMotion()) return;

    host.replaceChildren();
    const pieces: HTMLSpanElement[] = [];
    for (let i = 0; i < PIECE_COUNT; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--piece-color", `var(${PIECE_COLORS[i % PIECE_COLORS.length]})`);
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.setProperty("--fall-duration", `${1.6 + Math.random() * 1.2}s`);
      piece.style.setProperty("--fall-delay", `${Math.random() * 0.3}s`);
      piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
      piece.style.setProperty("--piece-rotate", `${Math.random() * 720 - 360}deg`);
      pieces.push(piece);
    }
    host.append(...pieces);

    const timer = setTimeout(() => host.replaceChildren(), 3200);
    return () => clearTimeout(timer);
  }, [fire]);

  return <div className="confetti" ref={hostRef} aria-hidden="true" />;
}
