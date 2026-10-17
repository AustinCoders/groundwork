import { describe, expect, it } from "vitest";
import { ROADMAPS } from "@/content/roadmaps";
import { chapterMetas, topic } from "@/lib/content";
import { bookRound, bookRounds } from "@/lib/interviewBook";
import { roadmap, roadmapIds, roadmaps } from "@/lib/roadmap";
import { topicStats } from "@/lib/topicStats";

const built = roadmaps();
const steps = (id: string) => roadmap(id)!.stages.flatMap((stage) => stage.steps);

describe("the roadmap sources", () => {
  it("has at least four roadmaps with unique kebab-case ids", () => {
    expect(ROADMAPS.length).toBeGreaterThanOrEqual(4);
    const ids = ROADMAPS.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it("names a real topic or a real interview round in every step", () => {
    for (const source of ROADMAPS) {
      for (const stage of source.stages) {
        for (const step of stage.steps) {
          if ("topic" in step) expect(topic(step.topic), `${source.id}: topic ${step.topic}`).not.toBeNull();
          else expect(bookRound(step.round), `${source.id}: round ${step.round}`).not.toBeNull();
        }
      }
    }
  });

  it("never repeats a step inside one roadmap", () => {
    for (const source of ROADMAPS) {
      const keys = source.stages.flatMap((stage) =>
        stage.steps.map((step) => ("topic" in step ? `topic:${step.topic}` : `round:${step.round}`))
      );
      expect(new Set(keys).size, `${source.id} repeats a step`).toBe(keys.length);
    }
  });

  it("gives every stage a title, a one-line blurb and at least one step", () => {
    for (const source of ROADMAPS) {
      expect(new Set(source.stages.map((stage) => stage.id)).size).toBe(source.stages.length);
      for (const stage of source.stages) {
        expect(stage.title.length, `${source.id}/${stage.id}`).toBeGreaterThan(0);
        expect(stage.blurb.length).toBeGreaterThan(10);
        expect(stage.blurb.length).toBeLessThanOrEqual(120);
        expect(stage.steps.length).toBeGreaterThan(0);
        expect(stage.order === "in-order" || stage.order === "any-order").toBe(true);
      }
    }
  });

  it("keeps each reason short, plain and free of placeholders", () => {
    for (const source of ROADMAPS) {
      for (const stage of source.stages) {
        for (const step of stage.steps) {
          if (!("why" in step)) continue;
          expect(step.why.length, `${source.id}: ${step.topic}`).toBeGreaterThan(15);
          expect(step.why.length).toBeLessThanOrEqual(100);
          expect(step.why).toMatch(/\.$/);
          expect(step.why).not.toMatch(/todo|tbd|lorem|xxx/i);
        }
      }
    }
  });

  it("describes the reader's starting point in one or two sentences", () => {
    for (const source of ROADMAPS) {
      expect(source.pain.length, source.id).toBeGreaterThan(40);
      expect(source.pain.length).toBeLessThanOrEqual(240);
      expect(source.tagline.length).toBeLessThanOrEqual(60);
    }
  });
});

describe("the resolved roadmaps", () => {
  it("lists every roadmap id once", () => {
    expect(roadmapIds()).toEqual(built.map((entry) => entry.id));
  });

  it("returns null for an unknown id and for names every object has", () => {
    expect(roadmap("nope")).toBeNull();
    expect(roadmap("constructor")).toBeNull();
    expect(roadmap("__proto__")).toBeNull();
  });

  it("takes every number from the content, not from the roadmap file", () => {
    const stats = topicStats();
    for (const entry of built) {
      for (const step of entry.stages.flatMap((stage) => stage.steps)) {
        if (step.kind === "round") continue;
        const id = step.key.slice("topic:".length);
        expect(step.written, step.key).toBe(stats[id].written);
        expect(step.planned, step.key).toBe(stats[id].planned);
        expect(step.exercises, step.key).toBe(stats[id].exercises);
        expect(step.minutes, step.key).toBe(stats[id].minutes);
      }
    }
  });

  it("tracks progress by the same ids the progress page uses", () => {
    for (const step of steps("frontend")) {
      if (step.kind !== "topic" || step.written === 0 || step.key === "topic:git") continue;
      const ready = chapterMetas(step.key.slice("topic:".length)).filter((chapter) => chapter.ready);
      expect(step.progressIds, step.key).toEqual(ready.map((chapter) => chapter.id));
    }
    const git = steps("frontend").find((step) => step.key === "topic:git")!;
    expect(git.progressIds.length).toBe(git.written);
    expect(git.progressIds.every((id) => id.startsWith("git-"))).toBe(true);
  });

  it("tracks a round by its own id and links it to the interview book", () => {
    for (const entry of built) {
      for (const step of entry.stages.flatMap((stage) => stage.steps)) {
        if (step.kind !== "round") continue;
        const id = step.key.slice("round:".length);
        expect(step.progressIds).toEqual([id]);
        expect(step.href).toBe(`/interview/${id}`);
        expect(bookRounds().some((round) => round.id === id)).toBe(true);
      }
    }
  });

  it("adds up the totals from the steps that have something to read", () => {
    for (const entry of built) {
      const all = entry.stages.flatMap((stage) => stage.steps);
      const readable = all.filter((step) => step.written > 0);
      expect(entry.totals.steps).toBe(all.length);
      expect(entry.totals.written).toBe(readable.length);
      expect(entry.totals.rounds).toBe(all.filter((step) => step.kind === "round").length);
      expect(entry.totals.exercises).toBe(readable.reduce((sum, step) => sum + step.exercises, 0));
      expect(entry.totals.minutes).toBe(readable.reduce((sum, step) => sum + step.minutes, 0));
    }
  });

  it("links every step to a path that starts with a slash and never to an unwritten chapter", () => {
    for (const entry of built) {
      for (const step of entry.stages.flatMap((stage) => stage.steps)) {
        expect(step.href, step.key).toMatch(/^\/[a-z0-9/-]+$/);
        if (step.written === 0) expect(step.progressIds, step.key).toEqual([]);
      }
    }
  });

  it("gives every roadmap something the reader can start on today", () => {
    for (const entry of built) {
      expect(entry.totals.written, entry.id).toBeGreaterThan(0);
      expect(entry.totals.minutes, entry.id).toBeGreaterThan(0);
    }
  });
});
