"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { TopIcon } from "@/components/practice/TopIcon";
import { BackButton } from "@/components/practice/BackButton";
import { SITE_NAME } from "@/lib/site";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import styles from "./book.module.css";

const LINKS = [
  { href: "/interview", label: "Rounds" },
  { href: "/interview/questions", label: "Question bank" },
  { href: "/mock", label: "Mock interview" },
];

export function BookShell({ children, scan = null }: { children: React.ReactNode; scan?: unknown }) {
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
        Skip to the interview book
      </a>
      <div className={styles.page} ref={pageRef}>
        <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        <header className={styles.top}>
          <BackButton
            variant="bar"
            className="head-back"
            fallbackHref={pathname === "/interview" ? "/" : "/interview"}
            fallbackLabel={pathname === "/interview" ? "Home" : "Interview book"}
          />
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
              G
            </span>
            <span className={styles.brandName}>{SITE_NAME}</span>
          </Link>
          <span className={styles.topSep} aria-hidden="true" />
          <Link href="/interview" className={styles.topTitle}>
            Interview book
          </Link>
          <nav className={styles.topLinks} aria-label="Interview book">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                prefetch={l.href === "/mock" ? false : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>
        <main id="main" className={styles.main}>
          {children}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
