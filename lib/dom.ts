export function prefersMotion(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
