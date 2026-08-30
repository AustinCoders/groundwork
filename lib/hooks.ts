import { useSyncExternalStore } from "react";
import { lastLevel, progress } from "@/lib/storage";

export function subscribeNever() {
  return () => {};
}
const subscribe = subscribeNever;

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

function getServerNull() {
  return null;
}

export function useLastLevel(): string | null {
  return useSyncExternalStore(subscribe, lastLevel, getServerNull);
}

function subscribeToColorScheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getColorScheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerColorScheme(): "dark" | "light" {
  return "light";
}

export function useOSColorScheme(): "dark" | "light" {
  return useSyncExternalStore(subscribeToColorScheme, getColorScheme, getServerColorScheme);
}

export function useClientValue<T>(getValue: () => T, fallback: T): T {
  return useSyncExternalStore(subscribeNever, getValue, () => fallback);
}

/**
 * Like useClientValue, but re-reads whenever progress changes anywhere in
 * the app — so the sidebar meter tracks a chapter ticked in the reader.
 */
export function useProgressValue<T>(getValue: () => T, fallback: T): T {
  return useSyncExternalStore(progress.subscribe, getValue, () => fallback);
}
