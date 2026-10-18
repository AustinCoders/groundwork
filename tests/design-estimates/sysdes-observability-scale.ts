function fastShare(perServiceSlowPercent: number, services: number): string {
  const share = (1 - perServiceSlowPercent / 100) ** services;
  return `${(share * 100).toFixed(1)}%`;
}

function budgetRunwayHours(budgetBasisPoints: number, errorBasisPoints: number, windowDays: number): string {
  const hours = Math.round(((windowDays * 24 * budgetBasisPoints) / errorBasisPoints) * 1000) / 1000;
  return `${hours} hours`;
}

export const estimates: Record<string, () => string> = {
  "ob-fanout-fast-share": () => fastShare(1, 50),
  "ob-error-budget-runway": () => budgetRunwayHours(10, 72, 30),
};
