"use client";

import { useEffect, useState } from "react";
import styles from "./company-questions.module.css";

export function AnswerRail({
  items,
  title = "In this answer",
}: {
  items: { id: string; label: string }[];
  title?: string;
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-18% 0px -66% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className={styles.railNav}>
      <p className={styles.railLabel}>{title}</p>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={active === item.id ? "true" : undefined}>
              <span aria-hidden="true">{index + 1}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
