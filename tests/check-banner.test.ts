import { describe, expect, it } from "vitest";
import { SAME_GESTURE_MS, arrivedAtCheck, passBannerText, sameGesture, startedMessage } from "@/lib/checkBanner";
import { isPlainPrimaryClick } from "@/lib/checkOpen";
import { passMark } from "@/lib/checkDraw";

describe("the banner a tick opens the check with", () => {
  it("states the real pass mark and question count", () => {
    expect(passBannerText(4, 5)).toBe("Pass the check, 4 of 5 right, and this chapter is marked read.");
    expect(passBannerText(3, 4)).toBe("Pass the check, 3 of 4 right, and this chapter is marked read.");
  });

  it("announces the same numbers when the check starts", () => {
    expect(startedMessage(4, 5)).toBe("Check started. Answer 4 of 5 correctly to mark this chapter read.");
  });

  it("agrees with the pass rule", () => {
    expect(passBannerText(passMark(5), 5)).toContain("4 of 5");
  });
});

describe("arriving at a chapter's check", () => {
  it("recognises only the check hash", () => {
    expect(arrivedAtCheck("#check")).toBe(true);
    expect(arrivedAtCheck("")).toBe(false);
    expect(arrivedAtCheck("#checking")).toBe(false);
    expect(arrivedAtCheck("#binary-search")).toBe(false);
    expect(arrivedAtCheck("check")).toBe(false);
  });
});

describe("the hash change that follows a tick's own click", () => {
  it("is the same gesture only shortly after an open", () => {
    expect(sameGesture(1000 + SAME_GESTURE_MS - 1, 1000)).toBe(true);
    expect(sameGesture(1000 + SAME_GESTURE_MS, 1000)).toBe(false);
  });

  it("is never the same gesture when nothing has opened yet", () => {
    expect(sameGesture(10, 0)).toBe(false);
  });
});

describe("which clicks on a tick open the check", () => {
  const plain = { button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

  it("accepts a plain primary click", () => {
    expect(isPlainPrimaryClick(plain)).toBe(true);
  });

  it("rejects every modifier, a non-primary button and a prevented click", () => {
    for (const change of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
      { button: 2 },
      { defaultPrevented: true },
    ]) {
      expect(isPlainPrimaryClick({ ...plain, ...change }), JSON.stringify(change)).toBe(false);
    }
  });
});
