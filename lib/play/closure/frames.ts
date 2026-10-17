import { trace, type TraceResult } from "./interpreter";
import { narrate } from "./narrate";
import type { ClosureFrame } from "./types";

export function buildFrames(source: string): { frames: ClosureFrame[]; error: TraceResult["error"] } {
  const { snapshots, error } = trace(source);
  const frames = snapshots.map((snapshot, at): ClosureFrame => {
    const last = at === snapshots.length - 1;
    return {
      ...snapshot,
      remarks: narrate(snapshots[at - 1] ?? null, snapshot, last),
      finished: last && !snapshot.failure,
    };
  });
  return { frames, error };
}
