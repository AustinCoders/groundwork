import { useEffect, type RefObject } from "react";

const SCROLLERS = "pre, .table-scroll, [data-scroll-region]";
const regionsWeMarked = new WeakSet<Element>();

function textOf(node: Element | null | undefined): string {
  return node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function headingBefore(node: Element): Element | undefined {
  const scope = node.closest("article, main") ?? node.ownerDocument.body;
  return Array.from(scope.querySelectorAll("h1, h2, h3, h4, h5, h6"))
    .filter((heading) => heading.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)
    .at(-1);
}

function named(kind: string, topic: string): string {
  return topic ? `${kind}: ${topic}` : kind;
}

function baseName(region: HTMLElement): string {
  if (region.dataset.scrollRegion) return region.dataset.scrollRegion;
  if (region.matches(".table-scroll")) {
    return named("Table", textOf(region.querySelector("caption")) || textOf(headingBefore(region)));
  }
  const block = region.parentElement?.classList.contains("codeblock") ? region.parentElement : region;
  const label = block.previousElementSibling?.classList.contains("codelabel") ? block.previousElementSibling : null;
  return named("Code", textOf(label) || textOf(headingBefore(region)));
}

function uniqueNames(regions: HTMLElement[]): Map<HTMLElement, string> {
  const uses = new Map<string, number>();
  return new Map(
    regions.map((region) => {
      const base = baseName(region);
      const use = (uses.get(base) ?? 0) + 1;
      uses.set(base, use);
      return [region, use === 1 ? base : `${base} (${use})`];
    })
  );
}

function scrolls(region: HTMLElement): boolean {
  const style = getComputedStyle(region);
  const scrollable = (overflow: string) => overflow === "auto" || overflow === "scroll";
  return (
    (scrollable(style.overflowX) && region.scrollWidth > region.clientWidth) ||
    (scrollable(style.overflowY) && region.scrollHeight > region.clientHeight)
  );
}

function markWhileItScrolls(region: HTMLElement, name: string) {
  const authored = !regionsWeMarked.has(region) && region.hasAttribute("role");
  if (authored) return;
  if (scrolls(region)) {
    region.tabIndex = 0;
    region.setAttribute("role", "region");
    region.setAttribute("aria-label", name);
    regionsWeMarked.add(region);
  } else if (regionsWeMarked.has(region)) {
    region.removeAttribute("tabindex");
    region.removeAttribute("role");
    region.removeAttribute("aria-label");
    regionsWeMarked.delete(region);
  }
}

export function makeScrollRegions(container: HTMLElement): () => void {
  const regions = [
    ...(container.matches(SCROLLERS) ? [container] : []),
    ...container.querySelectorAll<HTMLElement>(SCROLLERS),
  ];
  const names = uniqueNames(regions);
  let watching = true;
  const update = () => {
    if (watching) regions.forEach((region) => markWhileItScrolls(region, names.get(region)!));
  };

  update();
  const resizes = new ResizeObserver(update);
  for (const region of regions) {
    resizes.observe(region);
    if (region.firstElementChild) resizes.observe(region.firstElementChild);
  }
  document.fonts.ready.then(update);

  return () => {
    watching = false;
    resizes.disconnect();
  };
}

export function useScrollRegions(ref: RefObject<HTMLElement | null>, content: unknown) {
  useEffect(() => {
    if (!ref.current) return;
    return makeScrollRegions(ref.current);
  }, [ref, content]);
}
