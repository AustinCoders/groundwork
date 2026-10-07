import { describe, expect, it } from "vitest";
import { chapters, topics } from "@/lib/content";
import { splitIslands } from "@/lib/chapterIslands";

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

function withoutOpaque(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/g, "<script></script>")
    .replace(/<style\b[\s\S]*?<\/style>/g, "<style></style>");
}

function unbalancedAt(html: string): string | null {
  const stack: string[] = [];
  for (const tag of withoutOpaque(html).matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g)) {
    const [, closing, name, selfClosing] = tag;
    const lower = name.toLowerCase();
    if (VOID.has(lower) || selfClosing) continue;
    if (!closing) stack.push(lower);
    else if (stack.pop() !== lower) return `unexpected </${lower}>`;
  }
  return stack.length ? `unclosed <${stack.at(-1)}>` : null;
}

const placeholder = (id: string) => `<div data-play="${id}"></div>`;

describe("splitIslands", () => {
  it("splits one placeholder into html, island, html", () => {
    expect(splitIslands(`<p>a</p>${placeholder("binary-search")}<p>b</p>`)).toEqual([
      { kind: "html", html: "<p>a</p>" },
      { kind: "island", id: "binary-search", input: null },
      { kind: "html", html: "<p>b</p>" },
    ]);
  });

  it("splits two placeholders into three html segments around two islands, in order", () => {
    const segments = splitIslands(`<p>a</p>${placeholder("one")}<p>b</p>${placeholder("two")}<p>c</p>`)!;
    expect(segments.map((s) => (s.kind === "island" ? s.id : s.html))).toEqual([
      "<p>a</p>",
      "one",
      "<p>b</p>",
      "two",
      "<p>c</p>",
    ]);
  });

  it("returns null when there is no placeholder", () => {
    expect(splitIslands("<p>plain</p>")).toBeNull();
  });

  it("reads an input attribute", () => {
    expect(splitIslands(`<div data-play="x" data-input='[1,2]'></div>`)).toEqual([
      { kind: "island", id: "x", input: "[1,2]" },
    ]);
  });

  it("leaves unsafe ids as plain html", () => {
    expect(splitIslands(`<div data-play="a b"></div>`)).toBeNull();
    expect(splitIslands(`<div data-play="a&quot;b"></div>`)).toBeNull();
    expect(splitIslands(`<div data-play=""></div>`)).toBeNull();
  });
});

describe("chapter islands in the real content", () => {
  const all = topics().flatMap((t) =>
    chapters(t.id)
      .filter((c) => c.ready)
      .map((c) => ({ topicId: t.id, chapter: c }))
  );

  it("has the tracer placeholder in the binary search chapter", () => {
    const tracer = all.find(({ chapter }) => chapter.id === "dsa-binary-search")!;
    expect(splitIslands(tracer.chapter.body)).not.toBeNull();
  });

  it("keeps every placeholder top-level and every segment balanced", () => {
    for (const { topicId, chapter } of all) {
      const body = chapter.body;
      const segments = splitIslands(body);
      const placeholders = (body.match(/<[a-z]+\s[^>]*data-play=/gi) ?? []).length;
      const islands = (segments ?? []).filter((segment) => segment.kind === "island").length;
      expect(placeholders, `${topicId}/${chapter.id} has a data-play that is not a valid placeholder`).toBe(islands);
      if (!segments) continue;
      for (const segment of segments) {
        if (segment.kind === "html") {
          expect(unbalancedAt(segment.html), `${topicId}/${chapter.id} would split mid-element`).toBeNull();
        }
      }
      expect(unbalancedAt(body), `${topicId}/${chapter.id} is unbalanced`).toBeNull();
    }
  });
});
