function shareHittingASlowShard(shards: number, slowChance: number): string {
  const share = 1 - Math.pow(1 - slowChance, shards);
  return (share * 100).toFixed(1);
}

export const estimates: Record<string, () => string> = {
  "se-slow-shard-tail": () => shareHittingASlowShard(100, 0.01),
};
