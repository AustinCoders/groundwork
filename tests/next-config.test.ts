import { describe, expect, it } from "vitest";
import nextConfig, { PINNED_OUTLINE_TOPIC_IDS } from "../next.config";
import { outlineTopicIds } from "@/lib/topicIds";

describe("next.config redirects", () => {
  it("pins the same outline topic ids that outlineTopicIds() computes right now", () => {
    expect(new Set(PINNED_OUTLINE_TOPIC_IDS)).toEqual(new Set(outlineTopicIds()));
  });

  it("redirects /soon and /path for every pinned outline topic, to that topic's own cover", async () => {
    const redirects = await nextConfig.redirects?.();
    const bySource = new Map((redirects ?? []).map((r) => [r.source, r]));

    for (const source of ["/soon", "/path"]) {
      const redirect = bySource.get(source);
      expect(redirect, `${source} has no outline redirect`).toBeTruthy();
      expect(redirect?.destination).toBe("/:topic");
      const value = redirect?.has?.[0] && "value" in redirect.has[0] ? redirect.has[0].value : undefined;
      for (const id of PINNED_OUTLINE_TOPIC_IDS) {
        expect(value, `${source}'s redirect does not match ${id}`).toMatch(new RegExp(`[>|]${id}[|)]`));
      }
    }
  });
});
