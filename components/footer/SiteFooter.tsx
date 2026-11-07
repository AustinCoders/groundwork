"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { smoothScroll } from "@/lib/scrollFx";
import { SITE_NAME } from "@/lib/site";
import { navHref, useTopicsNav } from "@/lib/topicNav";
import styles from "./footer.module.css";

const LEARN_FIRST = ["js", "react", "dsa", "system-design", "git"];
const LEFT_OUT = new Set(["interview", "architecture"]);
const HIDDEN_ON = [/^\/problems\/[^/]+/, /^\/practice(\/|$)/, /^\/whiteboard(\/|$)/, /^\/local(\/|$)/];

interface Next {
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}

const NEXT_STEP: { match: RegExp; next: Next }[] = [
  {
    match: /^\/(dsa|level\/dsa|path\/dsa|problems)(\/|$)/,
    next: {
      primary: { href: "/company-questions", label: "Company coding questions" },
      secondary: { href: "/practice?id=free", label: "Open the playground" },
    },
  },
  {
    match: /^\/(system-design|level\/system-design|path\/system-design)(\/|$)/,
    next: {
      primary: { href: "/company-questions", label: "Company design answers" },
      secondary: { href: "/whiteboard", label: "Open the whiteboard" },
    },
  },
  {
    match: /^\/interview(\/|$)/,
    next: {
      primary: { href: "/mock", label: "Run a mock interview" },
      secondary: { href: "/company-questions", label: "Company questions" },
    },
  },
  {
    match: /^\/company-questions(\/|$)/,
    next: {
      primary: { href: "/interview", label: "Interview book" },
      secondary: { href: "/mock", label: "Mock interview" },
    },
  },
];

const DEFAULT_NEXT: Next = {
  primary: { href: "/company-questions", label: "Company questions" },
  secondary: { href: "/interview", label: "Interview book" },
};

function here(pathname: string, href: string, id?: string): boolean {
  const path = href.split("?")[0];
  if (pathname === path || pathname.startsWith(`${path}/`)) return true;
  return id !== undefined && pathname.split("/").includes(id);
}

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  const topics = useTopicsNav();
  const brand = useRef<HTMLDivElement>(null);
  const hidden = HIDDEN_ON.some((rule) => rule.test(pathname));

  useEffect(() => {
    const element = brand.current;
    if (!element) return;
    element.setAttribute("data-live", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.setProperty("--in", "1");
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - box.top) / Math.max(1, box.height)));
      element.style.setProperty("--in", progress.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    const resizer = new ResizeObserver(schedule);
    resizer.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      resizer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [hidden, pathname]);

  if (hidden) return null;

  const written = topics.filter((topic) => topic.written > 0 && !LEFT_OUT.has(topic.id));
  const ready = [
    ...LEARN_FIRST.map((id) => written.find((topic) => topic.id === id)).filter((topic) => topic !== undefined),
    ...written.filter((topic) => !LEARN_FIRST.includes(topic.id)),
  ].slice(0, 6);
  const next = NEXT_STEP.find((entry) => entry.match.test(pathname))?.next ?? DEFAULT_NEXT;
  const link = (href: string, label: string, id?: string, prefetch?: false) => (
    <Link
      key={href + label}
      href={href}
      prefetch={prefetch}
      aria-current={here(pathname, href, id) ? "page" : undefined}
    >
      {label}
    </Link>
  );

  return (
    <footer className={styles.foot} aria-label="Site">
      <div className={styles.brandBg} aria-hidden="true" ref={brand}>
        <svg className={styles.bigBrand} viewBox="0 0 1000 190" focusable="false">
          <defs>
            <linearGradient id="foot-brand-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" className={styles.brandTop} />
              <stop offset="1" className={styles.brandBottom} />
            </linearGradient>
          </defs>
          <text
            className={styles.brandL}
            x="14"
            y="150"
            textLength="566"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#foot-brand-fill)"
          >
            Ground
          </text>
          <text
            className={styles.brandR}
            x="582"
            y="150"
            textLength="404"
            lengthAdjust="spacingAndGlyphs"
            fill="url(#foot-brand-fill)"
          >
            work
          </text>
        </svg>
      </div>
      <div className={styles.footInner}>
        <div className={styles.footCols}>
          <div className={styles.footAbout}>
            <p className={styles.footBrand}>
              <span className="brand__mark" aria-hidden="true">
                G
              </span>
              {SITE_NAME}
            </p>
            <p className={styles.about}>
              Written with AI assistance and checked by tests. Your progress stays on your device.
            </p>
            <div className={styles.footCta}>
              <Link className={styles.footPrimary} href={next.primary.href} prefetch={false}>
                {next.primary.label} <span aria-hidden="true">→</span>
              </Link>
              <Link className={styles.footGhost} href={next.secondary.href} prefetch={false}>
                {next.secondary.label}
              </Link>
            </div>
          </div>
          <nav aria-label="Learn" className={styles.footNav}>
            <p className={styles.footHead}>Learn</p>
            {ready.map((topic) => link(navHref(topic), topic.name, topic.id, false))}
            {link("/interview", "Interview book")}
            {link("/roadmap", "Roadmaps")}
          </nav>
          <nav aria-label="Practice" className={styles.footNav}>
            <p className={styles.footHead}>Practice</p>
            {link("/problems", "Problems")}
            {link("/practice?id=free", "Playground", undefined, false)}
            {link("/company-questions", "Company questions", undefined, false)}
            {link("/mock", "Mock interview")}
            {link("/whiteboard", "Whiteboard")}
          </nav>
          <nav aria-label="You and the site" className={styles.footNav}>
            <p className={styles.footHead}>You and the site</p>
            {link("/progress", "Progress")}
            {link("/review", "Review")}
            {link("/about", "About")}
            {link("/changelog", "Changelog")}
            {link("/contact", "Contact")}
            {link("/accessibility", "Accessibility")}
            {link("/privacy", "Privacy")}
            {link("/architecture", "How this is built")}
          </nav>
        </div>

        <div className={styles.footBase}>
          <span>{SITE_NAME}. Free to read, nothing to sign up for.</span>
          <button type="button" className={styles.footTop} onClick={() => smoothScroll.to(0)}>
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
