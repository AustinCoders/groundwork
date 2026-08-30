"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Chapters used to be hash fragments on the topic page (/dsa#dsa-tries).
 * They're real routes now, so any surviving bookmark or shared link gets
 * forwarded once, on the cover, to the page it meant.
 */
export function HashRedirect({ basePath }: { basePath: string }) {
  const router = useRouter();

  useEffect(() => {
    function forward() {
      const id = window.location.hash.slice(1);
      if (!id || id === "top") return;
      if (!/^[a-z0-9-]+$/i.test(id)) return;
      history.replaceState(null, "", window.location.pathname + window.location.search);
      router.replace(`${basePath}/${id}`);
    }
    forward();
    // A hash-only link clicked while already on the cover changes the URL
    // without remounting anything, so mount alone isn't enough to catch it.
    window.addEventListener("hashchange", forward);
    return () => window.removeEventListener("hashchange", forward);
  }, [basePath, router]);

  return null;
}
