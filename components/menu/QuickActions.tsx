"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
import type { MenuStats } from "@/components/menu/menuStats";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import styles from "../SiteDrawer.module.css";

export interface QuickAction {
  href: string;
  label: string;
  icon: MenuIconName;
  mark: string;
}

export const HOME_ACTION: QuickAction = { href: "/", label: "Home", icon: "home", mark: "⌂" };

export const QUICK_ACTIONS: QuickAction[] = [
  { href: "/problems", label: "Problems", icon: "problems", mark: "⌘" },
  { href: "/practice?id=free", label: "Playground", icon: "playground", mark: "✎" },
  { href: "/mock", label: "Mock interview", icon: "mock", mark: "⏱" },
  { href: "/whiteboard", label: "Whiteboard", icon: "whiteboard", mark: "▱" },
  { href: "/review", label: "Review", icon: "review", mark: "↻" },
  { href: "/progress", label: "Progress", icon: "progress", mark: "▤" },
];

export function isUnder(pathname: string, base: string): boolean {
  return base === "/" ? pathname === "/" : pathname === base || pathname.startsWith(`${base}/`);
}

export function QuickActions({ stats, onClose }: { stats: MenuStats | null; onClose: () => void }) {
  const pathname = usePathname();
  return (
    <section className={styles.block} aria-labelledby="menu-go">
      <Eyebrow no="02" id="menu-go">
        Go to
      </Eyebrow>
      <nav aria-label="Site">
        <ul className={`${kit.rows} ${styles.goRows}`}>
          {QUICK_ACTIONS.map((action) => {
            const due = action.href === "/review" ? (stats?.due ?? 0) : 0;
            const here = isUnder(pathname, action.href.split("?")[0]);
            return (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className={kit.row}
                  aria-current={here ? "page" : undefined}
                  aria-label={due > 0 ? `${action.label}, ${due} due` : action.label}
                  onClick={onClose}
                  prefetch={false}
                >
                  <span className={styles.rowIcon} aria-hidden="true">
                    <MenuIcon name={action.icon} size={22} />
                  </span>
                  <span className={kit.title}>{action.label}</span>
                  {due > 0 && !here && (
                    <span className={styles.sticker} aria-hidden="true">
                      {due}
                      <span className={styles.dueWord}> due</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
