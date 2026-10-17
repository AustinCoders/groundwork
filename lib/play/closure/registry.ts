import { closureExamples } from "./examples";
import { buildFrames } from "./frames";
import type { ClosureTracer } from "./types";

const examples = new Map(closureExamples.map((example) => [example.id, example]));

export function loadClosureTracer(id: string): ClosureTracer | null {
  const example = examples.get(id);
  if (!example) return null;
  return {
    id: example.id,
    title: example.title,
    lines: example.source.replace(/\n$/, "").split("\n"),
    frames: buildFrames(example.source).frames,
  };
}
