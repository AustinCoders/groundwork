"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { MenuButton } from "@/components/MenuButton";
import { AccountMenu } from "@/components/account/AccountMenu";
import { BackButton } from "@/components/practice/BackButton";
import { accentVar } from "@/lib/accent";
import { SITE_NAME } from "@/lib/site";
import styles from "./frame.module.css";

export interface FrameLink {
  href: string;
  label: string;
  fixed?: boolean;
}

const LINK_GLYPHS: [string, string][] = [
  ["/review", "↻"],
  ["/progress", "▤"],
  ["/roadmap", "⤳"],
  ["/interview/questions", "?"],
  ["/interview", "❝"],
  ["/mock", "⏱"],
  ["/problems", "☰"],
  ["/practice", "›_"],
  ["/system-design", "⬡"],
  ["/company-questions", "⌂"],
];

function glyphFor(link: FrameLink): string {
  return LINK_GLYPHS.find(([href]) => link.href === href || link.href.startsWith(`${href}/`))?.[1] ?? link.label[0];
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
  tool?: "exercise" | "playground" | "room";
  className?: string;
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const hasLinks = links.length > 0;
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header || !hasLinks) return;
    const fit = () => {
      header.dataset.fit = "text";
      const text = header.querySelector<HTMLElement>(`.${CSS.escape(styles.titleText)}`);
      const squeezed = header.scrollWidth > header.clientWidth + 1;
      const clipped = text ? text.scrollWidth > text.clientWidth + 1 : false;
      header.dataset.fit = squeezed || clipped ? "icons" : "text";
    };
    fit();
    const watch = new ResizeObserver(fit);
    watch.observe(header);
    const account = header.querySelector<HTMLElement>(`.${CSS.escape(styles.account)}`);
    if (account) watch.observe(account);
    const actionsBox = header.querySelector<HTMLElement>(`.${CSS.escape(styles.actions)}`);
    if (actionsBox) watch.observe(actionsBox);
    return () => watch.disconnect();
  }, [hasLinks, title, links.length]);
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
    <header ref={headerRef} className={headerClass} style={{ viewTransitionName: "gw-header" }}>
      <BackButton
        variant="bar"
        className="head-back"
        fallbackHref={back.href}
        fallbackLabel={back.label}
        fixed={back.fixed}
      />
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
            <Link key={l.href} href={l.href} title={l.label} aria-current={pathname === l.href ? "page" : undefined}>
              <span className={styles.linkGlyph} aria-hidden="true">
                {glyphFor(l)}
              </span>
              <span className={styles.linkText}>{l.label}</span>
            </Link>
          ))}
        </nav>
      )}
      {actions && <div className={styles.actions}>{actions}</div>}
      {!tool && (
        <div className={styles.account}>
          <AccountMenu />
        </div>
      )}
    </header>
  );
}
