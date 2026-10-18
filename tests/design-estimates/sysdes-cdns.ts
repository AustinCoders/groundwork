function staleIfErrorLimit(maxAge: number, staleIfError: number): string {
  return (maxAge + staleIfError).toLocaleString("en-US");
}

function purgeAllFactor(requestsPerSecond: number, hitPercent: number): string {
  const missPercent = 100 - hitPercent;
  const normalOrigin = (requestsPerSecond * missPercent) / 100;
  return String(requestsPerSecond / normalOrigin);
}

export const estimates: Record<string, () => string> = {
  "cdn-stale-if-error-window": () => staleIfErrorLimit(300, 3600),
  "cdn-purge-all-load": () => purgeAllFactor(40_000, 98),
};
