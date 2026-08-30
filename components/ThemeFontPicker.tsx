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

export function ThemePicker() {
  const mounted = useMounted();
  const osScheme = useOSColorScheme();
  const [explicitTheme, setExplicitTheme] = useState<ThemeValue | null>(null);

  const theme: ThemeValue = explicitTheme ?? (mounted ? (savedTheme() ?? osScheme) : "light");

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  function onThemeChange(value: string) {
    const next = value as ThemeValue;
    setSavedTheme(next);
    setExplicitTheme(next);
  }

  if (!mounted) return null;
  return <Dropdown items={THEME_ITEMS} value={theme} onChange={onThemeChange} ariaLabel="Theme" openUp />;
}

export function FontPicker() {
  const mounted = useMounted();
  const [explicitFont, setExplicitFont] = useState<FontValue | null>(null);

  const font: FontValue = explicitFont ?? (mounted ? (savedFont() ?? "classic") : "classic");

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute("data-font", font);
  }, [font, mounted]);

  function onFontChange(value: string) {
    const next = value as FontValue;
    setSavedFont(next);
    setExplicitFont(next);
  }

  if (!mounted) return null;
  return <Dropdown items={FONT_ITEMS} value={font} onChange={onFontChange} ariaLabel="Handwriting style" openUp />;
}
