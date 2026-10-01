"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { BackButton } from "@/components/practice/BackButton";
import { TopIcon } from "@/components/practice/TopIcon";
import { DiagramDefs } from "@/components/chapter/DiagramDefs";
import { accentVar } from "@/lib/accent";
import { SITE_NAME } from "@/lib/site";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import styles from "./frame.module.css";

export interface FrameLink {
  href: string;
  label: string;
}

export type FrameLayout = "page" | "reader";

export type FrameScan = string | number | null;

const HOME: FrameLink = { href: "/", label: "Home" };

export function PageFrame({
  title,
  titleHref,
  mark,
  accent,
  links = [],
  actions,
  back = HOME,
  reading = false,
  layout = "page",
  skipLabel,
  skipHref = "#main",
  scan = null,
  children,
}: {
  title: string;
  titleHref?: string;
  mark?: string;
  accent?: string;
  links?: FrameLink[];
  actions?: React.ReactNode;
  back?: FrameLink;
  reading?: boolean;
  layout?: FrameLayout;
  skipLabel: string;
  skipHref?: string;
  scan?: FrameScan;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    smoothScroll.start();
  }, []);
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollFx(pageRef, `${pathname}:${String(scan)}`);

  const chip = mark ? (
    <span
      className={styles.mark}
      style={accent ? ({ "--accent": accentVar(accent) } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      {mark}
    </span>
  ) : null;
  const titleClass = mark ? `${styles.title} ${styles.titleMarked}` : styles.title;
  const titleContent = mark ? (
    <>
      {chip}
      <span className={styles.titleText}>{title}</span>
    </>
  ) : (
    title
  );

  return (
    <>
      <a className="skip-link" href={skipHref}>
        {skipLabel}
      </a>
      {reading && <DiagramDefs />}
      <div className={styles.page} ref={pageRef}>
        <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        <header className={styles.top}>
          <BackButton variant="bar" className="head-back" fallbackHref={back.href} fallbackLabel={back.label} />
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => {
              smoothScroll.stop();
              setMenuOpen(true);
            }}
          >
            <TopIcon name="menu" />
          </button>
          <Link href="/" className={styles.brand} aria-label={`${SITE_NAME} home`}>
            <span className="brand__mark" aria-hidden="true">
              JS
            </span>
            <span className={styles.brandName}>{SITE_NAME}</span>
          </Link>
          <span className={styles.sep} aria-hidden="true" />
          {titleHref ? (
            <Link href={titleHref} className={titleClass} aria-current={pathname === titleHref ? "page" : undefined}>
              {titleContent}
            </Link>
          ) : (
            <span className={titleClass}>{titleContent}</span>
          )}
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
        <main id="main" className={layout === "reader" ? `${styles.main} ${styles.mainReader}` : styles.main}>
          {children}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} reading={reading} />
    </>
  );
}
