import type { CSSProperties } from "react";
import type { AvatarColor } from "@/lib/account/profileExtras";

export function avatarStyle(color: AvatarColor | undefined, photo?: string | null): CSSProperties | undefined {
  const style: Record<string, string> = {};
  if (color && color !== "blue") style["--avatar"] = `var(--c-${color})`;
  if (photo) {
    style.backgroundImage = `url("${photo.replace(/["\\\n]/g, "")}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    style.color = "transparent";
  }
  return Object.keys(style).length ? (style as CSSProperties) : undefined;
}
