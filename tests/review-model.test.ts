import { describe, expect, it } from "vitest";
import {
  agoLabel,
  buildRows,
  dayHeading,
  DAY,
  forecast,
  gapLabel,
  GAP_LABELS,
  groupByDay,
  lateness,
  minutesFor,
  shortGap,
  startOfDay,
  whenLabel,
  type ReviewChapter,
} from "@/app/review/reviewModel";
import { REVIEW_GAPS_DAYS } from "@/lib/storage";

const NOON = new Date(2026, 9, 11, 12, 0, 0).getTime();

const chapter = (id: string): ReviewChapter => ({
  id,
  num: id.toUpperCase(),
  title: `Title ${id}`,
  subtitle: "",
  topicName: "JavaScript",
  href: `/notes/${id}`,
});

const CHAPTERS = ["a", "b", "c", "d", "e"].map(chapter);

describe("the review model", () => {
  it("labels every gap in words and in short form", () => {
    expect(GAP_LABELS).toEqual(["3 days", "1 week", "3 weeks", "2 months", "6 months"]);
    expect(GAP_LABELS).toHaveLength(REVIEW_GAPS_DAYS.length);
    expect(REVIEW_GAPS_DAYS.map(shortGap)).toEqual(["3d", "1w", "3w", "2mo", "6mo"]);
    expect(gapLabel(1)).toBe("1 day");
  });

  it("says how late a chapter is and when the next one is back", () => {
    expect(lateness(NOON, NOON)).toBe("due today");
    expect(lateness(NOON - DAY, NOON)).toBe("1 day overdue");
    expect(lateness(NOON - 4 * DAY, NOON)).toBe("4 days overdue");
    expect(whenLabel(NOON, NOON)).toBe("today");
    expect(whenLabel(NOON + DAY, NOON)).toBe("tomorrow");
    expect(dayHeading(startOfDay(NOON), NOON)).toBe("Today");
    expect(dayHeading(startOfDay(NOON + DAY), NOON)).toBe("Tomorrow");
  });

  it("says how long ago a review was", () => {
    expect(agoLabel(NOON, NOON)).toBe("today");
    expect(agoLabel(NOON - DAY, NOON)).toBe("yesterday");
    expect(agoLabel(NOON - 5 * DAY, NOON)).toBe("5 days ago");
    expect(agoLabel(NOON - 21 * DAY, NOON)).toBe("3 weeks ago");
    expect(agoLabel(NOON - 90 * DAY, NOON)).toBe("3 months ago");
  });

  it("splits read chapters into due, upcoming, kept and reviewed", () => {
    const marks = {
      a: { at: NOON - 5 * DAY, reviews: 0 },
      b: { at: NOON - 2 * DAY, reviews: 0 },
      c: { at: NOON - 30 * DAY, reviews: 5 },
      d: { at: NOON - 8 * DAY, reviews: 1 },
    };
    const model = buildRows(CHAPTERS, marks, NOON);
    expect(model.rows).toHaveLength(4);
    expect(model.due.map((r) => r.ch.id)).toEqual(["a", "d"]);
    expect(model.upcoming.map((r) => r.ch.id)).toEqual(["b"]);
    expect(model.kept).toBe(1);
    expect(model.reviewed.map((r) => r.ch.id)).toEqual(["d", "c"]);
  });

  it("treats a chapter marked read the old way as due today, never decades overdue", () => {
    const model = buildRows(CHAPTERS, { a: true }, NOON);
    expect(model.due.map((r) => r.ch.id)).toEqual(["a"]);
    expect(lateness(model.due[0].due!, NOON)).toBe("due today");
  });

  it("words a very old due date as over a year overdue instead of a day count", () => {
    expect(lateness(NOON - 400 * DAY, NOON)).toBe("over a year overdue");
    expect(lateness(NOON - 20 * DAY, NOON)).toBe("20 days overdue");
  });

  it("groups upcoming rows by the day they come back", () => {
    const marks = {
      a: { at: NOON - 2 * DAY, reviews: 0 },
      b: { at: NOON - 2 * DAY + 3600_000, reviews: 0 },
      c: { at: NOON - DAY, reviews: 0 },
    };
    const { upcoming } = buildRows(CHAPTERS, marks, NOON);
    const days = groupByDay(upcoming);
    expect(days.map((d) => d.rows.map((r) => r.ch.id))).toEqual([["a", "b"], ["c"]]);
    expect(days[0].start).toBeLessThan(days[1].start);
  });

  it("forecasts two weeks with the due count today and the rest on their day", () => {
    const marks = { a: { at: NOON - DAY, reviews: 0 }, b: { at: NOON, reviews: 1 } };
    const { upcoming } = buildRows(CHAPTERS, marks, NOON);
    const days = forecast(3, upcoming, NOON);
    expect(days).toHaveLength(14);
    expect(days[0].n).toBe(3);
    expect(days[2].n).toBe(1);
    expect(days[7].n).toBe(1);
    expect(days.reduce((n, d) => n + d.n, 0)).toBe(5);
  });

  it("budgets about three minutes a chapter and at least two", () => {
    expect(minutesFor(1)).toBe(3);
    expect(minutesFor(0)).toBe(2);
    expect(minutesFor(5)).toBe(15);
  });
});
