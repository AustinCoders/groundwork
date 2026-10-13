import Link from "next/link";
import type { ShellTool } from "./types";
import styles from "./shell.module.css";

export function ToolsRow({ tools, label }: { tools: ShellTool[]; label: string }) {
  if (tools.length === 0) return null;
  return (
    <nav className={styles.tools} aria-label={label}>
      <ul className={styles.toolList}>
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link className={styles.tool} href={tool.href} prefetch={false} data-tool={tool.id}>
              <span className={styles.toolName}>{tool.label}</span>
              {tool.count && <span className={styles.toolCount}>{tool.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
