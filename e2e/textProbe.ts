export interface TextProblem {
  kind: "covered" | "clipped";
  text: string;
  by: string;
}

export function probeText(roots: string[]): TextProblem[] {
  const style = document.createElement("style");
  style.textContent = "* { pointer-events: auto !important; }";
  document.head.append(style);
  const problems: TextProblem[] = [];
  const describe = (el: Element) =>
    `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0].replace(/^.*__/, "")}`;
  const hidden = (el: Element) => {
    for (let node: Element | null = el; node; node = node.parentElement) {
      const css = getComputedStyle(node);
      if (css.display === "none" || css.visibility === "hidden" || Number(css.opacity) < 0.05) return true;
      if (node.hasAttribute("inert") && !node.closest("[data-active]")) return true;
    }
    return false;
  };
  for (const selector of roots) {
    for (const root of document.querySelectorAll(selector)) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const own = node.parentElement;
        const text = node.textContent?.trim() ?? "";
        if (!own || !text || hidden(own) || own.closest(".visually-hidden")) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const clamped = getComputedStyle(own).webkitLineClamp !== "none";
        const shown = own.getBoundingClientRect();
        for (const box of range.getClientRects()) {
          if (box.width < 2 || box.height < 2) continue;
          if (clamped && box.top + box.height / 2 >= shown.bottom) continue;
          const y = box.top + box.height / 2;
          for (const x of [box.left + 2, box.left + box.width / 2, box.right - 2]) {
            const hit = document.elementFromPoint(x, y);
            if (!hit || own.contains(hit) || hit.contains(own) || hidden(hit)) continue;
            problems.push({ kind: "covered", text: text.slice(0, 40), by: describe(hit) });
            break;
          }
          if (clamped) continue;
          for (let up: Element | null = own; up && up !== root; up = up.parentElement) {
            const css = getComputedStyle(up);
            if (css.overflowX === "visible" && css.overflowY === "visible") continue;
            const clip = up.getBoundingClientRect();
            if (
              box.left < clip.left - 1 ||
              box.right > clip.right + 1 ||
              box.top < clip.top - 1 ||
              box.bottom > clip.bottom + 1
            ) {
              problems.push({ kind: "clipped", text: text.slice(0, 40), by: describe(up) });
              break;
            }
          }
        }
      }
    }
  }
  style.remove();
  return problems;
}
