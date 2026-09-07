"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/hooks";

export interface SectionNavProps {
  sections: { id: string; num: string; title: string }[];
  label: string;
}

export function SectionNav({ sections, label }: SectionNavProps) {
  const mounted = useMounted();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const nodes = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!("IntersectionObserver" in window) || !nodes.length) return;

    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        });
        const first = nodes.find((n) => seen.has(n));
        if (first) setActiveId(first.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [mounted, sections]);

  return (
    <nav className="site-sidenav__section" aria-label={label}>
      <div className="site-sidenav__head">
        <h2 className="site-sidenav__heading">{label}</h2>
        <span className="site-sidenav__count">{sections.length} sections</span>
      </div>
      <div>
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
