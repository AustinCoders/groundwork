import { describe, expect, it } from "vitest";
import { cssComments, scriptComments, strip } from "../scripts/comments.mjs";

type Removal = { pos: number; end: number; text: string };
const fix = (file: string, text: string) =>
  strip(text, (file.endsWith(".css") ? cssComments(text) : scriptComments(file, text)) as Removal[]);

describe("the comment check", () => {
  it("removes line, block and trailing comments, with the lines they sat on", () => {
    const code = "// top\nconst a = 1; // trailing\n/** doc */\nfunction f() {\n  /* inside */\n  return a;\n}\n";
    expect(fix("x.ts", code)).toBe("const a = 1;\nfunction f() {\n  return a;\n}\n");
  });

  it("leaves strings, templates and regexes alone", () => {
    const code = 'const url = "http://x.dev/*not*/";\nconst t = `// kept\n/* kept */`;\nconst r = /\\/\\/+/g;\n';
    expect(fix("x.ts", code)).toBe(code);
  });

  it("keeps the directives tools read", () => {
    const code =
      "// eslint-disable-next-line no-console -- demo\nconsole.log(1);\n// @ts-expect-error -- demo\nconst x: number = '';\nimport(/* webpackIgnore: true */ 'x');\n";
    expect(fix("x.ts", code)).toBe(code);
  });

  it("removes a JSX comment with its braces but not text that looks like one", () => {
    const code = "const el = (\n  <div>\n    {/* note */}\n    <p>// shown to the reader</p>\n  </div>\n);\n";
    expect(fix("x.tsx", code)).toBe("const el = (\n  <div>\n    <p>// shown to the reader</p>\n  </div>\n);\n");
  });

  it("removes CSS comments but not ones inside strings", () => {
    const css = '/* heading */\na::after {\n  content: "/* not me */"; /* trailing */\n}\n';
    expect(fix("x.css", css)).toBe('a::after {\n  content: "/* not me */";\n}\n');
  });
});
