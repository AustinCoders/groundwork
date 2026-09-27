"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { BackButton } from "@/components/practice/BackButton";
import { TopIcon } from "@/components/practice/TopIcon";
import { SITE_NAME } from "@/lib/site";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import styles from "./frame.module.css";

export interface FrameLink {
  href: string;
  label: string;
}

export function PageFrame({
  title,
  links = [],
  skipLabel,
  scan = null,
  children,
}: {
  title: string;
  links?: FrameLink[];
  skipLabel: string;
  scan?: unknown;
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

  return (
    <>
      <a className="skip-link" href="#main">
        {skipLabel}
      </a>
      <div className={styles.page} ref={pageRef}>
        <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        <header className={styles.top}>
          <BackButton variant="icon" className={styles.iconBtn} fallbackHref="/" fallbackLabel="Home" />
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
          <span className={styles.title}>{title}</span>
          {links.length > 0 && (
            <nav className={styles.links} aria-label="Related pages">
              {links.map((l) => (
                <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
          )}
        </header>
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
