const MENU_BUTTON = "button[data-menu-button]";

export function focusMenuPill(): void {
  document.querySelector<HTMLElement>(MENU_BUTTON)?.focus();
}

export function focusLeftBehind(): boolean {
  const active = document.activeElement;
  return !active || active === document.body;
}
