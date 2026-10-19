"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./company-questions.module.css";

export interface FilterCompany {
  id: string;
  name: string;
  group: string;
  count: number;
}

const GROUPS = [
  ["all", "All companies"],
  ["global", "Global"],
  ["india", "India"],
] as const;

function matches(card: HTMLElement, group: string, company: string, query: string): boolean {
  if (group !== "all" && card.dataset.group !== group) return false;
  if (company !== "all" && card.dataset.company !== company) return false;
  return !query || (card.dataset.search ?? "").includes(query);
}

export function CompanyFilter({
  companies,
  total,
  children,
}: {
  companies: FilterCompany[];
  total: number;
  children: ReactNode;
}) {
  const [group, setGroup] = useState<string>("all");
  const [company, setCompany] = useState<string>("all");
  const [query, setQuery] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const none = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const cards = list.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [];
    const needle = query.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const show = matches(card, group, company, needle);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (status.current) status.current.textContent = `Showing ${visible} of ${total}`;
    if (none.current) none.current.hidden = visible > 0;
  }, [group, company, query, total]);

  const inGroup = companies.filter((entry) => group === "all" || entry.group === group);

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Group of companies">
          {GROUPS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={group === id}
              onClick={() => {
                setGroup(id);
                setCompany("all");
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.chips} role="group" aria-label="Company">
          <button type="button" aria-pressed={company === "all"} onClick={() => setCompany("all")}>
            Any
          </button>
          {inGroup.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={company === entry.id}
              onClick={() => setCompany(entry.id)}
            >
              {entry.name} <span className={styles.count}>{entry.count}</span>
            </button>
          ))}
        </div>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search the questions</span>
          <input
            type="search"
            value={query}
            placeholder="Search: feed, payments, cache…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className={styles.shown} role="status" ref={status}>
          Showing {total} of {total}
        </p>
      </div>
      <div ref={list} className={styles.list}>
        {children}
      </div>
      <p className={styles.none} ref={none} hidden>
        No question matches. Clear the search or pick another company.
      </p>
    </div>
  );
}
