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

const TABLE = /(<div class="table-scroll">\s*)?(<table(?:\s[^>]*)?>[\s\S]*?<\/table>)/g;

function scrollTables(html: string): string {
  return html.replace(TABLE, (whole, wrapped: string | undefined, table: string) =>
    wrapped ? whole : `<div class="table-scroll">${table}</div>`
  );
}

const SUBSECTION = /<h4(\s[^>]*)?>([\s\S]*?)<\/h4>/g;

function demoteSubsections(html: string): string {
  return html.replace(SUBSECTION, (_, attrs: string | undefined, inner: string) => {
    const rest = attrs ?? "";
    const marked = /\sclass="/.test(rest) ? rest.replace(/\sclass="/, ' class="subhead ') : `${rest} class="subhead"`;
    return `<h3${marked}>${inner}</h3>`;
  });
}

export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>(["chapters", "check"]);
  const sections = scrollTables(html).replace(
    /<h3(\s[^>]*)?>([\s\S]*?)<\/h3>/g,
    (_, attrs: string | undefined, inner: string) => {
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
      return `<h2 id="${id}"${rest}>${inner}</h2>`;
    }
  );
  return { html: demoteSubsections(sections), toc };
}
