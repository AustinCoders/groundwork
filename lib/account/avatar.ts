import type { CSSProperties } from "react";
import type { AvatarColor } from "@/lib/account/profileExtras";

export function avatarStyle(color: AvatarColor | undefined): CSSProperties | undefined {
  if (!color || color === "blue") return undefined;
  return { "--avatar": `var(--c-${color})` } as CSSProperties;
}
