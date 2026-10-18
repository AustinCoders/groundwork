function missRateAfterGrowing(from: number, to: number, baseMiss: number): string {
  const cycle = from * to;
  let stay = 0;
  for (let hash = 0; hash < cycle; hash += 1) {
    if (hash % from === hash % to) stay += 1;
  }
  const moved = 1 - stay / cycle;
  return `${Math.round((moved + (1 - moved) * baseMiss) * 100)}%`;
}

function loadAfterEjections(backends: number, ejected: number, cpuPercent: number): string {
  const total = backends * cpuPercent;
  return `${Math.round(total / (backends - ejected))}%`;
}

export const estimates: Record<string, () => string> = {
  "lb-mod-n-miss-rate": () => missRateAfterGrowing(4, 5, 0.05),
  "lb-cascade-cpu": () => loadAfterEjections(10, 4, 70),
};
