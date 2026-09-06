"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    window.addEventListener("hashchange", forward);
    return () => window.removeEventListener("hashchange", forward);
  }, [basePath, router]);

  return null;
}
