import { describe, expect, it } from "vitest";
import { NETWORK_HEAT_DAYS, leaderboard, networkCard, readFace, readOverview, weekCount } from "@/lib/account/network";
import { buildPublicCard } from "@/lib/profile/publicCard";

const face = {
  username: "ada-dev",
  name: "Ada",
  headline: "Frontend engineer",
  role: "frontend",
  color: "purple",
  art: "owl",
  level: 4,
  streak: 6,
  xp: 230,
  chapters: 30,
  exercises: 8,
  heat: [0, 0, 0, 1, 2, 0, 3],
  heatEnd: "2026-11-25",
  at: "2026-11-25T08:00:00Z",
  relation: "sent",
};

describe("reading a face from the server", () => {
  it("keeps a good one as it is", () => {
    const read = readFace(face);
    expect(read).toMatchObject({ username: "ada-dev", name: "Ada", color: "purple", art: "owl", relation: "sent" });
    expect(read?.heat).toEqual([0, 0, 0, 1, 2, 0, 3]);
  });

  it("drops a face with a bad username", () => {
    expect(readFace({ ...face, username: "Ada Dev" })).toBeNull();
    expect(readFace({ ...face, username: "-ada" })).toBeNull();
    expect(readFace({ ...face, username: "<script>" })).toBeNull();
    expect(readFace(null)).toBeNull();
    expect(readFace("ada")).toBeNull();
  });

  it("cleans every field it does not trust", () => {
    const read = readFace({
      ...face,
      name: "",
      headline: "a\u0000b".padEnd(200, "x"),
      role: "hacker",
      color: "url(evil)",
      art: "../../x",
      level: -4,
      streak: Number.NaN,
      xp: "lots",
      heat: [1, -2, "x", 500, ...Array(60).fill(1)],
      heatEnd: "yesterday",
      at: "not a date",
      relation: "owner",
    });
    expect(read).not.toBeNull();
    expect(read?.name).toBe("ada-dev");
    expect(read?.headline).toHaveLength(80);
    expect(read?.headline.includes("\u0000")).toBe(false);
    expect(read?.role).toBeNull();
    expect(read?.color).toBe("blue");
    expect(read?.art).toBe("");
    expect(read?.level).toBe(1);
    expect(read?.streak).toBe(0);
    expect(read?.xp).toBe(0);
    expect(read?.heat).toHaveLength(NETWORK_HEAT_DAYS);
    expect(read?.heatEnd).toBe("");
    expect(read?.at).toBeNull();
    expect(read?.relation).toBeNull();
  });
});

describe("reading the overview", () => {
  it("survives an empty or broken answer", () => {
    const empty = readOverview(null);
    expect(empty.me.on).toBe(false);
    expect(empty.me.discoverable).toBe(true);
    expect(empty.connections).toEqual([]);
    expect(readOverview({ connections: "nope", cheers: [{ kind: "kiss", username: "ada-dev" }] }).cheers).toEqual([]);
  });

  it("keeps good rows and drops bad ones", () => {
    const view = readOverview({
      me: { on: true, discoverable: false, username: "me-me", at: "2026-11-25T08:00:00Z" },
      connections: [face, { ...face, username: "BAD" }],
      incoming: [face],
      outgoing: [{ username: "bob", name: "Bob", since: "2026-11-24T08:00:00Z" }, { username: "!!" }],
      blocked: [{ username: "eve", name: "Eve" }],
      cheers: [
        { username: "bob", name: "Bob", kind: "clap", at: "2026-11-25T07:00:00Z", seen: false },
        { username: "bob", name: "Bob", kind: "clap", at: "never" },
      ],
    });
    expect(view.me).toEqual({ on: true, discoverable: false, username: "me-me", at: "2026-11-25T08:00:00Z" });
    expect(view.connections.map((f) => f.username)).toEqual(["ada-dev"]);
    expect(view.outgoing.map((o) => o.username)).toEqual(["bob"]);
    expect(view.blocked).toEqual([{ username: "eve", name: "Eve" }]);
    expect(view.cheers).toHaveLength(1);
  });
});

describe("the weekly board", () => {
  it("counts the last seven days that are still this week", () => {
    expect(weekCount(face, "2026-11-25")).toBe(6);
    expect(weekCount(face, "2026-11-27")).toBe(6);
    expect(weekCount(face, "2026-11-29")).toBe(5);
    expect(weekCount(face, "2026-12-02")).toBe(0);
    expect(weekCount({ heat: [5], heatEnd: "" }, "2026-11-25")).toBe(0);
  });

  it("ranks by this week, then streak, then level, with me in it", () => {
    const quiet = readFace({ ...face, username: "quiet", name: "Quiet", heat: [0], streak: 50 })!;
    const busy = readFace({ ...face, username: "busy", name: "Busy", heat: [9, 9], streak: 1 })!;
    const twin = readFace({ ...face, username: "twin", name: "Twin", heat: [9, 9], streak: 2 })!;
    const rows = leaderboard(
      { username: "me-me", name: "You", week: 10, streak: 3, level: 2, me: true },
      [quiet, busy, twin],
      "2026-11-25"
    );
    expect(rows.map((r) => r.username)).toEqual(["twin", "busy", "me-me", "quiet"]);
    expect(rows.find((r) => r.me)?.name).toBe("You");
  });
});

describe("the connections card", () => {
  it("leaves out links, location, badges, topics and most of the calendar", () => {
    const card = buildPublicCard({
      name: "Ada",
      headline: "Frontend engineer",
      location: "Pune",
      github: "ada",
      linkedin: "https://www.linkedin.com/in/ada-l",
      website: "https://ada.dev",
      color: "purple",
      art: "owl",
      role: "frontend",
      stats: { level: 4, xp: 230, streak: 6, bestStreak: 11, chaptersRead: 30, exercisesSolved: 8 },
      badges: ["first-solve"],
      topics: [{ id: "react", name: "React", mark: "⚛", pct: 40 }],
      activity: { "2026-11-25": 3 },
      today: "2026-11-25",
    });
    const slim = networkCard(card);
    for (const key of ["location", "github", "linkedin", "website", "badges", "topics", "bestStreak"]) {
      expect(slim).not.toHaveProperty(key);
    }
    expect(slim.heat).toHaveLength(NETWORK_HEAT_DAYS);
    expect(slim.heat[NETWORK_HEAT_DAYS - 1]).toBe(3);
    expect(readFace({ ...slim, username: "ada-dev" })?.level).toBe(4);
  });
});
