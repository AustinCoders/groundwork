"use client";

import { useState, type ReactNode } from "react";
import styles from "./coding.module.css";

export function CodeBlock({ text, title, children }: { text: string; title: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.code}>
      <div className={styles.codeBar}>
        <span aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <b>{title}</b>
        <button type="button" onClick={copy} aria-live="polite">
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
