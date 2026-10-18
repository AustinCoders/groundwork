function peakRequestsPerSecond(
  dau: number,
  requestsPerUser: number,
  secondsPerDay: number,
  peakFactor: number
): number {
  return ((dau * requestsPerUser) / secondsPerDay) * peakFactor;
}

function egressGbps(responsesPerSecond: number, bytesPerResponse: number): number {
  return (responsesPerSecond * bytesPerResponse * 8) / 1e9;
}

function storagePetabytes(uploadsPerDay: number, bytesPerUpload: number, days: number, copies: number): number {
  return (uploadsPerDay * bytesPerUpload * days * copies) / 1e15;
}

function gatewayBoxes(dau: number, concurrentPercent: number, socketsPerBox: number): number {
  return Math.ceil((dau * concurrentPercent) / 100 / socketsPerBox);
}

export const estimates: Record<string, () => string> = {
  "ce-peak-qps": () => peakRequestsPerSecond(50_000_000, 20, 100_000, 3).toLocaleString("en-US"),
  "ce-egress-gbps": () => String(egressGbps(40_000, 250_000)),
  "ce-storage-five-years": () => String(storagePetabytes(10_000_000, 2_000_000, 1_825, 3)),
  "ce-gateway-boxes": () => String(gatewayBoxes(200_000_000, 15, 250_000)),
};
