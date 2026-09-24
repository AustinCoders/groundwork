import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const FIX = process.argv.includes("--fix");

const KEEP =
  /^(?:\/\/|\/\*)\s*(?:eslint-(?:disable|enable)|@ts-(?:expect-error|ignore|nocheck)|webpack[A-Z]|turbopackIgnore|@vite-ignore|prettier-ignore|cspell:|istanbul |c8 |@vitest-|@jsx|[#@]__PURE__)|^\/\/\/\s*<reference/;

const SOURCE = /\.(?:ts|tsx|js|jsx|mjs|cjs|css)$/;
const SKIP = /^(?:public|docs|node_modules|\.next)\//;

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { encoding: "utf8" });
  return out.split("\n").filter((f) => SOURCE.test(f) && !SKIP.test(f));
}

function scriptKind(file) {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.(?:js|mjs|cjs)$/.test(file)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

export function scriptComments(file, text) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
  const found = new Map();
  const literal = [];
  const emptyJsx = [];

  const LITERALS = new Set([
    ts.SyntaxKind.StringLiteral,
    ts.SyntaxKind.NoSubstitutionTemplateLiteral,
    ts.SyntaxKind.TemplateHead,
    ts.SyntaxKind.TemplateMiddle,
    ts.SyntaxKind.TemplateTail,
    ts.SyntaxKind.RegularExpressionLiteral,
    ts.SyntaxKind.JsxText,
    ts.SyntaxKind.JsxTextAllWhiteSpaces,
  ]);

  const collect = (pos, end) => {
    if (!found.has(pos)) found.set(pos, { pos, end });
  };

  function visit(node) {
    if (LITERALS.has(node.kind))
      literal.push([node.kind === ts.SyntaxKind.JsxText ? node.pos : node.getStart(sf), node.end]);
    if (ts.isJsxExpression(node) && !node.expression) emptyJsx.push([node.getStart(sf), node.end]);
    ts.forEachLeadingCommentRange(text, node.pos, collect);
    ts.forEachTrailingCommentRange(text, node.end, collect);
    for (const child of node.getChildren(sf)) visit(child);
  }
  visit(sf);

  const inLiteral = (r) => literal.some(([s, e]) => r.pos < e && r.end > s);
  const comments = [...found.values()].filter((r) => !inLiteral(r) && text.slice(r.pos, r.pos + 1) === "/");

  const removals = [];
  for (const [s, e] of emptyJsx) {
    const inner = text.slice(s + 1, e - 1);
    const covered = comments.filter((c) => c.pos >= s && c.end <= e).sort((a, b) => a.pos - b.pos);
    if (!covered.length) continue;
    const rest = covered.reduceRight((acc, c) => acc.slice(0, c.pos - s - 1) + acc.slice(c.end - s - 1), inner);
    const keep = covered.some((c) => KEEP.test(text.slice(c.pos, c.end)));
    if (!rest.trim() && !keep) {
      removals.push({ pos: s, end: e, text: text.slice(s, e) });
      for (const c of covered) c.consumed = true;
    }
  }
  for (const c of comments) {
    if (c.consumed) continue;
    const body = text.slice(c.pos, c.end);
    if (!KEEP.test(body)) removals.push({ pos: c.pos, end: c.end, text: body });
  }
  return removals;
}

export function cssComments(text) {
  const removals = [];
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      const stop = end === -1 ? text.length : end + 2;
      const body = text.slice(i, stop);
      if (!/^\/\*[!]|^\/\*\s*(?:stylelint-|prettier-ignore)/.test(body))
        removals.push({ pos: i, end: stop, text: body });
      i = stop - 1;
    }
  }
  return removals;
}

export function strip(text, removals) {
  let out = text;
  for (const r of [...removals].sort((a, b) => b.pos - a.pos)) {
    let start = r.pos;
    let end = r.end;
    const lineStart = out.lastIndexOf("\n", start - 1) + 1;
    const nextBreak = out.indexOf("\n", end);
    const lineEnd = nextBreak === -1 ? out.length : nextBreak;
    const before = out.slice(lineStart, start);
    const after = out.slice(end, lineEnd);
    if (!before.trim() && !after.trim()) {
      start = lineStart;
      end = nextBreak === -1 ? lineEnd : lineEnd + 1;
    } else if (!after.trim()) {
      start = lineStart + before.replace(/\s+$/, "").length;
    }
    out = out.slice(0, start) + out.slice(end);
  }
  return out;
}

function main() {
  const problems = [];
  const changed = [];
  for (const file of trackedFiles()) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const removals = file.endsWith(".css") ? cssComments(text) : scriptComments(file, text);
    if (!removals.length) continue;
    if (FIX) {
      writeFileSync(file, strip(text, removals));
      changed.push(file);
      continue;
    }
    for (const r of removals) {
      const line = text.slice(0, r.pos).split("\n").length;
      problems.push(`${file}:${line}  ${r.text.split("\n")[0].slice(0, 90)}`);
    }
  }

  if (FIX) {
    if (changed.length)
      execFileSync("npx", ["prettier", "--write", "--log-level", "warn", ...changed], { stdio: "inherit" });
    console.log(`Removed comments from ${changed.length} files.`);
  } else if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} comments found. This project keeps code free of comments;`);
    console.error(
      "remove them, or run `npm run comments:fix`. Tool directives (eslint-disable, @ts-expect-error, webpackIgnore…) are allowed."
    );
    process.exitCode = 1;
  } else {
    console.log("No comments found.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
