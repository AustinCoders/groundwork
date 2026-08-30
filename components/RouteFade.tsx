"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Keying on the pathname forces a remount on every client-side navigation,
 * which retriggers the `.route-fade` CSS animation — a lightweight
 * stand-in for a page transition with zero JS animation cost.
 *
 * The very first render (the actual page load, not a navigation) must
 * skip the animation: fading in the whole page delays when the browser
 * considers the largest element "painted", which directly inflates LCP.
 * `useState`'s lazy initializer runs exactly once, on mount, so it
 * captures "the pathname this page loaded with" without touching a ref
 * during render.
 */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [initialPathname] = useState(pathname);

  if (pathname === initialPathname) return <>{children}</>;
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
