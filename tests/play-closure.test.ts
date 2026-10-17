import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { PlayIsland } from "@/components/play/PlayIsland";
import { splitIslands } from "@/lib/chapterIslands";
import { chapters } from "@/lib/content";
import { closureExamples } from "@/lib/play/closure/examples";
import { buildFrames } from "@/lib/play/closure/frames";
import { MAX_STEPS, trace } from "@/lib/play/closure/interpreter";
import { loadClosureTracer } from "@/lib/play/closure/registry";
import type { ClosureFrame } from "@/lib/play/closure/types";

function example(id: string) {
  return closureExamples.find((entry) => entry.id === id)!;
}

function framesOf(source: string) {
  return buildFrames(source).frames;
}

function realOutput(source: string): string {
  let printed = "";
  const sandbox = {
    console: {
      log: (...args: unknown[]) => {
        printed += `${args.join(" ")}\n`;
      },
    },
  };
  vm.runInNewContext(source, sandbox);
  return printed;
}

const last = (frames: ClosureFrame[]) => frames[frames.length - 1];

describe("every closure example", () => {
  it.each(closureExamples.map((entry) => [entry.id, entry.source] as const))(
    "%s runs to the end without an error",
    (_id, source) => {
      const { frames, error } = buildFrames(source);
      expect(error).toBeNull();
      expect(frames.length).toBeGreaterThan(3);
      expect(frames.length).toBeLessThan(MAX_STEPS);
      expect(last(frames).finished).toBe(true);
    }
  );

  it.each(closureExamples.map((entry) => [entry.id, entry.source] as const))(
    "%s prints what real JavaScript prints",
    (_id, source) => {
      expect(last(framesOf(source)).output).toBe(realOutput(source));
    }
  );

  it("gives every example a unique id and a title", () => {
    expect(new Set(closureExamples.map((entry) => entry.id)).size).toBe(closureExamples.length);
    expect(closureExamples.every((entry) => entry.title.length > 0)).toBe(true);
  });

  it("names a line that exists in every step", () => {
    for (const { id, source } of closureExamples) {
      const count = source.replace(/\n$/, "").split("\n").length;
      for (const frame of framesOf(source)) {
        expect(frame.line, `${id} step names line ${frame.line}`).toBeGreaterThanOrEqual(1);
        expect(frame.line, `${id} step names line ${frame.line}`).toBeLessThanOrEqual(count);
      }
    }
  });
});

describe("the counter example", () => {
  const frames = framesOf(example("closure-counter").source);

  it("keeps the frame of counter() alive after the call returns", () => {
    const returned = frames.findIndex((frame) => frame.event === "return" && frame.scopeLabel === "counter");
    expect(returned).toBeGreaterThan(0);
    const after = frames[returned + 1];
    const kept = after.scopes.find((scope) => scope.label === "counter")!;
    expect(kept.running).toBe(false);
    expect(kept.keptBy).toEqual(["anonymous"]);
    expect(kept.bindings.map((binding) => binding.name)).toEqual(["n"]);
  });

  it("changes n inside that kept frame, one call at a time", () => {
    const values = frames
      .map(
        (frame) =>
          frame.scopes.find((scope) => scope.label === "counter")?.bindings.find((binding) => binding.name === "n")
            ?.value
      )
      .filter((cell) => cell !== undefined)
      .map((cell) => (cell!.kind === "number" ? cell!.text : cell!.kind));
    expect(values[0]).toBe("0");
    expect(values.at(-1)).toBe("2");
    expect([...new Set(values)]).toEqual(["0", "1", "2"]);
  });

  it("links the returned function to the frame it was created in", () => {
    const final = last(frames);
    const inner = final.heap.find((entry) => entry.kind === "function" && entry.name === "anonymous");
    expect(inner).toMatchObject({ closesOver: 1 });
  });

  it("says in words that the frame is not thrown away", () => {
    const text = frames
      .flatMap((frame) => frame.remarks)
      .filter((remark) => remark.closure)
      .map((remark) => remark.text);
    expect(text.some((line) => /is NOT thrown away/.test(line) && /That is a closure/.test(line))).toBe(true);
    expect(text.some((line) => /remembers that frame/.test(line))).toBe(true);
  });

  it("starts with an explanation that nothing has run", () => {
    expect(frames[0].remarks[0].text).toMatch(/^Nothing has run yet\./);
  });
});

describe("two counters", () => {
  const frames = framesOf(example("closure-two-counters").source);

  it("keeps one frame per counter, each with its own n", () => {
    const kept = last(frames).scopes.filter((scope) => scope.label === "makeCounter");
    expect(kept).toHaveLength(2);
    const counts = kept.map((scope) => scope.bindings.find((binding) => binding.name === "n")!.value);
    expect(counts).toEqual([
      { kind: "number", text: "3" },
      { kind: "number", text: "2" },
    ]);
  });
});

describe("the loops", () => {
  it("shares one variable when the loop uses var", () => {
    const final = last(framesOf(example("closure-loop-var").source));
    expect(final.output).toBe("3 3 3\n");
    expect(final.scopes.every((scope) => scope.kind === "function")).toBe(true);
    expect(final.globals.find((binding) => binding.name === "i")?.value).toMatchObject({ kind: "number", text: "3" });
  });

  it("gives every pass its own variable when the loop uses let", () => {
    const final = last(framesOf(example("closure-loop-let").source));
    expect(final.output).toBe("0 1 2\n");
    const copies = final.scopes.filter((scope) => scope.label === "for loop");
    expect(copies.map((scope) => scope.bindings[0].value.kind === "number" && scope.bindings[0].value.text)).toEqual([
      "0",
      "1",
      "2",
    ]);
    expect(copies.every((scope) => !scope.running && scope.keptBy.length === 1)).toBe(true);
  });
});

describe("language coverage", () => {
  const output = (source: string) => last(framesOf(source)).output;

  it("calls methods with this", () => {
    expect(output("const c = { n: 0, inc() { this.n++; return this.n; } };\nc.inc();\nconsole.log(c.inc());")).toBe(
      "2\n"
    );
  });

  it("runs array helpers that call back into the program", () => {
    expect(output("console.log([1, 2, 3].map((x) => x * 2), [1, 2, 3].reduce((a, b) => a + b, 0));")).toBe(
      "[2, 4, 6] 6\n"
    );
  });

  it("catches a thrown value and keeps going", () => {
    expect(output("try { throw 'boom'; } catch (e) { console.log(e); }\nconsole.log('after');")).toBe("boom\nafter\n");
  });

  it("hoists function declarations and var", () => {
    expect(output("console.log(typeof hoisted, typeof later);\nfunction hoisted() {}\nvar later = 1;")).toBe(
      "function undefined\n"
    );
  });

  it("supports default parameters, rest parameters and template strings", () => {
    expect(output("const f = (a, b = 2, ...c) => `${a}-${b}-${c.length}`;\nconsole.log(f(1), f(1, 5, 6, 7));")).toBe(
      "1-2-0 1-5-2\n"
    );
  });

  it("refuses to assign to a const", () => {
    expect(trace("const a = 1;\na = 2;").error?.message).toMatch(/constant variable/);
  });
});

describe("failures", () => {
  it("stops on an undefined name and ends with a failed step on that line", () => {
    const { frames, error } = buildFrames("function f() {\n  return missing + 1;\n}\nf();");
    expect(error).toEqual({ message: "ReferenceError: missing is not defined", line: 2 });
    expect(last(frames)).toMatchObject({ event: "failed", line: 2, finished: false });
  });

  it("reports a syntax error with its line and no steps", () => {
    const { frames, error } = buildFrames("const a = 1;\nconst = ;");
    expect(frames).toEqual([]);
    expect(error?.line).toBe(2);
  });

  it("stops an infinite loop at the step limit", () => {
    const { frames, error } = buildFrames("let i = 0;\nwhile (true) {\n  i++;\n}");
    expect(frames).toHaveLength(MAX_STEPS + 1);
    expect(last(frames).event).toBe("limit");
    expect(error?.message).toMatch(/infinite loop/);
  });

  it("stops runaway recursion with a stack error", () => {
    expect(buildFrames("function f() { return f(); }\nf();").error?.message).toMatch(/Maximum call stack/);
  });

  it("names the feature it does not support yet", () => {
    expect(buildFrames("class A {}\nnew A();").error?.message).toMatch(/not supported/);
  });
});

describe("the registry", () => {
  it("loads every example by id with its lines and frames", () => {
    for (const { id, title, source } of closureExamples) {
      const tracer = loadClosureTracer(id)!;
      expect(tracer).toMatchObject({ id, title });
      expect(tracer.lines.join("\n")).toBe(source.trimEnd());
      expect(tracer.frames.length).toBeGreaterThan(3);
    }
  });

  it("returns null for an unknown id and for names that live on every object", () => {
    expect(loadClosureTracer("nope")).toBeNull();
    expect(loadClosureTracer("constructor")).toBeNull();
    expect(loadClosureTracer("__proto__")).toBeNull();
  });

  it("produces frames that survive a trip through JSON, as they do on their way to the browser", () => {
    for (const { id } of closureExamples) {
      const frames = loadClosureTracer(id)!.frames;
      expect(JSON.parse(JSON.stringify(frames))).toEqual(frames);
    }
  });

  it("keeps each example small enough to ship to the browser", () => {
    for (const { id } of closureExamples) {
      expect(JSON.stringify(loadClosureTracer(id)!.frames).length, id).toBeLessThan(60_000);
    }
  });
});

describe("the closures chapter", () => {
  const chapter = chapters("js").find((entry) => entry.id === "closures")!;
  const ids = splitIslands(chapter.body)!.flatMap((segment) => (segment.kind === "island" ? [segment.id] : []));

  it("keeps the 3D scene and adds the step-through players after it", () => {
    expect(chapter.body).toContain('id="cl-3d"');
    expect(chapter.body.indexOf('data-play="closure-counter"')).toBeGreaterThan(chapter.body.indexOf('id="cl-3d"'));
  });

  it("names only players that exist, each once", () => {
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(loadClosureTracer(id), id).not.toBeNull();
  });

  it("renders each island with the title, lines and frames as props", async () => {
    for (const id of ids) {
      const shown = JSON.stringify(await PlayIsland({ id }));
      expect(shown).toContain('"frames"');
      expect(shown).toContain('"lines"');
      expect(shown).toContain(`"title":${JSON.stringify(loadClosureTracer(id)!.title)}`);
    }
  });
});

describe("the browser bundle", () => {
  it("never imports the interpreter or the registry from a client file", () => {
    const files = ["app", "components", "lib"].flatMap((dir) =>
      readdirSync(dir, { recursive: true, encoding: "utf8" })
        .filter((entry) => /\.tsx?$/.test(entry))
        .map((entry) => join(dir, entry))
    );
    const importers = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return (
        /^\s*["']use client["']/.test(source) &&
        /lib\/play\/closure\/(?:interpreter|registry|frames|examples|narrate|snapshot|builtins|values)/.test(source)
      );
    });
    expect(importers).toEqual([]);
  });
});
