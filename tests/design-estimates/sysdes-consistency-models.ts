function smallestReadQuorum(replicas: number, writeQuorum: number): string {
  let readQuorum = 1;
  while (readQuorum + writeQuorum <= replicas) readQuorum += 1;
  return `R = ${readQuorum}, ${replicas - readQuorum} replicas down`;
}

export const estimates: Record<string, () => string> = {
  "co-smallest-read-quorum": () => smallestReadQuorum(5, 4),
};
