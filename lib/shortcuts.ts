const STEP_ASIDE_WITHIN =
  "button, a, summary, input, textarea, select, [role=button], [role=dialog], [contenteditable]";

export function shortcutShouldStepAside(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return true;
  return event.target instanceof Element && event.target.closest(STEP_ASIDE_WITHIN) !== null;
}
