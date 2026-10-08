export const ATTENTION_MS = 1400;
export const SAME_GESTURE_MS = 500;

export function sameGesture(now: number, lastOpenedAt: number): boolean {
  return lastOpenedAt > 0 && now - lastOpenedAt < SAME_GESTURE_MS;
}

export function arrivedAtCheck(hash: string): boolean {
  return hash === "#check";
}

export function passBannerText(need: number, total: number): string {
  return `Pass the check, ${need} of ${total} right, and this chapter is marked read.`;
}

export function startedMessage(need: number, total: number): string {
  return `Check started. Answer ${need} of ${total} correctly to mark this chapter read.`;
}
