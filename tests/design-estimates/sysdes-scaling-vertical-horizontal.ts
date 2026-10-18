function instancesNeeded(peakPerSecond: number, perInstancePerSecond: number, maxUtilization: number): number {
  return Math.ceil(peakPerSecond / (perInstancePerSecond * maxUtilization));
}

function clusterWriteWork(primaryWritesPerSecond: number, replicas: number): number {
  return primaryWritesPerSecond * (1 + replicas);
}

export const estimates: Record<string, () => string> = {
  "sc-app-tier-sizing": () => String(instancesNeeded(12_000, 800, 0.6)),
  "sc-replica-write-work": () => clusterWriteWork(3_000, 4).toLocaleString("en-US"),
};
