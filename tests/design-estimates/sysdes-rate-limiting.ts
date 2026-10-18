interface CounterState {
  windowStart: number;
  count: number;
  prevCount: number;
}

function allow(state: CounterState, now: number, limit: number, windowMs: number): boolean {
  const windowStart = Math.floor(now / windowMs) * windowMs;
  if (windowStart !== state.windowStart) {
    state.prevCount = windowStart - state.windowStart === windowMs ? state.count : 0;
    state.windowStart = windowStart;
    state.count = 0;
  }
  const elapsed = (now - windowStart) / windowMs;
  const estimate = state.prevCount * (1 - elapsed) + state.count;
  if (estimate >= limit) return false;
  state.count += 1;
  return true;
}

function admittedOneSecondIn(): number {
  const state: CounterState = { windowStart: 0, count: 100, prevCount: 0 };
  let admitted = 0;
  while (allow(state, 61_000, 100, 60_000)) admitted += 1;
  return admitted;
}

function burstOutcome(capacity: number, refillPerSecond: number, requests: number): string {
  const allowed = Math.min(requests, capacity);
  const retryAfter = Math.ceil((requests > capacity ? 1 : 0) / refillPerSecond);
  return `${allowed} allowed, Retry-After ${retryAfter}`;
}

export const estimates: Record<string, () => string> = {
  "rl-sliding-counter-one-second": () => String(admittedOneSecondIn()),
  "rl-bucket-burst-of-twelve": () => burstOutcome(10, 5, 12),
  "rl-in-flight-when-slow": () => (200 * 5).toLocaleString("en-US"),
};
