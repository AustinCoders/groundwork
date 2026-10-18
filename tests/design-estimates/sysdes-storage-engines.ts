function expectedWastedReads(files: number, falsePositiveRate: number): string {
  return String(Number((files * falsePositiveRate).toFixed(6)));
}

function worstCaseSpaceAmplification(levels: number, multiplier: number, firstLevelGb: number): string {
  const sizes = Array.from({ length: levels }, (_, index) => firstLevelGb * multiplier ** index);
  const onDisk = sizes.reduce((sum, size) => sum + size, 0);
  const live = sizes[sizes.length - 1];
  return String(Number((onDisk / live).toFixed(3)));
}

export const estimates: Record<string, () => string> = {
  "eng-missing-key-wasted-reads": () => expectedWastedReads(12, 0.01),
  "eng-leveled-space-amplification": () => worstCaseSpaceAmplification(4, 5, 1),
};
