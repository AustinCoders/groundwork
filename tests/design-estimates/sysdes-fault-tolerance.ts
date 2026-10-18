function attemptsAtDatabase(attemptsPerLayer: number, retryingLayers: number): string {
  return String(attemptsPerLayer ** retryingLayers);
}

export const estimates: Record<string, () => string> = {
  "ft-retry-attempts-at-db": () => attemptsAtDatabase(1 + 3, 3),
};
