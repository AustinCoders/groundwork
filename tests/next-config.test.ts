import { describe, expect, it } from "vitest";
import nextConfig, { PINNED_OUTLINE_TOPIC_IDS, PINNED_PATH_TOPIC_IDS } from "../next.config";
import { outlineTopicIds, pathTopicIds } from "@/lib/topicIds";

describe("next.config redirects", () => {
  it("pins the same outline topic ids that outlineTopicIds() computes right now", () => {
    expect(new Set(PINNED_OUTLINE_TOPIC_IDS)).toEqual(new Set(outlineTopicIds()));
  });

  it("pins the same written topic ids that pathTopicIds() computes right now", () => {
    expect(new Set(PINNED_PATH_TOPIC_IDS)).toEqual(new Set(pathTopicIds()));
  });

  it("redirects /soon and /path for every pinned outline topic, to that topic's own cover", async () => {
    const redirects = await nextConfig.redirects?.();

    for (const source of ["/soon", "/path"]) {
      const redirect = (redirects ?? []).find((r) => r.source === source && r.destination === "/:topic");
      expect(redirect, `${source} has no outline redirect`).toBeTruthy();
      const value = redirect?.has?.[0] && "value" in redirect.has[0] ? redirect.has[0].value : undefined;
      for (const id of PINNED_OUTLINE_TOPIC_IDS) {
        expect(value, `${source}'s redirect does not match ${id}`).toMatch(new RegExp(`[>|]${id}[|)]`));
      }
    }
  });

  it("redirects /path with both a topic and a level to the static /path/<topic>/<level> route, only for a pinned written topic and level", async () => {
    const redirects = await nextConfig.redirects?.();
    const redirect = (redirects ?? []).find((r) => r.source === "/path" && r.destination === "/path/:topic/:level");
    expect(redirect, "/path has no topic+level redirect").toBeTruthy();
    expect(redirect?.has?.map((h) => "key" in h && h.key)).toEqual(["topic", "level"]);

    const topicValue = redirect?.has?.[0] && "value" in redirect.has[0] ? redirect.has[0].value : undefined;
    const levelValue = redirect?.has?.[1] && "value" in redirect.has[1] ? redirect.has[1].value : undefined;
    for (const id of PINNED_PATH_TOPIC_IDS) {
      expect(topicValue, `/path's topic+level redirect does not match ${id}`).toMatch(new RegExp(`[>|]${id}[|)]`));
    }
    expect(topicValue, "/path's topic+level redirect matches any string").not.toMatch(/\.\+/);
    for (const id of ["beginner", "intermediate", "advanced"]) {
      expect(levelValue, `/path's topic+level redirect does not match level ${id}`).toMatch(
        new RegExp(`[>|]${id}[|)]`)
      );
    }
    expect(levelValue, "/path's topic+level redirect matches any string").not.toMatch(/\.\+/);
  });
});
