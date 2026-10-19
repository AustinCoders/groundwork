export const estimates: Record<string, () => string> = {
  "ms-parallel-latency": () => String(20 + Math.max(15, 25, 40, 60)),
  "ms-optional-availability": () => (0.999 ** 3 * 100).toFixed(2),
  "ms-stale-window": () => String(30 + 15),
};
