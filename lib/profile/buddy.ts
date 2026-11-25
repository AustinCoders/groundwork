const DAY = 86_400_000;

function ms(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function key(at: number): string {
  return new Date(at).toISOString().slice(0, 10);
}

export function heatOn(face: { heat: number[]; heatEnd: string }, day: string): number {
  if (!face.heatEnd) return 0;
  const back = Math.round((ms(face.heatEnd) - ms(day)) / DAY);
  if (back < 0 || back >= face.heat.length) return 0;
  return face.heat[face.heat.length - 1 - back] ?? 0;
}

export function pairStreak(
  mine: Record<string, number>,
  theirs: { heat: number[]; heatEnd: string },
  today: string
): number {
  const both = (day: string) => (mine[day] ?? 0) > 0 && heatOn(theirs, day) > 0;
  let at = ms(today);
  if (!both(key(at))) at -= DAY;
  let streak = 0;
  while (streak < 400 && both(key(at))) {
    streak++;
    at -= DAY;
  }
  return streak;
}
