function assignmentsPerSecond(eventsPerSecond: number, lengthMinutes: number, slideMinutes: number): string {
  return (eventsPerSecond * (lengthMinutes / slideMinutes)).toLocaleString("en-US");
}

function secondsToCatchUp(
  arrivalPerSecond: number,
  capacityPerSecond: number,
  secondsSinceCheckpoint: number,
  restartSeconds: number
): string {
  const backlog = (secondsSinceCheckpoint + restartSeconds) * arrivalPerSecond;
  const drainPerSecond = capacityPerSecond - arrivalPerSecond;
  return `${backlog / drainPerSecond} seconds`;
}

export const estimates: Record<string, () => string> = {
  "bsp-sliding-assignments": () => assignmentsPerSecond(8000, 15, 3),
  "bsp-catch-up-time": () => secondsToCatchUp(4000, 6000, 30, 90),
};
