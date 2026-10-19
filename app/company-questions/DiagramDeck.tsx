"use client";

import { useState, type ReactNode } from "react";
import styles from "./detail.module.css";

export function DiagramDeck({ items }: { items: { id: string; title: string; node: ReactNode }[] }) {
  const [at, setAt] = useState(0);
  if (items.length === 1) return <div className={styles.deck}>{items[0].node}</div>;
  return (
    <div className={styles.deck}>
      <div className={styles.tabs} role="tablist" aria-label="Diagrams for this answer">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${item.id}-tab`}
            aria-selected={at === index}
            aria-controls={`${item.id}-panel`}
            onClick={() => setAt(index)}
          >
            <span aria-hidden="true">{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${item.id}-panel`}
          aria-labelledby={`${item.id}-tab`}
          hidden={at !== index}
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}
