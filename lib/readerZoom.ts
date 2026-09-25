"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/storage";
import { useClientValue, useMounted } from "@/lib/hooks";

export const ZOOM_STEPS = [85, 92, 100, 110, 120, 132, 145, 160];
export const ZOOM_KEY = "jsnotes:zoom";

export function useReaderZoom(): [number, (step: number) => void] {
  const mounted = useMounted();
  const saved = useClientValue(() => {
    const value = store.get<number | null>(ZOOM_KEY, null);
    const index = value !== null ? ZOOM_STEPS.indexOf(value) : -1;
    return index !== -1 ? index : ZOOM_STEPS.indexOf(100);
  }, ZOOM_STEPS.indexOf(100));
  const [override, setOverride] = useState<number | null>(null);
  const index = override ?? saved;

  useEffect(() => {
    if (!mounted) return;
    const pct = ZOOM_STEPS[index];
    document.documentElement.style.setProperty("--reader-zoom", String(pct / 100));
    store.set(ZOOM_KEY, pct);
  }, [index, mounted]);

  const step = (delta: number) => setOverride(Math.min(ZOOM_STEPS.length - 1, Math.max(0, index + delta)));
  return [index, step];
}
