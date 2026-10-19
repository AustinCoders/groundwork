import { describe, expect, it } from "vitest";
import { cleanedRecently, pushesSomething, runIdFrom } from "../scripts/pre-push-cleanup.mjs";

const SHA = "a".repeat(40);
const ZERO = "0".repeat(40);

describe("the push hook that prunes Vercel deployments first", () => {
  it("runs for a normal push and for a new branch", () => {
    expect(pushesSomething(`refs/heads/main ${SHA} refs/heads/main ${SHA}\n`)).toBe(true);
    expect(pushesSomething(`refs/heads/new ${SHA} refs/heads/new ${ZERO}\n`)).toBe(true);
  });

  it("does not run when a push only deletes a branch, or when there is nothing to push", () => {
    expect(pushesSomething(`(delete) ${ZERO} refs/heads/old ${SHA}\n`)).toBe(false);
    expect(pushesSomething("")).toBe(false);
    expect(pushesSomething("\n")).toBe(false);
  });

  it("runs when one of several refs pushes something", () => {
    const stdin = `(delete) ${ZERO} refs/heads/old ${SHA}\nrefs/heads/main ${SHA} refs/heads/main ${SHA}\n`;
    expect(pushesSomething(stdin)).toBe(true);
  });

  const now = Date.parse("2026-10-19T12:00:00Z");
  const run = (minutesAgo: number, extra: Record<string, string> = {}) => ({
    status: "completed",
    conclusion: "success",
    displayTitle: "Vercel deployment cleanup",
    createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
    ...extra,
  });

  it("skips a second cleanup right after a successful one", () => {
    expect(cleanedRecently([run(5)], now)).toBe(true);
    expect(cleanedRecently([run(19)], now, 20)).toBe(true);
  });

  it("cleans again once the last real run is old, failed, still running or only a dry run", () => {
    expect(cleanedRecently([run(45)], now, 20)).toBe(false);
    expect(cleanedRecently([run(5, { conclusion: "failure" })], now)).toBe(false);
    expect(cleanedRecently([run(5, { status: "in_progress", conclusion: "" })], now)).toBe(false);
    expect(cleanedRecently([run(5, { displayTitle: "Vercel deployment cleanup (dry run)" })], now)).toBe(false);
    expect(cleanedRecently([], now)).toBe(false);
  });

  it("reads the run id from what gh prints after dispatching", () => {
    expect(runIdFrom("https://github.com/AustinCoders/groundwork/actions/runs/39199508890\n")).toBe("39199508890");
    expect(runIdFrom("could not create a workflow dispatch event")).toBeNull();
  });
});
