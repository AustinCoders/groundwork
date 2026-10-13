export const END_POPUP_DWELL_MS = 800;
export const END_POPUP_LOOKAHEAD = "0px 0px -30% 0px";

export interface EndPopupState {
  mounted: boolean;
  hasCheck: boolean;
  done: boolean;
  dismissed: boolean;
  hash: string;
  arrivedAtCheck: boolean;
  checking: boolean;
  modalOpen: boolean;
}

export function shouldOpenEndPopup(state: EndPopupState): boolean {
  if (!state.mounted || !state.hasCheck || state.done || state.dismissed) return false;
  if (state.arrivedAtCheck || state.hash === "#check") return false;
  return !state.checking && !state.modalOpen;
}

export const PLAIN_KEYS: ReadonlySet<string> = new Set(["n", "p", "t", "[", "]", "/"]);

export function reachedEnd(entry: { isIntersecting: boolean; top: number }, firstReport: boolean): boolean {
  return entry.isIntersecting || (firstReport && entry.top < 0);
}
