import { describe, expect, it } from "vitest";
import { reviewNote } from "@/lib/reviewNote";

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;

describe("the review note after a pass", () => {
  it("says 3 days for a mark made just now", () => {
    expect(reviewNote({ at: NOW - 40, reviews: 0 }, NOW)).toBe("It comes back for review in 3 days.");
  });

  it("counts from the original read time, so an old mark with no reviews is due now", () => {
    expect(reviewNote({ at: NOW - 10 * DAY, reviews: 0 }, NOW)).toBe("It is due for review now.");
  });

  it("counts the days left of a longer gap", () => {
    expect(reviewNote({ at: NOW - 10 * DAY, reviews: 2 }, NOW)).toBe("It comes back for review in 11 days.");
  });

  it("uses the singular for the last day", () => {
    expect(reviewNote({ at: NOW - 2 * DAY, reviews: 0 }, NOW)).toBe("It comes back for review in 1 day.");
  });

  it("is due now when the gap ends exactly now", () => {
    expect(reviewNote({ at: NOW - 3 * DAY, reviews: 0 }, NOW)).toBe("It is due for review now.");
  });

  it("treats a bare true mark as read long ago", () => {
    expect(reviewNote(true, NOW)).toBe("It is due for review now.");
  });

  it("says nothing when every review is done or there is no mark", () => {
    expect(reviewNote({ at: NOW, reviews: 5 }, NOW)).toBeNull();
    expect(reviewNote(undefined, NOW)).toBeNull();
  });
});
