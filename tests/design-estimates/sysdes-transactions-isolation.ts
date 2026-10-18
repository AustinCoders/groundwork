function maxCommitsPerSecond(lockHoldMs: number): string {
  return (1000 / lockHoldMs).toFixed(1);
}

function provisionedWcu(callsPerSecond: number, itemsPerCall: number, wcuPerItemWrite: number): string {
  const underlyingWritesPerItem = 2;
  return String(callsPerSecond * itemsPerCall * underlyingWritesPerItem * wcuPerItemWrite);
}

export const estimates: Record<string, () => string> = {
  "tx-2pc-hot-row-rate": () => maxCommitsPerSecond(120),
  "tx-dynamodb-transaction-capacity": () => provisionedWcu(5, 4, 1),
};
