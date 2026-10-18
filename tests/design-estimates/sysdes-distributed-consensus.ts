function failuresTolerated(nodes: number): number {
  return nodes - (Math.floor(nodes / 2) + 1);
}

function smallestGroupTolerating(failures: number): number {
  let nodes = 1;
  while (failuresTolerated(nodes) < failures) nodes += 1;
  return nodes;
}

export const estimates: Record<string, () => string> = {
  "cn-smallest-group-two-down": () => String(smallestGroupTolerating(2)),
};
