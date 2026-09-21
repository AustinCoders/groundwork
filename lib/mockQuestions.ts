import { chapter } from "@/lib/content";

export type MockLevel = "fresher" | "mid" | "senior" | "drill";

export interface MockQuestion {
  id: string;
  source: "js" | "react";
  level: MockLevel;
  questionHtml: string;
  answerHtml: string;
  href: string;
}

const SOURCES = [
  { source: "js" as const, topic: "js", chapterId: "interview-bank", href: "/notes/interview-bank" },
  { source: "react" as const, topic: "react", chapterId: "react-interview-bank", href: "/react/react-interview-bank" },
];

function levelOf(heading: string): MockLevel {
  const h = heading.toLowerCase();
  if (h.startsWith("fresher")) return "fresher";
  if (h.startsWith("mid")) return "mid";
  if (h.startsWith("senior")) return "senior";
  if (h.startsWith("output")) return "drill";
  return "mid";
}

export function parseBank(html: string, source: "js" | "react", href: string): MockQuestion[] {
  const out: MockQuestion[] = [];
  const sections = html.split(/<h3>/).slice(1);
  for (const section of sections) {
    const end = section.indexOf("</h3>");
    const heading = section.slice(0, end).replace(/&mdash;/g, "-");
    const level = levelOf(heading);
    if (!/^(fresher|mid|senior|output)/i.test(heading)) continue;
    const pieces = section.slice(end).split('<div class="qa">').slice(1);
    for (const piece of pieces) {
      const body = piece.slice(0, piece.lastIndexOf("</div>"));
      const q = body.match(/<p class="q">([\s\S]*?)<\/p>/);
      if (!q) continue;
      out.push({
        id: `${source}-${out.length}`,
        source,
        level,
        questionHtml: q[1].trim(),
        answerHtml: body.slice(body.indexOf(q[0]) + q[0].length).trim(),
        href,
      });
    }
  }
  return out;
}

export function mockQuestions(): MockQuestion[] {
  return SOURCES.flatMap(({ source, topic, chapterId, href }) => {
    const ch = chapter(chapterId, topic);
    return ch ? parseBank(ch.body, source, href) : [];
  });
}
