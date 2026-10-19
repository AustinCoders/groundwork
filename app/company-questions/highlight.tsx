import type { ReactNode } from "react";
import styles from "./coding.module.css";

const KEYWORDS = new Set([
  "function",
  "return",
  "const",
  "let",
  "var",
  "if",
  "else",
  "for",
  "while",
  "of",
  "in",
  "new",
  "class",
  "constructor",
  "this",
  "null",
  "undefined",
  "true",
  "false",
  "break",
  "continue",
  "switch",
  "case",
  "throw",
  "typeof",
  "static",
  "do",
]);

const TOKEN = /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*)/g;

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(TOKEN)) {
    const text = match[0];
    const at = match.index ?? 0;
    if (at > last) out.push(code.slice(last, at));
    const after = code[at + text.length];
    let className: string | undefined;
    if (text.startsWith("//")) className = styles.tokComment;
    else if (/^["'`]/.test(text)) className = styles.tokString;
    else if (/^\d/.test(text)) className = styles.tokNumber;
    else if (KEYWORDS.has(text)) className = styles.tokKeyword;
    else if (after === "(") className = styles.tokFn;
    out.push(
      className ? (
        <span key={key++} className={className}>
          {text}
        </span>
      ) : (
        text
      )
    );
    last = at + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
