"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { usePractised } from "@/lib/companyQuestionsProgress";
import { accentVar } from "@/lib/accent";
import {
  EVIDENCE_COPY,
  EVIDENCE_ORDER,
  questionPath,
  type EvidenceKey,
  type HubCompany,
  type HubQuestion,
  type HubTheme,
} from "./shared";
import styles from "./company-questions.module.css";

const GROUPS = [
  { id: "global", label: "Global", note: "Big tech and product companies" },
  { id: "india", label: "India", note: "Indian product and payments companies" },
] as const;

function tint(accent: string): CSSProperties {
  return { "--accent": accentVar(accent) } as CSSProperties;
}

export function Browser({
  questions,
  companies,
  themes,
}: {
  questions: HubQuestion[];
  companies: HubCompany[];
  themes: HubTheme[];
}) {
  const router = useRouter();
  const done = usePractised();
  const [company, setCompany] = useState("all");
  const [theme, setTheme] = useState("all");
  const [evidence, setEvidence] = useState<EvidenceKey | "all">("all");
  const [query, setQuery] = useState("");
  const bar = useRef<HTMLDivElement>(null);

  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      questions.filter(
        (item) =>
          (company === "all" || item.company === company) &&
          (theme === "all" || item.theme === theme) &&
          (evidence === "all" || item.evidence === evidence) &&
          (!needle || item.search.includes(needle))
      ),
    [questions, company, theme, evidence, needle]
  );
  const practisedCount = questions.filter((item) => done[item.id]).length;
  const filtered = company !== "all" || theme !== "all" || evidence !== "all" || needle !== "";

  function pickCompany(id: string) {
    const next = company === id ? "all" : id;
    setCompany(next);
    if (next !== "all") bar.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function clear() {
    setCompany("all");
    setTheme("all");
    setEvidence("all");
    setQuery("");
  }

  function surprise() {
    const pool = shown.length > 0 ? shown : questions;
    const unseen = pool.filter((item) => !done[item.id]);
    const from = unseen.length > 0 ? unseen : pool;
    router.push(questionPath(from[Math.floor(Math.random() * from.length)].id));
  }

  return (
    <>
      <div className={styles.wall} role="group" aria-label="Pick a company">
        {GROUPS.map((group) => {
          const inGroup = companies.filter((entry) => entry.group === group.id);
          return (
            <div className={styles.wallGroup} key={group.id}>
              <p className={styles.wallLabel}>
                <b>{group.label}</b>
                <span>{group.note}</span>
              </p>
              <ul className={styles.tiles}>
                {inGroup.map((entry, index) => {
                  const finished = entry.ids.filter((id) => done[id]).length;
                  const on = company === entry.id;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={styles.tile}
                        style={
                          { ...tint(entry.accent), "--tilt": `${[-0.9, 0.7, -0.4, 1][index % 4]}deg` } as CSSProperties
                        }
                        aria-pressed={on}
                        onClick={() => pickCompany(entry.id)}
                      >
                        <span className={styles.monogram} aria-hidden="true">
                          {entry.name.charAt(0)}
                        </span>
                        <span className={styles.tileName}>{entry.name}</span>
                        <span className={styles.tileCount}>
                          {entry.count} {entry.count === 1 ? "question" : "questions"}
                        </span>
                        <span className={styles.dots} aria-hidden="true">
                          {entry.ids.map((id) => (
                            <i key={id} data-done={done[id] ? "" : undefined} />
                          ))}
                        </span>
                        {finished > 0 && <span className={styles.visuallyHidden}>{finished} practised</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
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
              placeholder="Search: feed, payments, cache, Flipkart…"
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
                title={EVIDENCE_COPY[key].hint}
                onClick={() => setEvidence(evidence === key ? "all" : key)}
              >
                <i data-evidence={key} aria-hidden="true" />
                {EVIDENCE_COPY[key].short}
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
        <div className={styles.themes} role="group" aria-label="Practise by topic">
          <span className={styles.themesLabel}>Practise by topic</span>
          <button type="button" aria-pressed={theme === "all"} onClick={() => setTheme("all")}>
            Everything
          </button>
          {themes.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={theme === entry.id}
              title={entry.blurb}
              onClick={() => setTheme(theme === entry.id ? "all" : entry.id)}
            >
              {entry.name} <span>{entry.count}</span>
            </button>
          ))}
        </div>
        <p className={styles.status} role="status">
          <span>
            Showing <b>{shown.length}</b> of {questions.length}
            {practisedCount > 0 && <> · you have practised {practisedCount}</>}
          </span>
          {filtered && (
            <button type="button" onClick={clear}>
              Clear filters
            </button>
          )}
        </p>
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
          {shown.map((item) => (
            <li key={item.id}>
              <Link
                href={questionPath(item.id)}
                className={styles.card}
                style={tint(item.accent)}
                data-evidence={item.evidence}
                prefetch={false}
              >
                {item.evidence === "several" && <span className={styles.tape} aria-hidden="true" />}
                <span className={styles.cardTop}>
                  <span className={styles.monogramSm} aria-hidden="true">
                    {item.companyName.charAt(0)}
                  </span>
                  <span className={styles.cardCompany}>{item.companyName}</span>
                  <span className={styles.badge} data-evidence={item.evidence}>
                    <i aria-hidden="true" />
                    {EVIDENCE_COPY[item.evidence].short}
                  </span>
                </span>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardPrompt}>{item.prompt}</span>
                <span className={styles.cardFoot}>
                  <span>{item.themeName}</span>
                  {item.level && <span>{item.level}</span>}
                  {done[item.id] ? (
                    <span className={styles.practised}>Practised ✓</span>
                  ) : (
                    <span className={styles.open}>
                      Open <span aria-hidden="true">→</span>
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
