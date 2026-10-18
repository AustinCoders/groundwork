function peakPrimaryWrites(
  jobsPerDay: number,
  peakFactor: number,
  writesPerJob: number,
  otherPeakWrites: number
): number {
  const averageJobsPerSecond = jobsPerDay / 86_400;
  return averageJobsPerSecond * peakFactor * writesPerJob + otherPeakWrites;
}

function minutesRemoved(minutesInMonth: number, fromPercent: number, toPercent: number): number {
  const allowance = (percent: number) => (minutesInMonth * Math.round((100 - percent) * 100)) / 10_000;
  return Math.round((allowance(fromPercent) - allowance(toPercent)) * 100) / 100;
}

export const estimates: Record<string, () => string> = {
  "tt-peak-primary-writes": () => peakPrimaryWrites(17_280_000, 5, 3, 1_500).toLocaleString("en-US"),
  "tt-minutes-saved-by-a-nine": () => String(minutesRemoved(30 * 24 * 60, 99.95, 99.99)),
};
