"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { MenuButton } from "@/components/MenuButton";
import { BackButton } from "@/components/practice/BackButton";
import { accentVar } from "@/lib/accent";
import { SITE_NAME } from "@/lib/site";
import styles from "./frame.module.css";

export interface FrameLink {
  href: string;
  label: string;
}

export function FrameHeader({
  back,
  onMenu,
  menuOpen,
  title,
  titleHref,
  mark,
  accent,
  links = [],
  middle,
  actions,
  tool,
  className,
}: {
  back: FrameLink;
  onMenu: () => void;
  menuOpen: boolean;
  title?: string;
  titleHref?: string;
  mark?: string;
  accent?: string;
  links?: FrameLink[];
  middle?: ReactNode;
  actions?: ReactNode;
  tool?: "exercise" | "playground";
  className?: string;
}) {
  const pathname = usePathname();
  const titleClass = mark ? `${styles.title} ${styles.titleMarked}` : styles.title;
  const titleContent = mark ? (
    <>
      <span
        className={styles.mark}
        style={accent ? ({ "--accent": accentVar(accent) } as CSSProperties) : undefined}
        aria-hidden="true"
      >
        {mark}
      </span>
      <span className={styles.titleText}>{title}</span>
    </>
  ) : (
    title
  );
  const headerClass = [styles.top, tool && styles.topTool, tool === "playground" && styles.topPlayground, className]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <BackButton variant="bar" className="head-back" fallbackHref={back.href} fallbackLabel={back.label} />
      <MenuButton open={menuOpen} onOpen={onMenu} />
      <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
        <span className="brand__mark" aria-hidden="true">
          G
        </span>
        <span className={styles.brandName}>{SITE_NAME}</span>
      </Link>
      {(title || middle) && <span className={styles.sep} aria-hidden="true" />}
      {title &&
        (titleHref ? (
          <Link href={titleHref} className={titleClass} aria-current={pathname === titleHref ? "page" : undefined}>
            {titleContent}
          </Link>
        ) : (
          <span className={titleClass}>{titleContent}</span>
        ))}
      {middle}
      {links.length > 0 && (
        <nav className={styles.links} aria-label="Related pages">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
