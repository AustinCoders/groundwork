function fanOutSeconds(followers: number, insertionsPerSecond: number): number {
  return followers / insertionsPerSecond;
}

function idsPerShardPerSecond(sequenceBits: number): number {
  return 2 ** sequenceBits * 1000;
}

export const estimates: Record<string, () => string> = {
  "cst-celebrity-fanout-seconds": () => String(fanOutSeconds(31_000_000, 100_000)),
  "cst-shard-id-rate": () => idsPerShardPerSecond(10).toLocaleString("en-US"),
};
