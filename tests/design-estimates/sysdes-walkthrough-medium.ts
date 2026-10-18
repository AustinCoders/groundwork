function readLookupsPerSecondInMillions(dailyUsers: number, opensPerDay: number, followed: number): string {
  const opensPerSecond = (dailyUsers * opensPerDay) / 86_400;
  const lookups = opensPerSecond * followed;
  return (lookups / 1_000_000).toFixed(1);
}

function minutesToFanOut(followers: number, appendsPerSecond: number): string {
  return String(followers / appendsPerSecond / 60);
}

export const estimates: Record<string, () => string> = {
  "wm-read-lookups-per-second": () => readLookupsPerSecondInMillions(500_000_000, 15, 200),
  "wm-celebrity-fanout-minutes": () => minutesToFanOut(150_000_000, 100_000),
};
