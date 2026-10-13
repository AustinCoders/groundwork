import { describe, expect, it } from "vitest";
import { END_POPUP_DWELL_MS, PLAIN_KEYS, reachedEnd, shouldOpenEndPopup, type EndPopupState } from "@/lib/endPopup";

const ready: EndPopupState = {
  mounted: true,
  hasCheck: true,
  done: false,
  dismissed: false,
  hash: "",
  arrivedAtCheck: false,
  checking: false,
  modalOpen: false,
};

describe("when the end-of-chapter popup opens", () => {
  it("opens for a hydrated, unread chapter with a check that was never asked about", () => {
    expect(shouldOpenEndPopup(ready)).toBe(true);
  });

  it.each([
    ["before hydration", { mounted: false }],
    ["on a chapter without a check", { hasCheck: false }],
    ["on a done chapter", { done: true }],
    ["after it was dismissed", { dismissed: true }],
    ["when the page was reached at the check", { arrivedAtCheck: true }],
    ["while the address says check", { hash: "#check" }],
    ["while a question is on screen", { checking: true }],
    ["while another dialog is open", { modalOpen: true }],
  ])("stays shut %s", (_label, change) => {
    expect(shouldOpenEndPopup({ ...ready, ...change })).toBe(false);
  });

  it("ignores any other hash", () => {
    expect(shouldOpenEndPopup({ ...ready, hash: "#chapters" })).toBe(true);
  });

  it("waits long enough that a fly-by scroll does not count", () => {
    expect(END_POPUP_DWELL_MS).toBeGreaterThanOrEqual(500);
  });
});

describe("keys the reader owns", () => {
  it("lists the shortcuts the dialog keeps from the page", () => {
    expect([...PLAIN_KEYS].sort()).toEqual(["/", "[", "]", "n", "p", "t"]);
  });
});

describe("having reached the end card", () => {
  it("counts the marker in view, and one already scrolled past when the page loaded that way", () => {
    expect(reachedEnd({ isIntersecting: true, top: 300 }, true)).toBe(true);
    expect(reachedEnd({ isIntersecting: true, top: 300 }, false)).toBe(true);
    expect(reachedEnd({ isIntersecting: false, top: -40 }, true)).toBe(true);
  });

  it("does not count the marker leaving through the top after it was seen", () => {
    expect(reachedEnd({ isIntersecting: false, top: -40 }, false)).toBe(false);
  });

  it("does not count the marker still below the fold", () => {
    expect(reachedEnd({ isIntersecting: false, top: 900 }, true)).toBe(false);
  });
});
