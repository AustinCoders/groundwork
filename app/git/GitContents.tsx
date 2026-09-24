"use client";

import { useEffect, useState } from "react";

export interface GitSection {
  id: string;
  num: string;
  title: string;
}

export function GitContents({ sections }: { sections: GitSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const nodes = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!("IntersectionObserver" in window) || !nodes.length) return;

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        });
        const first = nodes.find((s) => seen.has(s));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    nodes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav className="site-sidenav__section" aria-label="Contents">
      <div className="site-sidenav__head">
        <h2 className="site-sidenav__heading">Contents</h2>
        <span className="site-sidenav__count">{sections.length} sections</span>
      </div>
      <div id="git-nav-list">
        {sections.map((s) => (
          <a
            key={s.id}
            className={`site-navlink${activeId === s.id ? " is-active" : ""}`}
            href={`#${s.id}`}
            data-target={s.id}
          >
            <span className="site-navlink__num" aria-hidden="true">
              {s.num}
            </span>
            <span className="site-navlink__name">{s.title}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
