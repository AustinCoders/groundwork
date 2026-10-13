import { describe, expect, it } from "vitest";
import { choiceIndexForKey, choiceLetter, isCodeOnly } from "@/lib/choiceDisplay";

describe("choiceLetter", () => {
  it("names the choices A, B, C and D in order", () => {
    expect([0, 1, 2, 3].map(choiceLetter)).toEqual(["A", "B", "C", "D"]);
  });
});

describe("choiceIndexForKey", () => {
  it("maps a letter in either case and a digit to the same choice", () => {
    expect(choiceIndexForKey("a", 4)).toBe(0);
    expect(choiceIndexForKey("C", 4)).toBe(2);
    expect(choiceIndexForKey("1", 4)).toBe(0);
    expect(choiceIndexForKey("4", 4)).toBe(3);
  });

  it("ignores keys past the last choice and keys that are not a single character", () => {
    expect(choiceIndexForKey("e", 4)).toBeNull();
    expect(choiceIndexForKey("5", 4)).toBeNull();
    expect(choiceIndexForKey("0", 4)).toBeNull();
    expect(choiceIndexForKey("Enter", 4)).toBeNull();
    expect(choiceIndexForKey(" ", 4)).toBeNull();
    expect(choiceIndexForKey("a", 0)).toBeNull();
  });

  it("leaves the shortcut keys the site already uses alone for a normal choice count", () => {
    for (const key of ["n", "p", "t", "[", "]", "/"]) expect(choiceIndexForKey(key, 4)).toBeNull();
  });
});

describe("isCodeOnly", () => {
  it("is true when the whole choice is one code span", () => {
    expect(isCodeOnly("<code>[3, 5, 8, 12, 20]</code>")).toBe(true);
    expect(isCodeOnly("  <code>lo = mid + 1</code>\n")).toBe(true);
  });

  it("is false for prose, mixed text and nested markup", () => {
    expect(isCodeOnly("4, 7, 6")).toBe(false);
    expect(isCodeOnly("Set <code>hi = mid</code> if the speed works.")).toBe(false);
    expect(isCodeOnly("<code>a</code> and <code>b</code>")).toBe(false);
    expect(isCodeOnly("<code><b>x</b></code>")).toBe(false);
  });
});
