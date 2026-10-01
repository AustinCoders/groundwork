const ACCENT_ALIASES: Record<string, string> = { mint: "green" };

export function accentVar(accent: string): string {
  const name = ACCENT_ALIASES[accent] ?? accent;
  return name === "ink" ? "var(--ink)" : `var(--c-${name})`;
}
