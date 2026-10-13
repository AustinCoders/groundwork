import Link from "next/link";
import type { ShellTool, ToolGlyph } from "./types";
import styles from "./shell.module.css";

const GLYPHS: Record<ToolGlyph, string> = {
  pencil: "M4 20l4-1 11-11-3-3L5 16l-1 4zM14 7l3 3",
  loop: "M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4",
  chat: "M4 5h16v10H9l-5 4V5z",
  note: "M6 4h12v16H6zM9 9h6M9 13h6",
};

function Glyph({ name }: { name: ToolGlyph }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.glyph} aria-hidden="true" focusable="false">
      <path d={GLYPHS[name]} />
    </svg>
  );
}

export function ToolsRow({ tools, label }: { tools: ShellTool[]; label: string }) {
  if (tools.length === 0) return null;
  return (
    <nav className={styles.tools} aria-label={label}>
      <ul className={styles.toolList}>
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link className={styles.tool} href={tool.href} prefetch={false} data-tool={tool.id}>
              <span className={styles.toolIcon}>
                <Glyph name={tool.glyph} />
              </span>
              <span className={styles.toolText}>
                <span className={styles.toolName}>{tool.label}</span>
                {tool.count && <span className={styles.toolCount}>{tool.count}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
