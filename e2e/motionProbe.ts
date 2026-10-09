export function probeConnectors(): string[] {
  const problems: string[] = [];
  const overlap = (a: DOMRect, b: DOMRect, pad: number) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > -pad &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > -pad;
  document.querySelectorAll<HTMLElement>("[data-connector]").forEach((connector, i) => {
    const rider = connector.querySelector<HTMLElement>("[data-rider]")!;
    const fact = connector.querySelector<HTMLElement>("[data-fact]")!;
    const sparkle = connector.querySelector<HTMLElement>("[data-part='sparkle']")!;
    const saved = [rider, fact, sparkle].map((el) => el.style.offsetDistance);
    for (let step = 5; step <= 98; step += 3) {
      rider.style.offsetDistance = `${step}%`;
      fact.style.offsetDistance = `${step}%`;
      sparkle.style.offsetDistance = `${step}%`;
      const r = rider.getBoundingClientRect();
      const f = fact.getBoundingClientRect();
      const s = sparkle.getBoundingClientRect();
      if (overlap(r, f, 2)) problems.push(`connector ${i} at ${step}%: the traveller touches its fact`);
      if (overlap(s, f, 0)) problems.push(`connector ${i} at ${step}%: the sparkle touches the fact`);
    }
    [rider, fact, sparkle].forEach((el, k) => {
      el.style.offsetDistance = saved[k];
    });
  });
  return problems;
}

export function probeTrack(section: string): string[] {
  const problems: string[] = [];
  const chips = [...document.querySelectorAll<HTMLElement>(`${section} [data-chip]`)];
  const paths = [
    ...document.querySelectorAll<SVGPathElement>(
      `${section} svg path[class*='dash'], ${section} svg path[class*='reveal']`
    ),
  ];
  for (const path of paths) {
    const matrix = path.getScreenCTM();
    if (!matrix) continue;
    const length = path.getTotalLength();
    for (let at = 0; at <= length; at += 4) {
      const point = path.getPointAtLength(at).matrixTransform(matrix);
      for (const chip of chips) {
        const box = chip.getBoundingClientRect();
        if (box.width < 2 || Number(getComputedStyle(chip).opacity) < 0.3) continue;
        if (point.x > box.left - 1 && point.x < box.right + 1 && point.y > box.top - 1 && point.y < box.bottom + 1)
          problems.push(`the track crosses "${(chip.textContent ?? "").trim().slice(0, 24)}"`);
      }
    }
  }
  return [...new Set(problems)];
}
