function keysThatMove(before: number, after: number, cycle: number): number {
  let moved = 0;
  for (let hash = 0; hash < cycle; hash += 1) {
    if (hash % before !== hash % after) moved += 1;
  }
  return moved;
}

interface Token {
  position: number;
  node: string;
}

function ownerOf(ring: Token[], position: number): string {
  const sorted = [...ring].sort((a, b) => a.position - b.position);
  const next = sorted.find((token) => token.position >= position);
  return (next ?? sorted[0]).node;
}

function positionsOwned(ring: Token[], node: string, size: number): number {
  let owned = 0;
  for (let position = 0; position < size; position += 1) {
    if (ownerOf(ring, position) === node) owned += 1;
  }
  return owned;
}

function ownedByAAfterRemovingB(): number {
  const ring: Token[] = [
    { position: 120, node: "A" },
    { position: 800, node: "A" },
    { position: 300, node: "B" },
    { position: 700, node: "B" },
    { position: 380, node: "C" },
    { position: 560, node: "C" },
  ];
  const survivors = ring.filter((token) => token.node !== "B");
  return positionsOwned(survivors, "A", 1000);
}

export const estimates: Record<string, () => string> = {
  "sh-mod-n-grow-by-one": () => String(keysThatMove(10, 11, 110)),
  "sh-ring-remove-node": () => String(ownedByAAfterRemovingB()),
};
