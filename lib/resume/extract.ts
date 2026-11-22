import { docxText } from "./docx";

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_PAGES = 4;

export interface Extracted {
  lines: string[];
  links: string[];
  pages: number;
  wideGaps: number;
}

export class ExtractError extends Error {}

export function fileKind(file: { name: string; type: string }): "pdf" | "docx" | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  return null;
}

interface Piece {
  x: number;
  y: number;
  end: number;
  size: number;
  text: string;
}

function rows(pieces: Piece[]): { lines: string[]; wide: number } {
  const sorted = [...pieces].sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: Piece[][] = [];
  for (const piece of sorted) {
    const last = groups[groups.length - 1];
    if (last && Math.abs(last[0].y - piece.y) <= Math.max(2, last[0].size * 0.45)) last.push(piece);
    else groups.push([piece]);
  }
  const lines: string[] = [];
  let wide = 0;
  for (const group of groups) {
    group.sort((a, b) => a.x - b.x);
    let line = "";
    let lastEnd = -Infinity;
    for (const piece of group) {
      const gap = piece.x - lastEnd;
      if (line && gap > Math.max(36, piece.size * 3)) {
        lines.push(line);
        line = "";
        wide += 1;
      } else if (line && gap > piece.size * 0.15 && !line.endsWith(" ") && !piece.text.startsWith(" ")) {
        line += " ";
      }
      line += piece.text;
      lastEnd = piece.end;
    }
    if (line.trim()) lines.push(line);
  }
  return { lines, wide };
}

let worker: Worker | null = null;

async function readPdf(buffer: ArrayBuffer): Promise<Extracted> {
  const pdfjs = await import("pdfjs-dist");
  if (!worker) {
    worker = new Worker(new URL("./pdfWorker.ts", import.meta.url), { type: "module" });
    pdfjs.GlobalWorkerOptions.workerPort = worker;
  }
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWasm: false,
    disableFontFace: true,
    stopAtErrors: false,
  });
  let doc;
  try {
    doc = await task.promise;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    throw new ExtractError(
      /password/i.test(message)
        ? "This PDF is password protected. Save a copy without a password and upload that."
        : "This PDF could not be opened. Export it again from your editor and try once more."
    );
  }
  try {
    if (doc.numPages > MAX_PAGES) {
      throw new ExtractError(`This PDF has ${doc.numPages} pages. Upload a resume of ${MAX_PAGES} pages or fewer.`);
    }
    const lines: string[] = [];
    const links: string[] = [];
    let wideGaps = 0;
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const content = await page.getTextContent();
      const pieces: Piece[] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        const [, , , d, x, y] = item.transform as number[];
        pieces.push({ x, y, end: x + item.width, size: Math.abs(d) || item.height || 10, text: item.str });
      }
      const page_ = rows(pieces);
      lines.push(...page_.lines);
      wideGaps += page_.wide;
      const annotations = await page.getAnnotations();
      for (const note of annotations) {
        const url = typeof note.url === "string" ? note.url : "";
        if (/^https?:\/\//i.test(url)) links.push(url);
      }
      page.cleanup();
    }
    return { lines, links, pages: doc.numPages, wideGaps };
  } finally {
    void task.destroy();
  }
}

async function readDocx(buffer: ArrayBuffer): Promise<Extracted> {
  const { unzipSync, strFromU8 } = await import("fflate");
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(buffer), {
      filter: (file) =>
        file.name === "word/document.xml" ||
        file.name === "word/_rels/document.xml.rels" ||
        file.name === "docProps/app.xml",
    });
  } catch {
    throw new ExtractError("This Word file could not be opened. Save it again as .docx and try once more.");
  }
  const main = files["word/document.xml"];
  if (!main) throw new ExtractError("This does not look like a Word document. Upload a .docx or a PDF.");
  const read = docxText(
    strFromU8(main),
    files["word/_rels/document.xml.rels"] ? strFromU8(files["word/_rels/document.xml.rels"]) : "",
    files["docProps/app.xml"] ? strFromU8(files["docProps/app.xml"]) : ""
  );
  if (read.pages > MAX_PAGES) {
    throw new ExtractError(`This document has ${read.pages} pages. Upload a resume of ${MAX_PAGES} pages or fewer.`);
  }
  return { lines: read.lines, links: read.links, pages: read.pages, wideGaps: read.tables > 0 ? 8 : 0 };
}

export async function extractFile(file: File): Promise<Extracted> {
  const kind = fileKind(file);
  if (!kind) throw new ExtractError("Upload a PDF or a Word (.docx) file.");
  if (file.size > MAX_FILE_BYTES) throw new ExtractError("That file is over 2 MB. A resume is usually under 300 KB.");
  const buffer = await file.arrayBuffer();
  return kind === "pdf" ? readPdf(buffer) : readDocx(buffer);
}
