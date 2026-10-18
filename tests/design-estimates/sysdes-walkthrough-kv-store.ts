function nodesNeeded(
  reads: number,
  writes: number,
  replicas: number,
  readQuorum: number,
  opsPerNode: number,
  utilization: number
): number {
  const replicaOps = reads * readQuorum + writes * replicas;
  return Math.ceil(replicaOps / (opsPerNode * utilization));
}

export const estimates: Record<string, () => string> = {
  "kv-nodes-from-throughput": () => String(nodesNeeded(120_000, 40_000, 3, 2, 10_000, 0.7)),
};
