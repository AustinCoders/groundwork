"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Keying on the pathname forces a remount on every client-side navigation,
 * which retriggers the `.route-fade` CSS animation — a lightweight
 * stand-in for a page transition with zero JS animation cost.
 *
 * The very first render (the actual page load, not a navigation) must
 * skip the animation: fading in the whole page delays when the browser
 * considers the largest element "painted", which directly inflates LCP.
 * The ref only needs to be read correctly by the *next* render (the
 * first real navigation), so mutating it without a state update is fine.
 */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useRef(false);
  const skipAnimation = !mounted.current;

  useEffect(() => {
    mounted.current = true;
  }, []);

  if (skipAnimation) return <>{children}</>;
  return (
    <div key={pathname} className="route-fade">
      {children}
    </div>
  );
}
