export function probeComposition(): string[] {
  const found: string[] = [];
  const COMPOSE_TILTS = [-1.2, 0, 1.2];
  const COMPOSE_TONES = ["paper", "note", "alert", "draft", "ghost"];
  const PHONE = window.innerWidth <= 720;
  const ATTACHED = "[data-tape], [data-sticker], [data-note], [data-join]";

  const shown = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const hit = (a: DOMRect, b: DOMRect, slack = 0) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > slack &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > slack;
  const shrink = (r: DOMRect, by: number) =>
    new DOMRect(r.left + by, r.top + by, Math.max(0, r.width - 2 * by), Math.max(0, r.height - 2 * by));
  const degrees = (el: Element) => {
    const value = getComputedStyle(el).rotate;
    return value === "none" ? 0 : parseFloat(value);
  };
  const textRects = (card: Element) => {
    const rects: DOMRect[] = [];
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const own = node.parentElement;
      if (!own || !node.textContent?.trim() || own.closest(ATTACHED) || !shown(own)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) if (rect.width > 0 && rect.height > 0) rects.push(rect);
    }
    return rects;
  };
  const channels = (colour: string) => {
    const numbers = colour.match(/-?[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    const scale = colour.startsWith("color(") ? 255 : 1;
    return numbers.slice(0, 3).map((n) => n * scale);
  };

  for (const stage of document.querySelectorAll<HTMLElement>("[data-stage][data-layout]")) {
    if (!shown(stage)) continue;
    const label = `${location.pathname} ${stage.dataset.layout}`;
    const box = stage.getBoundingClientRect();
    const cards = [...stage.querySelectorAll<HTMLElement>("[data-card]")].filter(shown);
    const tapes = [...stage.querySelectorAll<HTMLElement>("[data-tape]")].filter(shown);
    const stickers = [...stage.querySelectorAll<HTMLElement>("[data-sticker]")].filter(shown);
    const notes = [...stage.querySelectorAll<HTMLElement>("[data-note]")].filter(shown);
    const joins = [...stage.querySelectorAll<HTMLElement>("[data-join]")].filter(shown);

    const hero = stage.closest("[data-scene-root]")?.getBoundingClientRect();
    if (hero && (box.top < hero.top - 1 || box.bottom > hero.bottom + 1)) found.push(`${label}: stage leaves its hero`);
    if (document.documentElement.scrollWidth > window.innerWidth) found.push(`${label}: sideways scroll`);

    for (const el of [...cards, ...tapes, ...stickers, ...notes]) {
      const r = el.getBoundingClientRect();
      if (r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1)
        found.push(`${label}: ${el.tagName.toLowerCase()}[${Object.keys(el.dataset).join(",")}] leaves the stage box`);
    }

    for (const card of cards) {
      const tilt = degrees(card);
      const allowed = PHONE ? Math.abs(tilt) <= 0.75 : COMPOSE_TILTS.some((t) => Math.abs(t - tilt) < 0.05);
      if (!allowed) found.push(`${label}: a card is tilted ${tilt}deg`);
      if (!COMPOSE_TONES.includes(card.dataset.tone ?? "")) found.push(`${label}: unknown tone ${card.dataset.tone}`);
      const inner = card.getBoundingClientRect();
      for (const el of card.querySelectorAll<HTMLElement>("*")) {
        if (el.closest(ATTACHED) || !shown(el)) continue;
        const r = el.getBoundingClientRect();
        if (
          r.bottom > inner.bottom + 4 ||
          r.right > inner.right + 4 ||
          r.left < inner.left - 4 ||
          r.top < inner.top - 4
        )
          found.push(`${label}: ${el.tagName.toLowerCase()} spills out of its card`);
      }
      const [red, green, blue] = channels(getComputedStyle(card).backgroundColor);
      const dark = (red + green + blue) / 3 < 90;
      const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
      const hex = getComputedStyle(card).getPropertyValue("--sheet").trim().replace("#", "");
      const [sr, sg, sb] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      const tint = spread - (Math.max(sr, sg, sb) - Math.min(sr, sg, sb));
      if (dark && card.dataset.tone !== "alert" && tint > 22) found.push(`${label}: a dark card is tinted (${tint})`);
    }

    for (let i = 0; i < cards.length; i++)
      for (let j = i + 1; j < cards.length; j++)
        if (hit(cards[i].getBoundingClientRect(), cards[j].getBoundingClientRect(), 2))
          found.push(`${label}: two cards overlap`);

    for (const tape of tapes) {
      const host = tape.closest("[data-card]");
      if (!host) {
        found.push(`${label}: tape without a card`);
        continue;
      }
      const flat = shrink(tape.getBoundingClientRect(), 3);
      const hostBox = host as HTMLElement;
      if (Math.abs(tape.offsetLeft - hostBox.clientWidth / 2) > 3) found.push(`${label}: tape off centre`);
      if (textRects(host).some((rect) => hit(rect, flat))) found.push(`${label}: tape covers text`);
      if (stickers.some((sticker) => hit(sticker.getBoundingClientRect(), flat)))
        found.push(`${label}: tape under a sticker`);
      if (host.querySelectorAll("[data-tape]").length > 1) found.push(`${label}: two tapes on one card`);
    }

    for (let i = 0; i < stickers.length; i++)
      for (let j = i + 1; j < stickers.length; j++)
        if (hit(stickers[i].getBoundingClientRect(), stickers[j].getBoundingClientRect()))
          found.push(`${label}: two stickers overlap`);

    for (const sticker of stickers) {
      const host = sticker.closest("[data-card]");
      if (!host) {
        found.push(`${label}: sticker without a card`);
        continue;
      }
      const r = sticker.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      if (textRects(host).some((rect) => hit(rect, shrink(r, 1)))) found.push(`${label}: sticker covers text`);
      if (r.top > h.top - 4 && r.bottom < h.bottom + 4) found.push(`${label}: sticker is not on a card edge`);
      if (r.left < h.left - 24 || r.right > h.right + 24) found.push(`${label}: sticker hangs off its card`);
    }

    for (const note of notes) {
      const host = note.parentElement;
      const arrow = note.querySelector<SVGElement>("[data-arrow]");
      if (!host || !host.matches("[data-card]") || !arrow) {
        found.push(`${label}: note without a card or an arrow`);
        continue;
      }
      const drop = note.offsetTop - host.clientHeight;
      if (note.offsetParent !== host || Math.abs(drop) > 3)
        found.push(`${label}: note arrow is ${drop}px from its card edge`);
      const a = arrow.getBoundingClientRect();
      const h = host.getBoundingClientRect();
      if (a.left < h.left - 2 || a.right > h.right + 2) found.push(`${label}: note arrow is outside its card`);
      for (const other of cards)
        if (other !== host && hit(note.getBoundingClientRect(), other.getBoundingClientRect(), 1))
          found.push(`${label}: note runs into a card`);
    }

    for (const join of joins) {
      const host = join.parentElement!.getBoundingClientRect();
      const r = join.getBoundingClientRect();
      const dir = PHONE ? "down" : join.dataset.join;
      const middle = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const edge = { right: [host.right, r.left], left: [host.left, r.right], down: [host.bottom, r.top] }[
        dir ?? "down"
      ] ?? [0, 99];
      const meets = cards.filter((card) => {
        const c = card.getBoundingClientRect();
        if (card === join.parentElement) return false;
        if (dir === "right") return Math.abs(c.left - r.right) <= 4 && middle.y > c.top && middle.y < c.bottom;
        if (dir === "left") return Math.abs(c.right - r.left) <= 4 && middle.y > c.top && middle.y < c.bottom;
        return Math.abs(c.top - r.bottom) <= 4 && middle.x > c.left && middle.x < c.right;
      });
      if (meets.length !== 1 || Math.abs(edge[0] - edge[1]) > 4)
        found.push(`${label}: a connector does not run edge to edge`);
    }

    for (const table of stage.querySelectorAll<HTMLElement>("[data-facts]")) {
      const values = [...table.querySelectorAll<HTMLElement>("dd")];
      const names = [...table.querySelectorAll<HTMLElement>("dt")];
      const rights = values.map((el) => el.offsetLeft + el.offsetWidth);
      const lefts = names.map((el) => el.offsetLeft);
      if (Math.max(...rights) - Math.min(...rights) > 1.5) found.push(`${label}: figures are not right-aligned`);
      if (Math.max(...lefts) - Math.min(...lefts) > 1.5) found.push(`${label}: figure labels do not start at one x`);
      const base = (el: HTMLElement) => {
        const probe = document.createElement("span");
        probe.style.cssText = "display:inline-block;width:0;height:0";
        el.prepend(probe);
        const y = probe.offsetTop;
        probe.remove();
        return y;
      };
      values.forEach((value, i) => {
        if (Math.abs(base(value) - base(names[i])) > 1)
          found.push(`${label}: a figure and its label sit on different baselines`);
      });
    }

    const at = (slot: string) => stage.querySelector<HTMLElement>(`[data-at="${slot}"]`)?.getBoundingClientRect();
    const [a, b, c, d] = ["a", "b", "c", "d"].map(at);
    const layout = stage.dataset.layout;
    const level = (x: DOMRect | undefined, y: DOMRect | undefined, what: string, edge: "left" | "top" | "bottom") => {
      if (x && y && Math.abs(x[edge] - y[edge]) > 10) found.push(`${label}: ${what} are not aligned`);
    };
    if (PHONE) {
      const column = cards.map((el) => el.getBoundingClientRect());
      if (column.some((r) => Math.abs(r.left - column[0].left) > 8))
        found.push(`${label}: phone cards are not one column`);
    } else if (layout === "banner" && a && b && c) {
      const across = c.left - b.right;
      if (across < 6) found.push(`${label}: columns touch`);
      level(b, c, "second-row tops", "top");
      level(b, c, "bottom edges", "bottom");
      const below = b.top - a.bottom;
      if (below < 6 || Math.abs(below - across) > 12) found.push(`${label}: gutters are uneven`);
    } else if (a && b && layout !== "stack" && layout !== "banner") {
      const across = b.left - a.right;
      if (across < 6) found.push(`${label}: columns touch`);
      level(a, b, "first-row tops", "top");
      if (layout === "trio" || layout === "quad") level(a, c, "left edges", "left");
      if (layout === "loop") {
        level(a, d, "left edges", "left");
        level(b, c, "right column edges", "left");
      }
      if (layout === "rail") level(b, c, "right column edges", "left");
      if (layout === "trio" && c) {
        const below = c.top - a.bottom;
        if (below < 6 || Math.abs(below - across) > 12) found.push(`${label}: gutters are uneven`);
        level(b, c, "bottom edges", "bottom");
      }
    }
  }
  return found;
}
