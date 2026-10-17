import { describe, expect, it } from "vitest";
import { roadmap } from "@/lib/roadmap";
import {
  EMPTY_DONE,
  levelProgress,
  neighbours,
  parseDone,
  roadmapProgress,
  statusLabel,
  stepProgress,
  upNext,
} from "@/app/roadmap/roadmapModel";

const frontend = roadmap("frontend")!;
const stepsOf = (id: string) => roadmap(id)!.stages.flatMap((stage) => stage.steps);
const js = stepsOf("frontend").find((step) => step.key === "topic:js")!;
const html = stepsOf("frontend").find((step) => step.key === "topic:html")!;
const round = stepsOf("interview").find((step) => step.key === "round:r2")!;

describe("reading the saved progress", () => {
  it("reads an empty and a filled key", () => {
    expect(parseDone("p:")).toBe(EMPTY_DONE);
    expect([...parseDone("p:a,b,c")]).toEqual(["a", "b", "c"]);
  });
});

describe("the state of one step", () => {
  it("is not started until a chapter is read", () => {
    expect(stepProgress(js, EMPTY_DONE)).toEqual({ done: 0, total: js.progressIds.length, status: "todo" });
  });

  it("is in progress after some chapters and done after all of them", () => {
    const some = new Set(js.progressIds.slice(0, 3));
    expect(stepProgress(js, some)).toMatchObject({ done: 3, status: "doing" });
    expect(stepProgress(js, new Set(js.progressIds))).toMatchObject({ done: js.progressIds.length, status: "done" });
  });

  it("ignores finished chapters that belong to another step", () => {
    expect(stepProgress(js, new Set(["not-a-chapter", ...stepsOf("frontend")[0].progressIds])).status).not.toBe("done");
  });

  it("marks a topic with nothing written as an outline that can never be started or finished", () => {
    expect(html.written).toBe(0);
    expect(stepProgress(html, new Set(js.progressIds))).toEqual({ done: 0, total: 0, status: "outline" });
  });

  it("treats a round as one unit", () => {
    expect(stepProgress(round, EMPTY_DONE)).toMatchObject({ total: 1, status: "todo" });
    expect(stepProgress(round, new Set(["r2"]))).toMatchObject({ done: 1, total: 1, status: "done" });
  });

  it("says each state in words, so colour is never the only signal", () => {
    expect(statusLabel({ done: 0, total: 0, status: "outline" })).toBe("Not written yet");
    expect(statusLabel({ done: 0, total: 5, status: "todo" })).toBe("Not started");
    expect(statusLabel({ done: 2, total: 5, status: "doing" })).toBe("In progress, 2 of 5");
    expect(statusLabel({ done: 5, total: 5, status: "done" })).toBe("Done");
  });
});

describe("the state of a whole roadmap", () => {
  it("starts at the first step that can be read, not at an outline", () => {
    const progress = roadmapProgress(frontend, EMPTY_DONE);
    expect(progress.next).not.toBeNull();
    expect(progress.steps[progress.next!.key].status).toBe("todo");
    expect(progress.next!.written).toBeGreaterThan(0);
    expect(progress.stepsDone).toBe(0);
    expect(progress.chaptersDone).toBe(0);
  });

  it("moves the next step along once the earlier readable steps are done", () => {
    const first = roadmapProgress(frontend, EMPTY_DONE).next!;
    const after = roadmapProgress(frontend, new Set(first.progressIds));
    expect(after.stepsDone).toBe(1);
    expect(after.next!.key).not.toBe(first.key);
  });

  it("counts only chapters that can be read, and totals them correctly", () => {
    const progress = roadmapProgress(frontend, EMPTY_DONE);
    const readable = frontend.stages.flatMap((stage) => stage.steps).filter((step) => step.written > 0);
    expect(progress.stepsReadable).toBe(readable.length);
    expect(progress.chaptersTotal).toBe(readable.reduce((sum, step) => sum + step.progressIds.length, 0));
  });

  it("has no next step once everything readable is done", () => {
    const every = new Set(frontend.stages.flatMap((stage) => stage.steps).flatMap((step) => step.progressIds));
    const progress = roadmapProgress(frontend, every);
    expect(progress.next).toBeNull();
    expect(progress.stepsDone).toBe(progress.stepsReadable);
    expect(progress.chaptersDone).toBe(progress.chaptersTotal);
  });
});

describe("what comes before and after a step", () => {
  it("is the neighbouring step when a stage goes in order", () => {
    const interview = roadmap("interview")!;
    expect(neighbours(interview, "round:r1").before?.key).toBe("round:scout");
    expect(neighbours(interview, "round:r1").after?.key).toBe("round:r1oa");
  });

  it("crosses into the next stage at the end of one", () => {
    const frontend = roadmap("frontend")!;
    expect(neighbours(frontend, "topic:js").before?.key).toBe("topic:git");
    expect(neighbours(frontend, "topic:js").after?.key).toBe("topic:typescript");
  });

  it("does not order steps inside a stage that allows any order", () => {
    const frontend = roadmap("frontend")!;
    expect(neighbours(frontend, "topic:css").before).toBeNull();
    expect(neighbours(frontend, "topic:css").after?.key).toBe("topic:js");
    expect(neighbours(frontend, "topic:html").after?.key).toBe("topic:js");
  });

  it("has nothing before the first step and nothing after the last", () => {
    const interview = roadmap("interview")!;
    expect(neighbours(interview, "round:scout").before).toBeNull();
    expect(neighbours(interview, "round:plan").after).toBeNull();
    expect(neighbours(interview, "round:nope")).toEqual({ before: null, after: null });
  });
});

describe("what is left inside a step", () => {
  it("counts finished chapters per level", () => {
    const level = js.levels[0];
    expect(levelProgress(level, EMPTY_DONE)).toEqual({ done: 0, total: level.ids.length });
    expect(levelProgress(level, new Set(level.ids.slice(0, 2)))).toEqual({ done: 2, total: level.ids.length });
  });

  it("lists the first unread chapters in reading order", () => {
    const first = js.chapters.slice(0, 2).map((chapter) => chapter.id);
    expect(upNext(js, EMPTY_DONE, 3).map((chapter) => chapter.id)).toEqual(js.chapters.slice(0, 3).map((c) => c.id));
    expect(upNext(js, new Set(first), 2).map((chapter) => chapter.id)).toEqual(
      js.chapters.slice(2, 4).map((c) => c.id)
    );
  });

  it("has nothing left once every chapter is read, and nothing to list for a round", () => {
    expect(upNext(js, new Set(js.progressIds), 3)).toEqual([]);
    expect(upNext(round, EMPTY_DONE, 3)).toEqual([]);
  });
});
