export function nextTab(key: string, from: number, count: number): number {
  if (count < 1) return -1;
  if (key === "ArrowRight" || key === "ArrowDown") return (from + 1) % count;
  if (key === "ArrowLeft" || key === "ArrowUp") return (from - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return -1;
}
