"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { readTour } from "@/components/tour/tourStore";
import {
  TOUR_OPEN_EVENT,
  TOUR_PROMPT_DELAY_MS,
  isInteracting,
  isTourPage,
  shouldOfferTour,
} from "@/components/tour/tourRules";

type Mode = "prompt" | "tour";
type HostProps = { mode: Mode; onStart: () => void; onClose: () => void };

let shownThisLoad = false;

function whenLoaded(run: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastInput = Number.NEGATIVE_INFINITY;
  const noteInput = () => {
    lastInput = Date.now();
  };
  const attempt = () => {
    const active = document.activeElement as HTMLElement | null;
    if (
      isInteracting(
        active && {
          tagName: active.tagName,
          role: active.getAttribute("role"),
          isContentEditable: active.isContentEditable,
        },
        Date.now() - lastInput
      )
    ) {
      timer = setTimeout(attempt, TOUR_PROMPT_DELAY_MS);
      return;
    }
    run();
  };
  const arm = () => {
    timer = setTimeout(attempt, TOUR_PROMPT_DELAY_MS);
  };
  window.addEventListener("keydown", noteInput, true);
  window.addEventListener("pointerdown", noteInput, true);
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
    window.removeEventListener("keydown", noteInput, true);
    window.removeEventListener("pointerdown", noteInput, true);
    window.removeEventListener("load", arm);
    clearTimeout(timer);
  };
}

export function TourTrigger({ covers }: { covers: string[] }) {
  const pathname = usePathname();
  const onTourPage = isTourPage(pathname, covers);
  const [mode, setMode] = useState<Mode | null>(null);
  const [host, setHost] = useState<{ Host: ComponentType<HostProps> } | null>(null);

  useEffect(() => {
    if (!shouldOfferTour({ pathname, covers, seen: readTour() !== null, shownThisLoad })) return;
    return whenLoaded(() => {
      if (shownThisLoad || document.querySelector("[aria-modal=true]")) return;
      shownThisLoad = true;
      setMode((current) => current ?? "prompt");
    });
  }, [pathname, covers]);

  useEffect(() => {
    const open = () => setMode("tour");
    window.addEventListener(TOUR_OPEN_EVENT, open);
    return () => window.removeEventListener(TOUR_OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (mode && !host) import("@/components/tour/TourHost").then((loaded) => setHost({ Host: loaded.default }));
  }, [mode, host]);

  if (!mode || !host || (mode === "prompt" && !onTourPage)) return null;
  return <host.Host mode={mode} onStart={() => setMode("tour")} onClose={() => setMode(null)} />;
}
