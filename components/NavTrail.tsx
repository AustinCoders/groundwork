"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { recordVisit, refreshTitle } from "@/lib/navTrail";

export function NavTrail() {
  const pathname = usePathname();
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    recordVisit(path);
    const timer = window.setTimeout(() => refreshTitle(path), 800);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
