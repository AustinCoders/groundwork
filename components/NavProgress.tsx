"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SHOW_AFTER_MS = 140;
const GIVE_UP_MS = 10000;

type Phase = "idle" | "loading" | "done";

function leavesPage(event: MouseEvent): string | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return url.pathname + url.search;
}

export function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);
  const pending = useRef(false);

  function clear() {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }

  useEffect(() => {
    function begin() {
      clear();
      pending.current = true;
      timers.current.push(
        window.setTimeout(() => {
          if (pending.current) setPhase("loading");
        }, SHOW_AFTER_MS),
        window.setTimeout(() => {
          pending.current = false;
          setPhase("idle");
        }, GIVE_UP_MS)
      );
    }
    function onClick(event: MouseEvent) {
      if (leavesPage(event)) begin();
    }
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", begin);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", begin);
      clear();
    };
  }, []);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    clear();
    setPhase((now) => (now === "loading" ? "done" : "idle"));
    timers.current.push(window.setTimeout(() => setPhase("idle"), 380));
  }, [pathname, search]);

  if (phase === "idle") return null;
  return <div className="gw-nav-progress" data-phase={phase} aria-hidden="true" />;
}
