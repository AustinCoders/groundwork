function databaseReads(readsPerSecond: number, hitRate: number): number {
  return Math.round(readsPerSecond * (1 - hitRate));
}

function afterNodeLoss(readsPerSecond: number, nodes: number, hitRate: number): number {
  const lostShare = 1 / nodes;
  const missRate = lostShare + (1 - lostShare) * (1 - hitRate);
  return Math.round(readsPerSecond * missRate);
}

export const estimates: Record<string, () => string> = {
  "ca-miss-rate-slip": () => databaseReads(400_000, 0.96).toLocaleString("en-US"),
  "ca-node-loss-load": () => afterNodeLoss(200_000, 4, 0.98).toLocaleString("en-US"),
};
