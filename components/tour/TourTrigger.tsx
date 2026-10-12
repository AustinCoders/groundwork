"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { readTour } from "@/components/tour/tourStore";
import { TOUR_OPEN_EVENT, TOUR_PROMPT_DELAY_MS, isTourPage, shouldOfferTour } from "@/components/tour/tourRules";

type Mode = "prompt" | "tour";
type HostProps = { mode: Mode; onStart: () => void; onClose: () => void };

let shownThisLoad = false;

function whenLoaded(run: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    timer = setTimeout(run, TOUR_PROMPT_DELAY_MS);
  };
  if (document.readyState === "complete") arm();
  else window.addEventListener("load", arm, { once: true });
  return () => {
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
