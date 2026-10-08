import type { Tracer } from "./types";

const tracers = new Map<string, () => Promise<{ tracer: Tracer }>>([["binary-search", () => import("./binarySearch")]]);

export async function loadTracer(id: string): Promise<Tracer | null> {
  const load = tracers.get(id);
  return load ? (await load()).tracer : null;
}
