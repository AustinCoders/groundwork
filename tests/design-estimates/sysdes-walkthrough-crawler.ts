function bloomGigabytes(items: number, falsePositiveRate: number): string {
  const bitsPerItem = -Math.log(falsePositiveRate) / Math.LN2 ** 2;
  return ((items * bitsPerItem) / 8 / 1e9).toFixed(1);
}

function hostsReady(pagesPerSecond: number, downloadSeconds: number, gapMultiple: number): string {
  const cycleSeconds = downloadSeconds * (1 + gapMultiple);
  return Math.round(pagesPerSecond * cycleSeconds).toLocaleString("en-US");
}

export const estimates: Record<string, () => string> = {
  "cr-bloom-memory": () => bloomGigabytes(2e9, 0.001),
  "cr-hosts-ready": () => hostsReady(400, 0.25, 10),
};
