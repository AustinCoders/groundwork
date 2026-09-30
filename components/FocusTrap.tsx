"use client";

import { FocusScope } from "@radix-ui/react-focus-scope";
import { useEffect, useState } from "react";

function tabStops(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>("*")).filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.matches(":disabled") &&
      !el.closest("[inert]") &&
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== "hidden"
  );
}

function loopTabWithin(scope: HTMLElement) {
  return (event: KeyboardEvent) => {
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) return;
    const stops = tabStops(scope);
    const first = stops[0] ?? scope;
    const last = stops[stops.length - 1] ?? scope;
    const at = document.activeElement;
    const atEdge = event.shiftKey ? at === first || at === scope : at === last;
    if (!atEdge) return;
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  };
}

function leaveFocusToTrap(event: Event) {
  event.preventDefault();
}

export function FocusTrap({ active = true, children }: { active?: boolean; children: React.ReactElement }) {
  const [scope, setScope] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !scope) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!scope.contains(opener)) (tabStops(scope)[0] ?? scope).focus({ preventScroll: true });
    const loopTab = loopTabWithin(scope);
    scope.addEventListener("keydown", loopTab);
    return () => {
      scope.removeEventListener("keydown", loopTab);
      opener?.focus();
    };
  }, [active, scope]);

  return (
    <FocusScope
      asChild
      trapped={active}
      ref={setScope}
      onMountAutoFocus={leaveFocusToTrap}
      onUnmountAutoFocus={leaveFocusToTrap}
    >
      {children}
    </FocusScope>
  );
}
