"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AppearancePicker } from "@/components/AppearancePicker";
import { SITE_NAME } from "@/lib/site";
import styles from "./SiteDrawer.module.css";

const LINKS: { href: string; label: string; mark: string }[] = [
  { href: "/", label: "Home", mark: "⌂" },
  { href: "/practice?id=free", label: "Playground", mark: "✎" },
  { href: "/problems", label: "Problems", mark: "⌘" },
  { href: "/whiteboard", label: "Whiteboard", mark: "▱" },
  { href: "/mock", label: "Mock interview", mark: "⏱" },
  { href: "/review", label: "Review", mark: "↻" },
  { href: "/progress", label: "Progress", mark: "▤" },
];

export function SiteDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, a")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener("keydown", onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = overflow;
      back?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.root}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <aside className={styles.drawer} ref={ref} role="dialog" aria-modal="true" aria-label={`${SITE_NAME} menu`}>
        <div className={styles.head}>
          <Link href="/" className={styles.brand} onClick={onClose}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span>{SITE_NAME}</span>
          </Link>
          <button type="button" className={styles.close} aria-label="Close the menu" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
        <nav aria-label="Site">
          <h2 className={styles.heading}>Go to</h2>
          <ul className={styles.links}>
            {LINKS.map((l) => {
              const here = l.href.split("?")[0] === pathname;
              return (
                <li key={l.href}>
                  <Link href={l.href} aria-current={here ? "page" : undefined} onClick={onClose} prefetch={false}>
                    <span aria-hidden="true">{l.mark}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <section className={styles.section} aria-labelledby="site-look-theme">
          <AppearancePicker idPrefix="site-look" headingClass={styles.heading} />
        </section>
      </aside>
    </div>,
    document.body
  );
}
