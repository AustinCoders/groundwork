"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
import { accentVar } from "@/lib/accent";
import type { MenuStats } from "@/components/menu/ProgressStrip";
import styles from "../SiteDrawer.module.css";

export interface QuickAction {
  href: string;
  label: string;
  hint: string;
  icon: MenuIconName;
  mark: string;
  accent: string;
}

export const HOME_ACTION: QuickAction = {
  href: "/",
  label: "Home",
  hint: "Back to the front page",
  icon: "home",
  mark: "⌂",
  accent: "ink",
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    href: "/problems",
    label: "Problems",
    hint: "Solve by topic and level",
    icon: "problems",
    mark: "⌘",
    accent: "purple",
  },
  {
    href: "/practice?id=free",
    label: "Playground",
    hint: "Run code, no setup",
    icon: "playground",
    mark: "✎",
    accent: "blue",
  },
  { href: "/mock", label: "Mock interview", hint: "A timed round, scored", icon: "mock", mark: "⏱", accent: "orange" },
  {
    href: "/whiteboard",
    label: "Whiteboard",
    hint: "Sketch a design out loud",
    icon: "whiteboard",
    mark: "▱",
    accent: "teal",
  },
  {
    href: "/review",
    label: "Review",
    hint: "Spaced repeats of what you read",
    icon: "review",
    mark: "↻",
    accent: "green",
  },
  {
    href: "/progress",
    label: "Progress",
    hint: "Level, streak and badges",
    icon: "progress",
    mark: "▤",
    accent: "yellow",
  },
];

export function isUnder(pathname: string, base: string): boolean {
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
}

export function QuickActions({ stats, onClose }: { stats: MenuStats | null; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Site">
      <ul className={styles.tiles}>
        {QUICK_ACTIONS.map((action) => {
          const due = action.href === "/review" ? (stats?.due ?? 0) : 0;
          const here = isUnder(pathname, action.href.split("?")[0]);
          const hintId = `menu-hint-${action.icon}`;
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className={styles.tile}
                aria-current={here ? "page" : undefined}
                aria-label={due > 0 ? `${action.label}, ${due} due` : action.label}
                aria-describedby={hintId}
                onClick={onClose}
                prefetch={false}
                style={{ "--accent": accentVar(action.accent) } as React.CSSProperties}
              >
                <span className={styles.tileTop}>
                  <span className={styles.tileIcon} aria-hidden="true">
                    <MenuIcon name={action.icon} />
                  </span>
                  {here && (
                    <span className={styles.here} aria-hidden="true">
                      here
                    </span>
                  )}
                  {!here && due > 0 && (
                    <span className={styles.due} aria-hidden="true">
                      {due} due
                    </span>
                  )}
                </span>
                <span className={styles.tileName}>{action.label}</span>
                <span className={styles.tileHint} id={hintId}>
                  {action.hint}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
