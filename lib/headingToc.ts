export interface TocItem {
  id: string;
  text: string;
}

function slug(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>();
  const out = html.replace(/<h3(\s[^>]*)?>([\s\S]*?)<\/h3>/g, (_, attrs: string | undefined, inner: string) => {
    let id = slug(inner) || "section";
    while (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    const text = inner
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&rarr;/g, "→")
      .replace(/&mdash;/g, "—")
      .replace(/&middot;/g, "·")
      .replace(/&[a-z]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    toc.push({ id, text });
    const rest = (attrs ?? "").replace(/\sid="[^"]*"/, "");
    return `<h3 id="${id}"${rest}>${inner}</h3>`;
  });
  return { html: out, toc };
}
