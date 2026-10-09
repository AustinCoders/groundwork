import { useSyncExternalStore } from "react";

function matches(query: string): boolean {
  return window.matchMedia(query).matches;
}

export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => matches(query),
    () => false
  );
}
