"use client";

import { usePathname } from "next/navigation";

/**
 * Keying on the pathname forces a remount on every navigation, which
 * retriggers the `.route-fade` CSS animation — a lightweight stand-in for
 * a page transition with zero JS animation cost (pure CSS keyframes).
 */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
