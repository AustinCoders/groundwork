function peakInFlightCalls(paymentsPerDay: number, peakFactor: number, secondsPerCall: number): number {
  const averagePerSecond = paymentsPerDay / 86_400;
  return averagePerSecond * peakFactor * secondsPerCall;
}

function grossGap(ledger: Record<string, number>, psp: Record<string, number>): number {
  const total = (amounts: Record<string, number>) => Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  return total(ledger) - total(psp);
}

export const estimates: Record<string, () => string> = {
  "pay-peak-in-flight-calls": () => String(peakInFlightCalls(4_320_000, 6, 1.5)),
  "pay-reconcile-gross-gap": () =>
    grossGap({ A: 5000, B: 12000, C: 3500, E: 8100 }, { A: 5000, B: 12000, D: 2200, E: 8010 }).toLocaleString("en-US"),
};
