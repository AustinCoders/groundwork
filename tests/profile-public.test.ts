import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { describeDevice } from "@/lib/account/device";
import { readActivity } from "@/lib/account/security";
import { fetchPublicProfile } from "@/lib/profile/fetchPublic";
import {
  HEAT_DAYS,
  buildPublicCard,
  safeLinkedin,
  safeWebsite,
  sanitizePublicCard,
  usernameProblem,
} from "@/lib/profile/publicCard";
import { cardIsStale } from "@/lib/profile/cardNow";

const source = {
  name: "Ada Lovelace",
  headline: "Frontend engineer",
  location: "Pune",
  github: "ada",
  linkedin: "https://www.linkedin.com/in/ada-l",
  website: "https://ada.dev",
  color: "purple",
  art: "owl",
  role: "frontend",
  stats: { level: 4, xp: 230, streak: 6, bestStreak: 11, chaptersRead: 30, exercisesSolved: 8 },
  badges: ["first-solve", "solve-10"],
  topics: [
    { id: "react", name: "React", mark: "⚛", pct: 40 },
    { id: "js", name: "JavaScript", mark: "JS", pct: 75 },
    { id: "go", name: "Go", mark: "Go", pct: 0 },
  ],
  activity: { "2026-11-25": 3, "2026-11-20": 1, "2025-01-01": 9 },
  today: "2026-11-25",
};

describe("usernames", () => {
  it("accepts a good one and explains every bad one", () => {
    expect(usernameProblem("ada-dev")).toBeNull();
    expect(usernameProblem("")).toMatch(/Choose/);
    expect(usernameProblem("ab")).toMatch(/at least 3/);
    expect(usernameProblem("a".repeat(31))).toMatch(/30/);
    expect(usernameProblem("Ada Dev")).toMatch(/lowercase/);
    expect(usernameProblem("-ada")).toMatch(/Start and end/);
    expect(usernameProblem("ada--dev")).toMatch(/one hyphen/);
    expect(usernameProblem("admin")).toMatch(/reserved/);
  });
});

describe("the public card", () => {
  it("builds the six-month calendar ending today and drops topics with no progress", () => {
    const card = buildPublicCard(source);
    expect(card.heat).toHaveLength(HEAT_DAYS);
    expect(card.heat[HEAT_DAYS - 1]).toBe(3);
    expect(card.heat[HEAT_DAYS - 6]).toBe(1);
    expect(card.heat.reduce((a, b) => a + b, 0)).toBe(4);
    expect(card.topics.map((t) => t.id)).toEqual(["js", "react"]);
    expect(card.heatEnd).toBe("2026-11-25");
  });

  it("never carries an email or a photo", () => {
    const text = JSON.stringify(buildPublicCard(source));
    expect(text).not.toMatch(/@|avatarPath|photo|email/);
  });

  it("refuses or cleans what a user could forge", () => {
    expect(sanitizePublicCard(null)).toBeNull();
    expect(sanitizePublicCard({ v: 2, name: "x" })).toBeNull();
    expect(sanitizePublicCard({ v: 1, name: "  " })).toBeNull();
    const card = sanitizePublicCard({
      v: 1,
      name: "Eve\u0000<script>",
      website: "javascript:alert(1)",
      linkedin: "https://evil.example/in/eve",
      github: "eve/../../x",
      color: "neon",
      art: "dragon",
      role: "hacker",
      level: -5,
      xp: Infinity,
      streak: 1e12,
      badges: ["first-solve", "<img>", "first-solve"],
      topics: [
        { id: "BAD ID", name: "x", pct: 50 },
        { id: "react", name: "React", mark: "⚛", pct: 900 },
      ],
      heat: [1, -4, "x", 500],
      heatEnd: "yesterday",
    });
    expect(card).not.toBeNull();
    expect(card!.name).toBe("Eve <script>");
    expect(card!.website).toBe("");
    expect(card!.linkedin).toBe("");
    expect(card!.github).toBe("");
    expect(card!.color).toBe("blue");
    expect(card!.art).toBe("");
    expect(card!.role).toBeNull();
    expect(card!.level).toBe(1);
    expect(card!.xp).toBe(0);
    expect(card!.streak).toBe(100000);
    expect(card!.badges).toEqual(["first-solve"]);
    expect(card!.topics).toEqual([{ id: "react", name: "React", mark: "⚛", pct: 100 }]);
    expect(card!.heat).toEqual([1, 0, 0, 99]);
    expect(card!.heatEnd).toBe("");
  });

  it("only links to web addresses and real LinkedIn profiles", () => {
    expect(safeWebsite("https://ada.dev/")).toBe("https://ada.dev/");
    expect(safeWebsite("ftp://ada.dev")).toBeNull();
    expect(safeWebsite("https://user:pass@ada.dev")).toBeNull();
    expect(safeLinkedin("https://in.linkedin.com/in/ada")).not.toBeNull();
    expect(safeLinkedin("https://linkedin.com.evil.io/in/ada")).toBeNull();
  });

  it("is refreshed after six hours", () => {
    const now = Date.parse("2026-11-25T12:00:00Z");
    expect(cardIsStale(null, now)).toBe(true);
    expect(cardIsStale("2026-11-25T10:00:00Z", now)).toBe(false);
    expect(cardIsStale("2026-11-25T05:00:00Z", now)).toBe(true);
    expect(cardIsStale("nonsense", now)).toBe(true);
  });
});

describe("fetching a public profile on the server", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("never asks the database about a name that cannot exist", async () => {
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect(await fetchPublicProfile("../admin")).toBeNull();
    expect(await fetchPublicProfile("A")).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns a cleaned card for a public profile", async () => {
    const card = buildPublicCard(source);
    const spy = vi.fn(async () => Response.json({ username: "ada-dev", card, at: "2026-11-25T10:00:00Z" }));
    vi.stubGlobal("fetch", spy);
    const found = await fetchPublicProfile("Ada-Dev");
    expect(found?.username).toBe("ada-dev");
    expect(found?.card.name).toBe("Ada Lovelace");
    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.supabase.co/rest/v1/rpc/public_profile");
    expect(JSON.parse(init.body as string)).toEqual({ name: "ada-dev" });
  });

  it("is not found when the profile is private, missing or the database fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(null))
    );
    expect(await fetchPublicProfile("ghost-1")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ username: "someone-else", card: {} }))
    );
    expect(await fetchPublicProfile("ghost-2")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no", { status: 500 }))
    );
    expect(await fetchPublicProfile("ghost-3")).toBeNull();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("down")))
    );
    expect(await fetchPublicProfile("ghost-4")).toBeNull();
  });
});

describe("devices and sign-in activity", () => {
  it("names common browsers and systems", () => {
    expect(
      describeDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36")
    ).toEqual({
      browser: "Chrome",
      os: "Mac",
      kind: "computer",
    });
    expect(
      describeDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari/604.1")
    ).toMatchObject({
      browser: "Safari",
      os: "iPhone",
      kind: "phone",
    });
    expect(describeDevice("Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/131 Edg/131").browser).toBe("Edge");
    expect(describeDevice("Mozilla/5.0 (Linux; Android 14) Firefox/130 Mobile").os).toBe("Android");
    expect(describeDevice(null).kind).toBe("unknown");
  });

  it("reads activity and marks this device", () => {
    const activity = readActivity({
      current: "s1",
      sessions: [
        {
          id: "s1",
          created_at: "2026-11-25T10:00:00Z",
          seen_at: "2026-11-25T11:00:00Z",
          ip: "203.0.113.7",
          agent: "x",
          aal: "aal2",
        },
        { id: "s2", created_at: "2026-11-20T10:00:00Z", ip: null, agent: null, aal: "aal1" },
        { id: "", created_at: "bad" },
      ],
      events: [
        { at: "2026-11-25T10:00:00Z", kind: "sign_in", ip: "203.0.113.7" },
        { at: "2026-11-24T10:00:00Z", kind: "drop_tables" },
      ],
    });
    expect(activity.sessions.map((s) => [s.id, s.current, s.twoStep])).toEqual([
      ["s1", true, true],
      ["s2", false, false],
    ]);
    expect(activity.sessions[1].seenAt).toBe("2026-11-20T10:00:00Z");
    expect(activity.events.map((e) => e.kind)).toEqual(["sign_in"]);
    expect(readActivity("nope")).toEqual({ sessions: [], events: [] });
  });
});
