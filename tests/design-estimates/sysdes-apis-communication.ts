function savingMs(calls: number, phoneRoundTripMs: number, datacenterHopMs: number): number {
  const chatty = calls * phoneRoundTripMs;
  const aggregated = phoneRoundTripMs + calls * datacenterHopMs;
  return chatty - aggregated;
}

function emptyPollsPerSecond(clients: number, intervalSeconds: number, usefulShare: number): number {
  return Math.round((clients / intervalSeconds) * (1 - usefulShare));
}

export const estimates: Record<string, () => string> = {
  "ap-chatty-client-saving": () => String(savingMs(6, 90, 2)),
  "ap-short-poll-waste": () => emptyPollsPerSecond(1_500_000, 10, 0.04).toLocaleString("en-US"),
};
