import type { CSSProperties } from "react";

const ACCENTS: Record<string, string> = { mint: "green" };

export function accent(name: string): CSSProperties {
  const token = ACCENTS[name] ?? name;
  return { "--accent": token === "ink" ? "var(--ink)" : `var(--c-${token})` } as CSSProperties;
}

export function vars(values: Record<string, number | string>): CSSProperties {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [`--${key}`, value])) as CSSProperties;
}
