"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
import { Eyebrow } from "@/components/menu/Eyebrow";
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
    <section className={styles.block} aria-labelledby="menu-go">
      <Eyebrow no="03" id="menu-go">
        Go to
      </Eyebrow>
      <nav aria-label="Site">
        <ul className={styles.rows}>
          {QUICK_ACTIONS.map((action) => {
            const due = action.href === "/review" ? (stats?.due ?? 0) : 0;
            const here = isUnder(pathname, action.href.split("?")[0]);
            const hintId = `menu-hint-${action.icon}`;
            return (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className={styles.row}
                  aria-current={here ? "page" : undefined}
                  aria-label={due > 0 ? `${action.label}, ${due} due` : action.label}
                  aria-describedby={hintId}
                  onClick={onClose}
                  prefetch={false}
                >
                  <span className={styles.rowIcon} aria-hidden="true">
                    <MenuIcon name={action.icon} size={22} />
                  </span>
                  <span className={styles.rowText}>
                    <span className={styles.rowName}>{action.label}</span>
                    <span className={styles.rowHint} id={hintId}>
                      {action.hint}
                    </span>
                  </span>
                  {due > 0 && !here && (
                    <span className={styles.sticker} aria-hidden="true">
                      {due} due
                    </span>
                  )}
                  {here && (
                    <span className={styles.here} aria-hidden="true">
                      here
                    </span>
                  )}
                  <span className={styles.rowArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
