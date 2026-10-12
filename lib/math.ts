export function unit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
