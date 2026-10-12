"use client";

import { useEffect, useRef } from "react";
import {
  activateScripts,
  enhanceCodeBlocks,
  enhanceTables,
  enhanceTryBlocks,
  markNoSmooth,
} from "@/components/reader/enhancements";
import { makeScrollRegions } from "@/components/reader/scrollRegions";
import { setupNarration } from "@/components/reader/narration";

export function useChapterBody(chapterId: string) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    activateScripts(el);
    enhanceCodeBlocks(el);
    enhanceTables(el);
    enhanceTryBlocks(el);
    markNoSmooth(el);
    const stopNarration = setupNarration(el.closest("article") ?? el);
    const stopScrollRegions = makeScrollRegions(el);
    el.setAttribute("data-enhanced", "");
    return () => {
      el.removeAttribute("data-enhanced");
      stopNarration();
      stopScrollRegions();
    };
  }, [chapterId]);

  return bodyRef;
}
