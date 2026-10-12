import { describe, expect, it } from "vitest";
import { bookRounds } from "@/lib/interviewBook";
import { topicsNavWithStats } from "@/lib/topicStats";
import { TRAIL_SPOTS } from "@/lib/trail";
import { HOME_PATHS, leadStop, PATH_COUNT, pathStops, startOf, type JourneyStep, type PathCard } from "@/lib/homePaths";

function unresolvedSteps(paths: typeof HOME_PATHS, topicIds: Iterable<string>, links: Iterable<string>): string[] {
  const topics = new Set(topicIds);
  const pages = new Set(links);
  return paths.flatMap((path) =>
    path.steps.flatMap((step) => {
      if ("topic" in step) return topics.has(step.topic) ? [] : [`${path.tag}: topic ${step.topic}`];
      return pages.has(step.href) ? [] : [`${path.tag}: ${step.href}`];
    })
  );
}

const card = (id: string, written: boolean, extra: Partial<PathCard> = {}): PathCard => ({
  id,
  name: id.toUpperCase(),
  mark: id.slice(0, 2),
  accent: "blue",
  href: `/${id}`,
  chapters: written ? 4 : 0,
  exercises: written ? 9 : 0,
  minutes: 90,
  ...extra,
});

describe("hard-coded path steps", () => {
  it("name only topics that exist and rounds that the interview book really has", () => {
    const topics = topicsNavWithStats().map((topic) => topic.id);
    const links = bookRounds().map((round) => `/interview/${round.id}`);
    expect(unresolvedSteps(HOME_PATHS, topics, links)).toEqual([]);
  });

  it("reports a topic id and an interview href that do not resolve", () => {
    const paths = [
      {
        ...HOME_PATHS[0],
        steps: [{ topic: "nope" }, { label: "L", mark: "R9", href: "/interview/none", sub: "s", tone: "red" }],
      },
    ];
    expect(unresolvedSteps(paths, ["js"], ["/interview/r4"])).toEqual([
      `${HOME_PATHS[0].tag}: topic nope`,
      `${HOME_PATHS[0].tag}: /interview/none`,
    ]);
  });

  it("counts the paths", () => {
    expect(PATH_COUNT).toBe(HOME_PATHS.length);
  });
});

describe("pathStops", () => {
  const steps: JourneyStep[] = [
    { topic: "later" },
    { topic: "first" },
    { topic: "missing" },
    { label: "Round", mark: "R4", href: "/interview/r4", sub: "interview round", tone: "red" },
  ];
  const ready = [card("first", true)];
  const soon = [card("later", false)];

  it("keeps known topics and rounds in order, drops unknown topics and marks what is written", () => {
    const stops = pathStops(steps, ready, soon);
    expect(stops.map((stop) => stop.name)).toEqual(["LATER", "FIRST", "Round"]);
    expect(stops.map((stop) => stop.written)).toEqual([false, true, false]);
    expect(stops[0]).toMatchObject({ sub: "soon", href: null });
    expect(stops[1]).toMatchObject({ sub: "4 chapters", chapters: 4, exercises: 9 });
  });

  it("never returns more stops than the trail has places", () => {
    const many: JourneyStep[] = Array.from({ length: TRAIL_SPOTS.length + 3 }, () => ({ topic: "first" }));
    expect(pathStops(many, ready, soon)).toHaveLength(TRAIL_SPOTS.length);
  });

  it("finds the lead stop as the first written topic, not by its label", () => {
    const stops = pathStops(steps, ready, soon);
    expect(leadStop(stops)?.name).toBe("FIRST");
    expect(leadStop(pathStops([{ topic: "later" }], ready, soon))).toBeUndefined();
  });

  it("starts at the first stop when it is open and otherwise names the stop it starts with", () => {
    const stops = pathStops(steps, ready, soon);
    expect(startOf(stops)).toMatchObject({ label: "Start with FIRST" });
    expect(startOf(pathStops([{ topic: "first" }, { topic: "later" }], ready, soon))?.label).toBe("Start this path");
    expect(startOf(pathStops([{ topic: "later" }], ready, soon))).toBeNull();
  });

  it("builds every real path from the real shelf without a gap", () => {
    const all = topicsNavWithStats().map((topic) =>
      card(topic.id, topic.written > 0, { chapters: topic.written, href: `/${topic.id}` })
    );
    for (const path of HOME_PATHS) {
      const stops = pathStops(
        path.steps,
        all.filter((c) => c.chapters > 0),
        all.filter((c) => c.chapters === 0)
      );
      expect(stops.length, path.tag).toBe(path.steps.length);
    }
  });
});
