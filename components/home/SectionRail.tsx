import { useEffect, useState, type MouseEvent } from "react";
import { headerHeight, prefersMotion } from "@/lib/dom";
import { smoothScroll } from "@/lib/scrollFx";
import styles from "./rail.module.css";

const STOPS = [
  { id: "shelf", label: "Topics" },
  { id: "practice", label: "Practice" },
  { id: "how", label: "How it works" },
  { id: "paths", label: "Paths" },
  { id: "loop", label: "Interview book" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Start here" },
];

function land(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  event.preventDefault();
  window.history.replaceState(null, "", `#${id}`);
  section.setAttribute("tabindex", "-1");
  section.focus({ preventScroll: true });
  smoothScroll.to(Math.max(0, section.getBoundingClientRect().top + window.scrollY - headerHeight()), !prefersMotion());
}

export function SectionRail() {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) setCurrent(id);
          else setCurrent((now) => (now === id ? null : now));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    for (const stop of STOPS) {
      const section = document.getElementById(stop.id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className={styles.rail} aria-label="Page sections" data-visible={current ? "" : undefined}>
      <ol>
        {STOPS.map((stop, i) => (
          <li key={stop.id}>
            <a
              href={`#${stop.id}`}
              aria-current={current === stop.id ? "location" : undefined}
              onClick={(event) => land(event, stop.id)}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>
                <b>{String(i + 1).padStart(2, "0")}</b> {stop.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
