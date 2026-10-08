export const PIN_HOLD_VH = 15;
export const PIN_STEP_CAP_VH = 40;
export const PIN_TOTAL_CAP_VH = 250;

export const PIN_STEP_VH = { how: 30, paths: 30, loop: 32 } as const;

type PinnedSection = keyof typeof PIN_STEP_VH;

export function pinLengthVh(section: PinnedSection, steps: number): number {
  return steps * PIN_STEP_VH[section] + PIN_HOLD_VH;
}
