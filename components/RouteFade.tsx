"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

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
