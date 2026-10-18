function indexEntriesPerSecond(insertsPerSecond: number, secondaryIndexes: number): number {
  return insertsPerSecond * secondaryIndexes;
}

function startingPoolSize(cores: number, busyDisks: number): number {
  return cores * 2 + busyDisks;
}

export const estimates: Record<string, () => string> = {
  "db-index-entries-per-second": () => indexEntriesPerSecond(2_000, 5).toLocaleString("en-US"),
  "db-pool-size-heuristic": () => String(startingPoolSize(16, 1)),
};
