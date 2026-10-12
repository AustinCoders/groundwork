import { describe, expect, it } from "vitest";
import { achieved, demoReducer, START, type Action, type Demo } from "@/components/home/howState";

const play = (...actions: Action[]): Demo => actions.reduce(demoReducer, START);

describe("the how-it-works demo state", () => {
  it("starts with nothing tried", () => {
    expect(achieved(START)).toEqual([false, false, false, false]);
    expect(START.variant).toBe("shared");
  });

  it("counts a read step after two different lines, and opens one line at a time", () => {
    const one = play({ type: "open", line: 0 });
    expect(one.open).toBe(0);
    expect(achieved(one)[0]).toBe(false);
    const two = demoReducer(one, { type: "open", line: 2 });
    expect(two.open).toBe(2);
    expect(achieved(two)[0]).toBe(true);
  });

  it("closes a line that is tapped again but remembers that it was seen", () => {
    const closed = play({ type: "open", line: 1 }, { type: "open", line: 1 });
    expect(closed.open).toBeNull();
    expect(closed.seen).toEqual([1]);
  });

  it("counts a run step only after a failing run and then a fully passing run", () => {
    const passFirst = play({ type: "pick", variant: "closure" }, { type: "run" });
    expect(passFirst.report?.ok).toBe(true);
    expect(achieved(passFirst)[1]).toBe(false);
    const failed = play({ type: "run" });
    expect(failed.report?.ok).toBe(false);
    expect(failed.failed).toBe(true);
    expect(achieved(failed)[1]).toBe(false);
    const repair: Action[] = [{ type: "pick", variant: "closure" }, { type: "run" }];
    const fixed = repair.reduce(demoReducer, failed);
    expect(fixed.report).toMatchObject({ passed: 3, total: 3 });
    expect(achieved(fixed)[1]).toBe(true);
  });

  it("clears the report when another version is picked, and keeps it when the same one is picked again", () => {
    const ran = play({ type: "run" });
    expect(demoReducer(ran, { type: "pick", variant: "shared" })).toBe(ran);
    expect(demoReducer(ran, { type: "pick", variant: "offByOne" }).report).toBeNull();
  });

  it("running twice gives the same report", () => {
    const first = play({ type: "run" });
    expect(demoReducer(first, { type: "run" }).report).toEqual(first.report);
  });

  it("counts an answer of any option and a marked day", () => {
    expect(achieved(play({ type: "answer", option: "three" }))[2]).toBe(true);
    expect(achieved(play({ type: "mark", today: new Date(2026, 9, 9) }))[3]).toBe(true);
  });

  it("returns to the start on reset", () => {
    const busy = play(
      { type: "open", line: 0 },
      { type: "run" },
      { type: "answer", option: "one" },
      { type: "mark", today: new Date(2026, 9, 9) }
    );
    expect(achieved(busy)).toEqual([false, false, true, true]);
    expect(demoReducer(busy, { type: "reset" })).toEqual(START);
  });
});
