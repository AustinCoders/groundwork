import type { CSSProperties } from "react";

const ACCENTS: Record<string, string> = { mint: "green" };

export function accent(name: string): CSSProperties {
  const token = ACCENTS[name] ?? name;
  return { "--accent": token === "ink" ? "var(--ink)" : `var(--c-${token})` } as CSSProperties;
}

export function vars(values: Record<string, number | string>): CSSProperties {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [`--${key}`, value])) as CSSProperties;
}

export function stepAttrs(index: number, count: number) {
  return {
    "data-step": index,
    "data-lead": index === 0 ? "" : undefined,
    "data-tail": index === count - 1 ? "" : undefined,
  };
}

export function inWindow(index: number, active: number, pinned: boolean): boolean {
  return pinned ? Math.abs(index - active) <= 1 : index === active;
}

export const XP_STICKER = "+25 XP";

export function panelAttrs(mounted: boolean, hide: boolean, inactive: boolean) {
  return mounted
    ? { hidden: hide, inert: inactive || undefined, "aria-hidden": inactive || undefined }
    : { "data-panel-off": hide || undefined };
}
