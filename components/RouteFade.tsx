"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="gw-page-enter" exit="gw-page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
