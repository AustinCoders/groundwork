function coldFirstByteMs(roundTripMs: number): string {
  const tcpRoundTrips = 1;
  const tls13RoundTrips = 1;
  const httpRoundTrips = 1;
  return `${(tcpRoundTrips + tls13RoundTrips + httpRoundTrips) * roundTripMs} ms`;
}

function warmBudgetLeftMs(budgetMs: number, roundTripMs: number, cacheMs: number, queryMs: number): string {
  return String(budgetMs - roundTripMs - cacheMs - queryMs);
}

export const estimates: Record<string, () => string> = {
  "cs-cold-first-byte": () => coldFirstByteMs(60),
  "cs-warm-budget-left": () => warmBudgetLeftMs(200, 80, 0.5, 5),
};
