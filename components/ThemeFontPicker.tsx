"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "@/components/ui/select";
import { useMounted, useOSColorScheme } from "@/lib/hooks";
import {
  FONT_ITEMS,
  THEME_ITEMS,
  savedFont,
  savedTheme,
  setSavedFont,
  setSavedTheme,
  type FontValue,
  type ThemeValue,
} from "@/lib/storage";

export function useThemeChoice(): [ThemeValue, (next: ThemeValue) => void, boolean] {
  const mounted = useMounted();
  const osScheme = useOSColorScheme();
  const [explicitTheme, setExplicitTheme] = useState<ThemeValue | null>(null);
  const theme: ThemeValue = explicitTheme ?? (mounted ? (savedTheme() ?? osScheme) : "light");

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  function choose(next: ThemeValue) {
    setSavedTheme(next);
    setExplicitTheme(next);
  }

  return [theme, choose, mounted];
}

export function useFontChoice(): [FontValue, (next: FontValue) => void, boolean] {
  const mounted = useMounted();
  const [explicitFont, setExplicitFont] = useState<FontValue | null>(null);
  const font: FontValue = explicitFont ?? (mounted ? (savedFont() ?? "classic") : "classic");

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute("data-font", font);
  }, [font, mounted]);

  function choose(next: FontValue) {
    setSavedFont(next);
    setExplicitFont(next);
  }

  return [font, choose, mounted];
}

export function ThemePicker({ openUp = true, compact }: { openUp?: boolean; compact?: boolean } = {}) {
  const [theme, choose, mounted] = useThemeChoice();
  if (!mounted) return null;
  return (
    <Dropdown
      items={THEME_ITEMS}
      value={theme}
      onChange={(v) => choose(v as ThemeValue)}
      ariaLabel="Theme"
      openUp={openUp}
      compact={compact}
    />
  );
}

export function FontPicker({ openUp = true, compact }: { openUp?: boolean; compact?: boolean } = {}) {
  const [font, choose, mounted] = useFontChoice();
  if (!mounted) return null;
  return (
    <Dropdown
      items={FONT_ITEMS}
      value={font}
      onChange={(v) => choose(v as FontValue)}
      ariaLabel="Handwriting style"
      openUp={openUp}
      compact={compact}
    />
  );
}
