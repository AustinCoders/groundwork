function peakReadsPerSecond(dailyActives: number, loadsPerDay: number, peakFactor: number): string {
  const millionsPerDay = (dailyActives * loadsPerDay) / 1_000_000;
  return (millionsPerDay * 12 * peakFactor).toLocaleString("en-US");
}

function downtimeMinutesPerYear(availability: number): string {
  const minutesPerYear = 365 * 24 * 60;
  return String(Math.round(minutesPerYear * (1 - availability)));
}

export const estimates: Record<string, () => string> = {
  "im-peak-reads-from-dau": () => peakReadsPerSecond(40_000_000, 5, 3),
  "im-downtime-budget": () => downtimeMinutesPerYear(0.9999),
};
