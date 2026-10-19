function budgetMinutes(objectivePercent: number, days: number): number {
  return ((100 - objectivePercent) / 100) * days * 24 * 60;
}

export const estimates: Record<string, () => string> = {
  "rs-canary-budget-share": () => {
    const budget = budgetMinutes(99.9, 30);
    const spent = 0.05 * 0.2 * 10;
    return ((spent / budget) * 100).toFixed(2);
  },
  "rs-budget-minutes": () => budgetMinutes(99.9, 30).toFixed(1),
};
