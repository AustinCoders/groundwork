import type { CSSProperties } from "react";
import type { ShellTone } from "./types";

export function toneStyle(tone: ShellTone): CSSProperties {
  return { "--tone": `var(--c-${tone})` } as CSSProperties;
}
