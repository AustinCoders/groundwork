"use client";

export const OPEN_CHECK_EVENT = "groundwork:open-check";

export interface ClickLike {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}

export function isPlainPrimaryClick(event: ClickLike): boolean {
  if (event.defaultPrevented || event.button !== 0) return false;
  return !(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);
}

export function requestCheck() {
  window.dispatchEvent(new CustomEvent(OPEN_CHECK_EVENT));
}

export function openCheckOnClick(event: ClickLike) {
  if (isPlainPrimaryClick(event)) requestCheck();
}

export function onCheckRequest(handler: () => void): () => void {
  window.addEventListener(OPEN_CHECK_EVENT, handler);
  return () => window.removeEventListener(OPEN_CHECK_EVENT, handler);
}
