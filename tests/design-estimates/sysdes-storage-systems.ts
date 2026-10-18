const MIB_PER_TIB = 1024 * 1024;

function smallestPartMiB(objectTiB: number, maxParts: number): string {
  return `${Math.ceil((objectTiB * MIB_PER_TIB) / maxParts)} MiB`;
}

function tieringSaving(totalGB: number, coldShare: number, hotPrice: number, coldPrice: number): string {
  const coldGB = totalGB * coldShare;
  const saving = Math.round(coldGB * (hotPrice - coldPrice));
  return `$${saving.toLocaleString("en-US")}`;
}

export const estimates: Record<string, () => string> = {
  "ss-multipart-part-size": () => smallestPartMiB(2, 10_000),
  "ss-tiering-saving": () => tieringSaving(200_000, 0.9, 0.023, 0.004),
};
