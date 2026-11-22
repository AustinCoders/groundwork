"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { skillById } from "@/lib/resume/skills";
import { monthLabel } from "@/lib/resume/text";
import type { Marks } from "@/lib/resume/store";
import type { FixSeverity, QuestionGroup, ResumeAnalysis, ResumeFix, ResumeQuestion } from "@/lib/resume/types";
import styles from "./resume.module.css";

export const GROUP_LABEL: Record<QuestionGroup, string> = {
  "deep-dive": "Your bullets",
  roles: "Your roles",
  projects: "Your projects",
  skills: "Your skills",
  gaps: "Gaps and risks",
  people: "About you",
};

const GROUP_ORDER: QuestionGroup[] = ["deep-dive", "roles", "projects", "skills", "gaps", "people"];

const SEVERITY_LABEL: Record<FixSeverity, string> = { high: "Fix first", medium: "Worth fixing", low: "Polish" };

type Tab = "questions" | "fixes" | "study" | "read";

function skillName(id: string): string {
  return skillById(id)?.name ?? id;
}

function QuestionCard({
  question,
  known,
  onToggle,
}: {
  question: ResumeQuestion;
  known: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className={styles.qCard} data-known={known || undefined}>
      <div className={styles.qTop}>
        <span className={styles.qGroup}>
          {question.skill ? skillName(question.skill) : GROUP_LABEL[question.group]}
        </span>
        <button type="button" className={styles.markBtn} aria-pressed={known} onClick={onToggle}>
          <span aria-hidden="true">{known ? "✓" : "○"}</span>
          {known ? "Practised" : "Mark practised"}
        </button>
      </div>
      <p className={styles.qText}>{question.q}</p>
      {question.quote && <blockquote className={styles.quote}>{question.quote}</blockquote>}
      <div className={styles.qActions}>
        {(question.why || question.followUps.length > 0) && (
          <button
            type="button"
            className={styles.textBtn}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "Why they ask"}
            {question.followUps.length > 0 && !open && ` · ${question.followUps.length} follow-ups`}
          </button>
        )}
        {question.source && (
          <Link href={question.source.href} className={styles.sourceLink} target="_blank">
            Model answer <span aria-hidden="true">↗</span>
          </Link>
        )}
      </div>
      {open && (
        <div id={panelId} className={styles.qMore}>
          <p>{question.why}</p>
          {question.followUps.length > 0 && (
            <>
              <p className={styles.miniHead}>They will push with</p>
              <ul>
                {question.followUps.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function FixCard({ fix, fixed, onToggle }: { fix: ResumeFix; fixed: boolean; onToggle: () => void }) {
  return (
    <li className={styles.fixCard} data-severity={fix.severity} data-fixed={fixed || undefined}>
      <div className={styles.qTop}>
        <span className={styles.severity}>{SEVERITY_LABEL[fix.severity]}</span>
        <button type="button" className={styles.markBtn} aria-pressed={fixed} onClick={onToggle}>
          <span aria-hidden="true">{fixed ? "✓" : "○"}</span>
          {fixed ? "Fixed" : "Mark fixed"}
        </button>
      </div>
      <h3 className={styles.fixTitle}>{fix.title}</h3>
      <p className={styles.fixDetail}>{fix.detail}</p>
      {fix.quotes.length > 0 && (
        <ul className={styles.fixQuotes} aria-label="Where we saw it">
          {fix.quotes.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      )}
      {fix.suggestion && (
        <p className={styles.suggestion}>
          <span>Example</span>
          {fix.suggestion}
        </p>
      )}
    </li>
  );
}

export function Results({
  analysis,
  marks,
  onMark,
  sample,
}: {
  analysis: ResumeAnalysis;
  marks: Marks;
  onMark: (id: string, mark: "known" | "fixed" | null) => void;
  sample?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("questions");
  const [group, setGroup] = useState<QuestionGroup | "all">("all");
  const [hideKnown, setHideKnown] = useState(false);
  const [limit, setLimit] = useState(12);
  const baseId = useId();
  const { parsed, questions, fixes, study, missing } = analysis;

  const counts = useMemo(() => {
    const map = new Map<QuestionGroup, number>();
    for (const q of questions) map.set(q.group, (map.get(q.group) ?? 0) + 1);
    return map;
  }, [questions]);
  const known = questions.filter((q) => marks[q.id] === "known").length;
  const fixedCount = fixes.filter((f) => marks[f.id] === "fixed").length;
  const shown = questions.filter(
    (q) => (group === "all" || q.group === group) && !(hideKnown && marks[q.id] === "known")
  );
  const years = parsed.months !== null ? Math.round((parsed.months / 12) * 10) / 10 : null;
  const tabs: { id: Tab; label: string }[] = [
    { id: "questions", label: `Questions · ${questions.length}` },
    { id: "fixes", label: `Fixes · ${fixes.length}` },
    { id: "study", label: "Study plan" },
    { id: "read", label: "What we read" },
  ];

  return (
    <section className={styles.results} aria-label={sample ? "Sample result" : "Your result"}>
      <div className={styles.summary}>
        <div className={styles.summaryWho}>
          <p className={styles.summaryKicker}>{sample ? "Sample resume" : "Your resume"}</p>
          <p className={styles.summaryName}>{parsed.name || "Name not found"}</p>
          <p className={styles.summaryMeta}>
            {years !== null ? `About ${years} years of experience` : "Experience dates not found"} ·{" "}
            {parsed.roles.length} role{parsed.roles.length === 1 ? "" : "s"} · {parsed.pages} page
            {parsed.pages === 1 ? "" : "s"}
          </p>
        </div>
        <div className={styles.summaryStats}>
          <p>
            <strong>{known}</strong>
            <span>of {questions.length} practised</span>
          </p>
          <p>
            <strong>{fixedCount}</strong>
            <span>of {fixes.length} fixed</span>
          </p>
        </div>
        <div className={styles.skillRow}>
          {parsed.skills.slice(0, 14).map((id) => (
            <span key={id} className={styles.skillChip}>
              {skillName(id)}
            </span>
          ))}
          {missing.map((id) => (
            <span key={id} className={styles.missingChip} title="The job description asks for this">
              {skillName(id)} <span aria-hidden="true">?</span>
              <span className={styles.srOnly}>, asked for in the job description but not on your resume</span>
            </span>
          ))}
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Result">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${baseId}-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`${baseId}-panel`}
            className={styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${tab}`} className={styles.panel}>
        {tab === "questions" && (
          <>
            <div className={styles.filters}>
              <div className={styles.chips} role="group" aria-label="Show questions about">
                <button
                  type="button"
                  className={styles.filterChip}
                  aria-pressed={group === "all"}
                  onClick={() => {
                    setGroup("all");
                    setLimit(12);
                  }}
                >
                  All <span>{questions.length}</span>
                </button>
                {GROUP_ORDER.filter((g) => counts.get(g)).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={styles.filterChip}
                    aria-pressed={group === g}
                    onClick={() => {
                      setGroup(g);
                      setLimit(12);
                    }}
                  >
                    {GROUP_LABEL[g]} <span>{counts.get(g)}</span>
                  </button>
                ))}
              </div>
              <label className={styles.hideKnown}>
                <input type="checkbox" checked={hideKnown} onChange={(e) => setHideKnown(e.target.checked)} />
                Hide practised
              </label>
            </div>
            {shown.length === 0 ? (
              <p className={styles.empty}>
                Every question here is marked practised. Untick “Hide practised” to see them again.
              </p>
            ) : (
              <ol className={styles.qList}>
                {shown.slice(0, limit).map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    known={marks[q.id] === "known"}
                    onToggle={() => onMark(q.id, marks[q.id] === "known" ? null : "known")}
                  />
                ))}
              </ol>
            )}
            {shown.length > limit && (
              <button type="button" className={styles.more} onClick={() => setLimit((n) => n + 20)}>
                Show {Math.min(20, shown.length - limit)} more of {shown.length - limit} left
              </button>
            )}
          </>
        )}

        {tab === "fixes" &&
          (fixes.length === 0 ? (
            <p className={styles.empty}>No rule-based problems found. Read it once more out loud before you send it.</p>
          ) : (
            <ol className={styles.fixList}>
              {fixes.map((f) => (
                <FixCard
                  key={f.id}
                  fix={f}
                  fixed={marks[f.id] === "fixed"}
                  onToggle={() => onMark(f.id, marks[f.id] === "fixed" ? null : "fixed")}
                />
              ))}
            </ol>
          ))}

        {tab === "study" && (
          <div className={styles.study}>
            <p className={styles.panelLead}>
              Where on Groundwork to prepare for the skills on this resume
              {missing.length > 0 ? " and the ones the job description asks for" : ""}.
            </p>
            <ul className={styles.studyList}>
              {study.map((s) => (
                <li key={s.id} data-missing={s.missing || undefined}>
                  <span className={styles.studyName}>
                    {s.name}
                    {s.missing && <span className={styles.studyFlag}>Asked for, not on resume</span>}
                  </span>
                  <Link href={s.href} className={styles.sourceLink}>
                    {s.label} <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "read" && (
          <div className={styles.read}>
            <p className={styles.panelLead}>
              This is what was read from the file. If something is missing here, applicant tracking systems probably
              miss it too.
            </p>
            <dl className={styles.readFacts}>
              <div>
                <dt>Name</dt>
                <dd>{parsed.name || "Not found"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{parsed.email ? (sample ? parsed.email : "Found") : "Not found"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{parsed.phone ? (sample ? parsed.phone : "Found") : "Not found"}</dd>
              </div>
              <div>
                <dt>Links</dt>
                <dd>{parsed.links.length ? parsed.links.map((l) => l.url).join(", ") : "None found"}</dd>
              </div>
              <div>
                <dt>Sections</dt>
                <dd>{parsed.sections.map((s) => s.title || "Top").join(" · ") || "None found"}</dd>
              </div>
              <div>
                <dt>Words</dt>
                <dd>{parsed.words}</dd>
              </div>
            </dl>
            <p className={styles.miniHead}>Roles</p>
            {parsed.roles.length === 0 ? (
              <p className={styles.empty}>No roles with dates were found.</p>
            ) : (
              <ol className={styles.roles}>
                {parsed.roles.map((r) => (
                  <li key={`${r.heading}${r.dateText}`}>
                    <strong>{r.heading || "Role without a title"}</strong>
                    <span>
                      {r.start ? monthLabel(r.start) : "?"} – {r.current ? "Present" : r.end ? monthLabel(r.end) : "?"}{" "}
                      · {r.bullets.length} bullet{r.bullets.length === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {parsed.projects.length > 0 && (
              <>
                <p className={styles.miniHead}>Projects</p>
                <ol className={styles.roles}>
                  {parsed.projects.map((p) => (
                    <li key={p.name + p.bullets[0]}>
                      <strong>{p.name || "Untitled project"}</strong>
                      <span>
                        {p.bullets.length} bullet{p.bullets.length === 1 ? "" : "s"}
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
