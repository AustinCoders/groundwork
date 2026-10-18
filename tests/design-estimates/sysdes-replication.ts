function lostWrites(lagMs: number, writesPerSecond: number): string {
  return String(Math.round((lagMs / 1000) * writesPerSecond));
}

export const estimates: Record<string, () => string> = {
  "re-async-loss-window": () => lostWrites(60, 8000),
};
