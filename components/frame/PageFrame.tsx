"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { SiteDrawer } from "@/components/SiteDrawer";
import { DiagramDefs } from "@/components/chapter/DiagramDefs";
import { FrameHeader, type FrameLink } from "@/components/frame/FrameHeader";
import { smoothScroll, useScrollFx } from "@/lib/scrollFx";
import styles from "./frame.module.css";

export type FrameLayout = "page" | "reader";

export type FrameScan = string | number | null;

const HOME: FrameLink = { href: "/", label: "Home" };

export type { FrameLink };

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

  return (
    <>
      <a className="skip-link" href={skipHref}>
        {skipLabel}
      </a>
      {reading && <DiagramDefs />}
      <div className={styles.page} ref={pageRef}>
        <span className={styles.scrollBar} data-scrollbar aria-hidden="true" />
        <FrameHeader
          back={back}
          onMenu={() => {
            smoothScroll.stop();
            setMenuOpen(true);
          }}
          menuOpen={menuOpen}
          title={title}
          titleHref={titleHref}
          mark={mark}
          accent={accent}
          links={links}
          actions={actions}
        />
        <main id="main" className={layout === "reader" ? `${styles.main} ${styles.mainReader}` : styles.main}>
          {children}
        </main>
      </div>
      <SiteDrawer open={menuOpen} onClose={closeMenu} reading={reading} />
    </>
  );
}
