const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const value = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

export interface DocxText {
  lines: string[];
  links: string[];
  tables: number;
  pages: number;
}

export function docxText(documentXml: string, relsXml = "", appXml = ""): DocxText {
  const lines: string[] = [];
  const body = documentXml.replace(/<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/g, "");
  const paragraphs = body.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) ?? [];
  for (const paragraph of paragraphs) {
    const listed = /<w:numPr>/.test(paragraph);
    const text = paragraph
      .replace(/<w:tab\/>/g, " ")
      .replace(/<w:br[^>]*\/>/g, "\n")
      .match(/<w:t(?:\s[^>]*)?>[^<]*<\/w:t>|\n/g)
      ?.map((piece) => (piece === "\n" ? "\n" : decode(piece.replace(/<[^>]+>/g, ""))))
      .join("");
    if (!text) continue;
    for (const part of text.split("\n")) {
      const line = part.replace(/\s+/g, " ").trim();
      if (line) lines.push(listed ? `• ${line}` : line);
    }
  }
  const links = [...relsXml.matchAll(/<Relationship\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => /TargetMode="External"/.test(tag) && /hyperlink/.test(tag))
    .map((tag) => decode(tag.match(/Target="([^"]+)"/)?.[1] ?? ""))
    .filter((url) => /^https?:\/\//i.test(url));
  const tables = (body.match(/<w:tbl>/g) ?? []).length;
  const pages =
    Number(appXml.match(/<Pages>(\d+)<\/Pages>/)?.[1] ?? 0) ||
    Math.max(1, Math.ceil(lines.join(" ").split(/\s+/).length / 550));
  return { lines, links, tables, pages };
}
