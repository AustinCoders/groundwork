"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { prefersMotion } from "@/lib/dom";

export function useChapterKeys({ prevHref, nextHref }: { prevHref?: string; nextHref?: string }) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === "]" || e.key === "n") && nextHref) router.push(nextHref);
      if ((e.key === "[" || e.key === "p") && prevHref) router.push(prevHref);
      if (e.key === "t") window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" });
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, prevHref, nextHref]);
}
