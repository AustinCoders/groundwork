export const estimates: Record<string, () => string> = {
  "sec-brute-force-seconds": () => String(Math.round(26 ** 8 / 10_000_000_000)),
};
