function worstCaseDriftMs(driftMicrosPerSecond: number, secondsSinceSync: number): number {
  return (driftMicrosPerSecond * secondsSinceSync) / 1000;
}

function fleetIdsPerSecond(sequenceBits: number, generators: number): number {
  const perMillisecond = 2 ** sequenceBits;
  return perMillisecond * 1000 * generators;
}

export const estimates: Record<string, () => string> = {
  "ti-drift-ten-minutes": () => String(worstCaseDriftMs(200, 10 * 60)),
  "ti-snowflake-fleet-rate": () => fleetIdsPerSecond(12, 8).toLocaleString("en-US"),
};
