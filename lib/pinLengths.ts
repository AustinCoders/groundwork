export const PIN_HOLD_VH = 15;
const PIN_STEP_CAP_VH = 40;
const PIN_TOTAL_CAP_VH = 250;

export const PIN_STEP_VH = { how: 30, paths: 30, loop: 32 } as const;

type PinnedSection = keyof typeof PIN_STEP_VH;

export function pinLengthVh(section: PinnedSection, steps: number): number {
  const total = steps * Math.min(PIN_STEP_VH[section], PIN_STEP_CAP_VH) + PIN_HOLD_VH;
  return Math.min(total, PIN_TOTAL_CAP_VH);
}

export const PIN_TURN_CAP = 0.25;
