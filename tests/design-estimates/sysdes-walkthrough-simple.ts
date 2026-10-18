function peakRedirectsPerSecond(createsPerDay: number, readsPerCreate: number, secondsPerDay: number, peak: number) {
  const redirectsPerDay = createsPerDay * readsPerCreate;
  return Math.round((redirectsPerDay / secondsPerDay) * peak);
}

function percentOfKeyspace(links: number, alphabet: number, length: number): string {
  return `${Math.round((links / alphabet ** length) * 100)}%`;
}

export const estimates: Record<string, () => string> = {
  "ws-peak-redirects": () => peakRedirectsPerSecond(10_000_000, 100, 86_400, 3).toLocaleString("en-US"),
  "ws-keyspace-fraction": () => percentOfKeyspace(10_000_000 * 365 * 5, 62, 6),
};
