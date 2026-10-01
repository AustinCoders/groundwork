"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { prefersMotion } from "@/lib/dom";

export function useChapterKeys({
  prevHref,
  nextHref,
  onSlash,
}: {
  prevHref?: string;
  nextHref?: string;
  onSlash?: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/" && !typing && onSlash) {
        e.preventDefault();
        onSlash();
        return;
      }
      if (typing) return;
      if ((e.key === "]" || e.key === "n") && nextHref) router.push(nextHref);
      if ((e.key === "[" || e.key === "p") && prevHref) router.push(prevHref);
      if (e.key === "t") window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" });
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, prevHref, nextHref, onSlash]);
}
