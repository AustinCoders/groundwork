import { describe, expect, it } from "vitest";
import { nextChapter, requiresCheck, tickHref } from "@/lib/completion";

const chapters = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("tickHref", () => {
  it("is null when completion is read", () => {
    expect(tickHref("read", "/notes", "a")).toBeNull();
    expect(tickHref("read", "/notes", "a", true)).toBeNull();
  });

  it("is null when completion is not set", () => {
    expect(tickHref(undefined, "/notes", "a")).toBeNull();
    expect(tickHref(undefined, "/notes", "a", true)).toBeNull();
  });

  it("links to the check on the chapter's own page for a quiz topic", () => {
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", true)).toBe("#check");
  });

  it("links to the check on the chapter's page from elsewhere for a quiz topic", () => {
    expect(tickHref("quiz", "/dsa", "dsa-binary-search")).toBe("/dsa/dsa-binary-search#check");
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", false)).toBe("/dsa/dsa-binary-search#check");
  });

  it("is null for a read chapter in a quiz topic, so its toggle button stays", () => {
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", true, true)).toBeNull();
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", false, true)).toBeNull();
  });

  it("still links for an unread chapter in a quiz topic", () => {
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", true, false)).toBe("#check");
    expect(tickHref("quiz", "/dsa", "dsa-binary-search", false, false)).toBe("/dsa/dsa-binary-search#check");
  });

  it("is null for a read topic whatever the chapter's state", () => {
    expect(tickHref("read", "/notes", "a", false, true)).toBeNull();
    expect(tickHref(undefined, "/notes", "a", true, false)).toBeNull();
  });
});

describe("requiresCheck", () => {
  it("is true only for a quiz topic", () => {
    expect(requiresCheck("quiz")).toBe(true);
    expect(requiresCheck("read")).toBe(false);
    expect(requiresCheck(undefined)).toBe(false);
  });
});

describe("nextChapter", () => {
  it("returns the first unread chapter whatever the completion", () => {
    for (const completion of ["read", "quiz", undefined] as const) {
      expect(nextChapter(completion, chapters, new Set())).toBe(chapters[0]);
      expect(nextChapter(completion, chapters, new Set(["a"]))).toBe(chapters[1]);
      expect(nextChapter(completion, chapters, new Set(["a", "c"]))).toBe(chapters[1]);
      expect(nextChapter(completion, chapters, new Set(["b", "c"]))).toBe(chapters[0]);
    }
  });

  it("returns null when every chapter is read", () => {
    expect(nextChapter("read", chapters, new Set(["a", "b", "c"]))).toBeNull();
    expect(nextChapter("quiz", chapters, new Set(["a", "b", "c"]))).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(nextChapter("read", [], new Set())).toBeNull();
    expect(nextChapter("quiz", [], new Set(["a"]))).toBeNull();
  });

  it("keeps the caller's chapter type", () => {
    const rich = [{ id: "x", title: "X" }];
    expect(nextChapter(undefined, rich, new Set())?.title).toBe("X");
  });
});
