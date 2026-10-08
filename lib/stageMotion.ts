function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(-1, value));
}

export function pointerUnit(pointer: number, start: number, size: number): number {
  if (!(size > 0)) return 0;
  return clampUnit(((pointer - start) / size) * 2 - 1);
}
