"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useDoneIds } from "@/lib/companyQuestionsProgress";
import { accentVar } from "@/lib/accent";
import {
  EVIDENCE_ORDER,
  evidenceCopy,
  type EvidenceKey,
  type HubCompany,
  type HubItem,
  type HubTopic,
  type Kind,
} from "./shared";
import styles from "./hub.module.css";

type Mode = "all" | Kind;
type Sort = "reported" | "company";

const GROUPS = [
  { id: "global", label: "Global", note: "Big tech and product companies" },
  { id: "india", label: "India", note: "Indian product and payments companies" },
] as const;

const MODES: { id: Mode; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "design", label: "System design" },
  { id: "coding", label: "Coding" },
];

function tint(accent: string): CSSProperties {
  return { "--accent": accentVar(accent) } as CSSProperties;
}

export function Browser({
  items,
  companies,
  topics,
  thumbs,
}: {
  items: HubItem[];
  companies: HubCompany[];
  topics: HubTopic[];
  thumbs: Record<string, ReactNode>;
}) {
  const router = useRouter();
  const trackable = useMemo(() => items.map((item) => ({ id: item.id, exercise: item.exercise })), [items]);
  const done = useDoneIds(trackable);
  const [mode, setMode] = useState<Mode>("all");
  const [company, setCompany] = useState("all");
  const [topic, setTopic] = useState("all");
  const [evidence, setEvidence] = useState<EvidenceKey | "all">("all");
  const [sort, setSort] = useState<Sort>("reported");
  const [query, setQuery] = useState("");
  const bar = useRef<HTMLDivElement>(null);

  const needle = query.trim().toLowerCase();
  const companyOrder = useMemo(() => new Map(companies.map((entry, index) => [entry.id, index])), [companies]);
  const shown = useMemo(() => {
    const list = items.filter(
      (item) =>
        (mode === "all" || item.kind === mode) &&
        (company === "all" || item.company === company) &&
        (topic === "all" || item.topic === topic) &&
        (evidence === "all" || item.evidence === evidence) &&
        (!needle || item.search.includes(needle))
    );
    const rank = (item: HubItem) => EVIDENCE_ORDER.indexOf(item.evidence);
    return [...list].sort((a, b) =>
      sort === "reported"
        ? rank(a) - rank(b) || (companyOrder.get(a.company) ?? 0) - (companyOrder.get(b.company) ?? 0)
        : (companyOrder.get(a.company) ?? 0) - (companyOrder.get(b.company) ?? 0)
    );
  }, [items, mode, company, topic, evidence, needle, sort, companyOrder]);

  const visibleTopics = topics.filter((entry) => mode === "all" || entry.kind === mode);
  const inMode = items.filter((item) => mode === "all" || item.kind === mode);
  const practisedCount = items.filter((item) => done.has(item.id)).length;
  const filtered = company !== "all" || topic !== "all" || evidence !== "all" || needle !== "";
  const modeCount = (id: Mode) => items.filter((item) => id === "all" || item.kind === id).length;

  function chooseMode(next: Mode) {
    setMode(next);
    if (topic !== "all" && !topics.some((entry) => entry.id === topic && (next === "all" || entry.kind === next)))
      setTopic("all");
  }

  function clear() {
    setCompany("all");
    setTopic("all");
    setEvidence("all");
    setQuery("");
  }

  function surprise() {
    const pool = shown.length > 0 ? shown : inMode;
    const unseen = pool.filter((item) => !done.has(item.id));
    const from = unseen.length > 0 ? unseen : pool;
    router.push(from[Math.floor(Math.random() * from.length)].href);
  }

  return (
    <>
      <div className={styles.modes} role="group" aria-label="Kind of question">
        {MODES.map((entry) => (
          <button key={entry.id} type="button" aria-pressed={mode === entry.id} onClick={() => chooseMode(entry.id)}>
            {entry.label}
            <span>{modeCount(entry.id)}</span>
          </button>
        ))}
      </div>

      <div className={styles.bar} ref={bar}>
        <div className={styles.barRow}>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>Search the questions</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4" />
            </svg>
            <input
              type="search"
              value={query}
              placeholder="Search: feed, sliding window, payments, Flipkart…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className={styles.segment} role="group" aria-label="How well reported">
            <button type="button" aria-pressed={evidence === "all"} onClick={() => setEvidence("all")}>
              Any
            </button>
            {EVIDENCE_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={evidence === key}
                title={evidenceCopy("design", key).hint}
                onClick={() => setEvidence(evidence === key ? "all" : key)}
              >
                <i data-evidence={key} aria-hidden="true" />
                {key === "several" ? "Several" : key === "one" ? "One report" : "Lists"}
              </button>
            ))}
          </div>
          <button type="button" className={styles.surprise} onClick={surprise}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h3c4 0 5 10 9 10h4M4 17h3c1.6 0 2.7-1.4 3.7-3M14 7.5c.7-.3 1.4-.5 2-.5h4M17 4l3 3-3 3M17 14l3 3-3 3" />
            </svg>
            Surprise me
          </button>
        </div>
        <div className={styles.selects}>
          <label>
            <span>Company</span>
            <select value={company} onChange={(event) => setCompany(event.target.value)}>
              <option value="all">All companies</option>
              {GROUPS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {companies
                    .filter((entry) => entry.group === group.id)
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            <span>Topic</span>
            <select value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option value="all">Every topic</option>
              {(["design", "coding"] as const)
                .filter((kind) => mode === "all" || mode === kind)
                .map((kind) => (
                  <optgroup key={kind} label={kind === "design" ? "System design" : "Coding patterns"}>
                    {visibleTopics
                      .filter((entry) => entry.kind === kind)
                      .map((entry) => (
                        <option key={`${entry.kind}-${entry.id}`} value={entry.id}>
                          {entry.name} ({entry.count})
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
          </label>
        </div>
        <div className={styles.status}>
          <p role="status">
            Showing <b>{shown.length}</b> of {items.length}
            {practisedCount > 0 && <> · you have practised {practisedCount}</>}
          </p>
          <div className={styles.sort} role="group" aria-label="Order">
            <button type="button" aria-pressed={sort === "reported"} onClick={() => setSort("reported")}>
              Best reported first
            </button>
            <button type="button" aria-pressed={sort === "company"} onClick={() => setSort("company")}>
              By company
            </button>
          </div>
          {filtered && (
            <button type="button" className={styles.clear} onClick={clear}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty}>
          <p>Nothing matches that. Try a shorter search, or pick another company or topic.</p>
          <button type="button" onClick={clear}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {shown.map((item, index) => {
            const copy = evidenceCopy(item.kind, item.evidence);
            return (
              <li key={`${item.kind}-${item.id}`} style={{ "--i": Math.min(index, 11) } as CSSProperties}>
                <Link
                  href={item.href}
                  className={styles.card}
                  style={tint(item.accent)}
                  data-evidence={item.evidence}
                  data-kind={item.kind}
                  prefetch={false}
                >
                  <span className={styles.thumb}>
                    <span className={styles.thumbArt}>{thumbs[`${item.kind}:${item.id}`]}</span>
                    <span className={styles.kindTag}>{item.kind === "design" ? "System design" : "Coding"}</span>
                    {item.difficulty && (
                      <span className={styles.difficulty} data-level={item.difficulty}>
                        {item.difficulty}
                      </span>
                    )}
                    {item.evidence === "several" && <span className={styles.tape} aria-hidden="true" />}
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.cardTop}>
                      <span className={styles.monogramSm} aria-hidden="true">
                        {item.companyName.charAt(0)}
                      </span>
                      <span className={styles.cardCompany}>{item.companyName}</span>
                      <span className={styles.badge} data-evidence={item.evidence}>
                        <i aria-hidden="true" />
                        {copy.short}
                      </span>
                    </span>
                    <span className={styles.cardTitle}>{item.title}</span>
                    <span className={styles.cardPrompt}>{item.prompt}</span>
                    <span className={styles.cardFoot}>
                      {item.kind === "coding" ? (
                        <>
                          <span>{item.topicName}</span>
                          <span>{item.time} time</span>
                        </>
                      ) : (
                        <>
                          <span>{item.topicName}</span>
                          {item.level && <span>{item.level}</span>}
                        </>
                      )}
                      {done.has(item.id) ? (
                        <span className={styles.practised}>Practised ✓</span>
                      ) : (
                        <span className={styles.open}>
                          Open <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
