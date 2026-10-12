import { describe, expect, it } from "vitest";
import { isMenuShortcut, menuShortcutLabel, usesCommandKey, type KeyLike } from "@/lib/menuShortcut";

const press = (overrides: Partial<KeyLike>): KeyLike => ({
  key: "k",
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...overrides,
});

describe("the menu shortcut", () => {
  it("is Ctrl or Command plus K and nothing wider", () => {
    expect(isMenuShortcut(press({ ctrlKey: true }))).toBe(true);
    expect(isMenuShortcut(press({ metaKey: true }))).toBe(true);
    expect(isMenuShortcut(press({ ctrlKey: true, key: "K" }))).toBe(true);
    expect(isMenuShortcut(press({}))).toBe(false);
    expect(isMenuShortcut(press({ ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(isMenuShortcut(press({ ctrlKey: true, altKey: true }))).toBe(false);
    expect(isMenuShortcut(press({ ctrlKey: true, key: "j" }))).toBe(false);
  });

  it("names the key by platform", () => {
    expect(usesCommandKey("MacIntel")).toBe(true);
    expect(usesCommandKey("iPhone")).toBe(true);
    expect(usesCommandKey("Win32")).toBe(false);
    expect(menuShortcutLabel("MacIntel")).toBe("⌘K");
    expect(menuShortcutLabel("Linux x86_64")).toBe("Ctrl K");
  });
});
