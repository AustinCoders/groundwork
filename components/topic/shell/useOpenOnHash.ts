"use client";

import { useEffect } from "react";

function reveal(id: string): HTMLElement | null {
  const target = id ? document.getElementById(id) : null;
  if (!target) return null;
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (node instanceof HTMLDetailsElement) node.open = true;
  }
  return target;
}

function hashId(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return "";
  }
}

export function useOpenOnHash(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    reveal(hashId())?.scrollIntoView();
  }, [ready]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const href = anchor?.getAttribute("href");
      if (href && href.length > 1) reveal(decodeURIComponent(href.slice(1)));
    };
    const onHashChange = () => reveal(hashId())?.scrollIntoView();
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
}
