import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { config, proxy } from "@/proxy";
import { canonicalPath } from "@/lib/pinnedRoutes";

function run(path: string) {
  const response = proxy(new NextRequest(`http://localhost:3000${path}`));
  return { status: response.status, location: response.headers.get("location") };
}

describe("the canonical path", () => {
  it("lower-cases and drops trailing slashes", () => {
    expect(canonicalPath("/DSA/DSA-HASHING")).toBe("/dsa/dsa-hashing");
    expect(canonicalPath("/react/")).toBe("/react");
    expect(canonicalPath("/react//")).toBe("/react");
    expect(canonicalPath("/")).toBe("/");
  });

  it("sends a bare quiz topic straight to its level page", () => {
    expect(canonicalPath("/dsa/")).toBe("/level/dsa");
    expect(canonicalPath("/DSA")).toBe("/level/dsa");
    expect(canonicalPath("/react")).toBe("/react");
  });
});

describe("the proxy", () => {
  it("redirects an upper-case chapter address to the real one in one hop, keeping the query", () => {
    expect(run("/dsa/DSA-HASHING?from=menu")).toEqual({
      status: 308,
      location: "http://localhost:3000/dsa/dsa-hashing?from=menu",
    });
  });

  it("redirects /dsa/ to the level page in one hop", () => {
    expect(run("/dsa/")).toEqual({ status: 308, location: "http://localhost:3000/level/dsa" });
  });

  it("lets a canonical address through", () => {
    expect(run("/dsa/dsa-hashing").status).toBe(200);
    expect(run("/").status).toBe(200);
  });

  it("only runs on addresses with a capital or a trailing slash, and never on assets or the api", () => {
    const matcher = new RegExp(`^${String(config.matcher[0]).replace(/^\/\(/, "/(")}$`);
    expect(matcher.test("/dsa/DSA-HASHING")).toBe(true);
    expect(matcher.test("/dsa/")).toBe(true);
    expect(matcher.test("/dsa/dsa-hashing")).toBe(false);
    expect(matcher.test("/_next/static/Chunk.js")).toBe(false);
    expect(matcher.test("/api/Joke")).toBe(false);
  });
});
