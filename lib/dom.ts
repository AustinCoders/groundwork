export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersMotion(): boolean {
  return !window.matchMedia(REDUCED_MOTION).matches;
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function pageHeader(root: ParentNode = document): HTMLElement | null {
  return root.querySelector("header");
}

export function headerHeight(): number {
  return pageHeader()?.getBoundingClientRect().height ?? 0;
}
