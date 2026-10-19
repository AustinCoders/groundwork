"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

function Menu({
  id,
  label,
  summary,
  open,
  onToggle,
  end,
  children,
}: {
  id: string;
  label: string;
  summary: string | null;
  open: boolean;
  onToggle: (id: string) => void;
  end?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={styles.menu} data-menu data-open={open ? "" : undefined}>
      <button
        type="button"
        className={styles.menuBtn}
        aria-haspopup="true"
        aria-expanded={open}
        data-active={summary ? "" : undefined}
        onClick={() => onToggle(id)}
      >
        <span>{label}</span>
        {summary && <b>{summary}</b>}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={styles.panel} data-end={end ? "" : undefined} role="group" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setOpenMenu(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    function onDown(event: PointerEvent) {
      if (!(event.target as HTMLElement).closest("[data-menu]")) setOpenMenu(null);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu]);

  const toggleMenu = (id: string) => setOpenMenu((current) => (current === id ? null : id));
  const pick = (apply: () => void) => {
    apply();
    setOpenMenu(null);
  };
  const companyName = companies.find((entry) => entry.id === company)?.name ?? null;
  const topicName = topics.find((entry) => entry.id === topic)?.name ?? null;
  const active: { key: string; label: string; clear: () => void }[] = [
    ...(companyName ? [{ key: "company", label: companyName, clear: () => setCompany("all") }] : []),
    ...(topicName ? [{ key: "topic", label: topicName, clear: () => setTopic("all") }] : []),
    ...(evidence !== "all"
      ? [{ key: "evidence", label: evidenceCopy("design", evidence).short, clear: () => setEvidence("all") }]
      : []),
    ...(needle ? [{ key: "query", label: `“${query.trim()}”`, clear: () => setQuery("") }] : []),
  ];

  function surprise() {
    const pool = shown.length > 0 ? shown : inMode;
    const unseen = pool.filter((item) => !done.has(item.id));
    const from = unseen.length > 0 ? unseen : pool;
    router.push(from[Math.floor(Math.random() * from.length)].href);
  }

  return (
    <>
      <div className={styles.dock}>
        <div className={styles.dockMain}>
          <div className={styles.kinds} role="group" aria-label="Kind of question">
            {MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={mode === entry.id}
                onClick={() => chooseMode(entry.id)}
              >
                {entry.label}
                <span>{modeCount(entry.id)}</span>
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <span className={styles.visuallyHidden}>Search the questions</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search a company, topic or problem"
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd aria-hidden="true">/</kbd>
          </label>
          <button type="button" className={styles.surprise} onClick={surprise}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h3c4 0 5 10 9 10h4M4 17h3c1.6 0 2.7-1.4 3.7-3M14 7.5c.7-.3 1.4-.5 2-.5h4M17 4l3 3-3 3M17 14l3 3-3 3" />
            </svg>
            <span>Surprise me</span>
          </button>
        </div>

        <div className={styles.dockFilters}>
          <Menu id="company" label="Company" summary={companyName} open={openMenu === "company"} onToggle={toggleMenu}>
            <button
              type="button"
              className={styles.optAll}
              aria-pressed={company === "all"}
              onClick={() => pick(() => setCompany("all"))}
            >
              All companies
            </button>
            {GROUPS.map((group) => (
              <div className={styles.optGroup} key={group.id}>
                <p>{group.label}</p>
                <div className={styles.coGrid}>
                  {companies
                    .filter((entry) => entry.group === group.id)
                    .map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        style={tint(entry.accent)}
                        aria-pressed={company === entry.id}
                        onClick={() => pick(() => setCompany(company === entry.id ? "all" : entry.id))}
                      >
                        <b aria-hidden="true">{entry.name.charAt(0)}</b>
                        {entry.name}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </Menu>

          <Menu id="topic" label="Topic" summary={topicName} open={openMenu === "topic"} onToggle={toggleMenu}>
            <button
              type="button"
              className={styles.optAll}
              aria-pressed={topic === "all"}
              onClick={() => pick(() => setTopic("all"))}
            >
              Every topic
            </button>
            {(["design", "coding"] as const)
              .filter((kind) => mode === "all" || mode === kind)
              .map((kind) => (
                <div className={styles.optGroup} key={kind}>
                  <p>{kind === "design" ? "System design" : "Coding patterns"}</p>
                  <div className={styles.tagGrid}>
                    {visibleTopics
                      .filter((entry) => entry.kind === kind)
                      .map((entry) => (
                        <button
                          key={`${entry.kind}-${entry.id}`}
                          type="button"
                          aria-pressed={topic === entry.id}
                          title={entry.blurb}
                          onClick={() => pick(() => setTopic(topic === entry.id ? "all" : entry.id))}
                        >
                          {entry.name} <span>{entry.count}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
          </Menu>

          <Menu
            id="evidence"
            label="Reported"
            summary={evidence === "all" ? null : evidenceCopy("design", evidence).short}
            open={openMenu === "evidence"}
            onToggle={toggleMenu}
          >
            <button
              type="button"
              className={styles.optAll}
              aria-pressed={evidence === "all"}
              onClick={() => pick(() => setEvidence("all"))}
            >
              Any
            </button>
            <div className={styles.rows}>
              {EVIDENCE_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={evidence === key}
                  onClick={() => pick(() => setEvidence(evidence === key ? "all" : key))}
                >
                  <i data-evidence={key} aria-hidden="true" />
                  <span>
                    <b>{evidenceCopy("design", key).short}</b>
                    <em>{evidenceCopy("design", key).hint}</em>
                  </span>
                </button>
              ))}
            </div>
          </Menu>

          <Menu
            id="sort"
            label="Order"
            summary={sort === "company" ? "By company" : null}
            open={openMenu === "sort"}
            onToggle={toggleMenu}
            end
          >
            <div className={styles.rows}>
              <button type="button" aria-pressed={sort === "reported"} onClick={() => pick(() => setSort("reported"))}>
                <span>
                  <b>Best reported first</b>
                  <em>Questions with the most evidence come first.</em>
                </span>
              </button>
              <button type="button" aria-pressed={sort === "company"} onClick={() => pick(() => setSort("company"))}>
                <span>
                  <b>By company</b>
                  <em>Grouped in the order of the company list.</em>
                </span>
              </button>
            </div>
          </Menu>

          <p className={styles.count} role="status">
            <b>{shown.length}</b> of {items.length} questions
            {practisedCount > 0 && <span> · {practisedCount} practised</span>}
          </p>
        </div>

        {active.length > 0 && (
          <div className={styles.activeRow}>
            <ul aria-label="Active filters">
              {active.map((chip) => (
                <li key={chip.key}>
                  <button type="button" onClick={chip.clear} aria-label={`Remove filter ${chip.label}`}>
                    {chip.label}
                    <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.clear} onClick={clear}>
              Clear all
            </button>
          </div>
        )}
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
