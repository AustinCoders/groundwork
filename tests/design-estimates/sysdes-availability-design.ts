function serialAvailability(parts: number[]): string {
  const product = parts.reduce((acc, part) => acc * part, 1);
  return `${(product * 100).toFixed(2)}%`;
}

function budgetLeft(slo: number, windowDays: number, outageMinutes: number): string {
  const budget = windowDays * 24 * 60 * (1 - slo);
  return `${(budget - outageMinutes).toFixed(1)} minutes`;
}

function attemptsAtBottom(attemptsPerLayer: number, layers: number): string {
  return String(attemptsPerLayer ** layers);
}

export const estimates: Record<string, () => string> = {
  "av-serial-chain": () => serialAvailability([0.9995, 0.999, 0.999, 0.999]),
  "av-budget-left": () => budgetLeft(0.9995, 28, 12),
  "av-retry-multiplication": () => attemptsAtBottom(4, 3),
};
