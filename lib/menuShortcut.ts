export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

export function isMenuShortcut(event: KeyLike): boolean {
  return event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey;
}

const EDITABLE = "input, textarea, select, [contenteditable]:not([contenteditable=false]), .cm-editor";

export function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE) !== null;
}

export function usesCommandKey(platform: string): boolean {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export function menuShortcutLabel(platform: string): string {
  return usesCommandKey(platform) ? "⌘K" : "Ctrl K";
}
