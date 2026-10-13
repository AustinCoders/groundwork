import { describe, expect, it } from "vitest";
import { practice } from "@/content/practice";
import { assert } from "@/lib/assertKit";

const exercise = practice.find((entry) => entry.id === "ex-binary-search-classic")!;

function failures(source: string): string[] {
  const run = new Function(`${source}\nreturn binarySearch;`)() as unknown;
  return exercise.tests
    .filter((test) => {
      try {
        new Function("binarySearch", "assert", test.body)(run, assert);
        return false;
      } catch {
        return true;
      }
    })
    .map((test) => test.name);
}

const LINEAR_SCAN = `function binarySearch(nums, target) {
  for (let i = 0; i < nums.length; i++) if (nums[i] === target) return i;
  return -1;
}`;

const BUILT_IN_SEARCH = `function binarySearch(nums, target) {
  return nums.indexOf(target);
}`;

const SPREAD_COPY = `function binarySearch(nums, target) {
  return [...nums].findIndex((value) => value === target);
}`;

describe("ex-binary-search-classic", () => {
  it("passes every test with the reference solution", () => {
    expect(failures(exercise.solution)).toEqual([]);
  });

  it("fails a linear scan, even though it returns the right answers", () => {
    const failed = failures(LINEAR_SCAN);
    expect(failed).toEqual(["looks at only a handful of elements, so a linear scan fails"]);
  });

  it("fails the other ways of touching every element", () => {
    expect(failures(BUILT_IN_SEARCH)).toHaveLength(1);
    expect(failures(SPREAD_COPY)).toHaveLength(1);
  });

  it("accepts a binary search that reads a few neighbours per step", () => {
    const wasteful = `function binarySearch(nums, target) {
      let lo = 0, hi = nums.length - 1;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target && nums[mid + 1] !== undefined) lo = mid + 1;
        else if (nums[mid] > target) hi = mid - 1;
        else return -1;
      }
      return -1;
    }`;
    expect(failures(wasteful)).toEqual([]);
  });
});
