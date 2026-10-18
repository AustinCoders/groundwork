function smallestOverlappingWriteQuorum(replicas: number, readQuorum: number): string {
  let write = 1;
  while (readQuorum + write <= replicas) write += 1;
  return `W = ${write}`;
}

function nearestFollowerRoundTrip(roundTripsMs: number[]): string {
  return `${Math.min(...roundTripsMs)} ms`;
}

export const estimates: Record<string, () => string> = {
  "cap-smallest-write-quorum": () => smallestOverlappingWriteQuorum(5, 2),
  "cap-wan-quorum-floor": () => nearestFollowerRoundTrip([65, 80]),
};
