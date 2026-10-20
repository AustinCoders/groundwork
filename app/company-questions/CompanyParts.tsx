import Link from "next/link";
import type { CSSProperties } from "react";
import { ROUND_KINDS, type RoundType } from "@/content/system-design/company-questions/rounds";
import { ASKED_MODEL } from "@/content/system-design/company-questions/rounds-model";
import type { Round, ReportedPrompt } from "@/content/system-design/company-questions/process-types";
import type { DsaQuestion } from "@/content/system-design/company-questions/dsa-types";
import { CS_SETS } from "@/content/system-design/company-questions/cs-index";
import type { LldQuestion } from "@/content/system-design/company-questions/lld-types";
import type { CompanyQuestion } from "@/content/system-design/company-questions/types";
import { accentVar } from "@/lib/accent";
import { DoneMark } from "./DoneMark";
import { RoundIcon } from "./RoundIcon";
import { bookRoundTitle, bookSamples, exerciseOf } from "./data";
import { SOURCE_KIND_LABEL, codingPath, csPath, evidenceCopy, lldPath, questionPath } from "./shared";
import styles from "./company.module.css";

const CODING_HOSTS: RoundType[] = ["dsa", "oa", "loop", "phone"];
const DESIGN_HOSTS: RoundType[] = ["hld", "loop"];

const tone = (accent: string): CSSProperties => ({ "--tone": accentVar(accent) }) as CSSProperties;

const LLD_ROUNDS: RoundType[] = ["machine-coding", "lld"];

function lldHost(rounds: Round[], question: LldQuestion): number {
  const exact = rounds.findIndex((round) => round.type === question.round);
  if (exact >= 0) return exact;
  const either = rounds.findIndex((round) => LLD_ROUNDS.includes(round.type));
  if (either >= 0) return either;
  return firstHost(rounds, DESIGN_HOSTS);
}

function firstHost(rounds: Round[], hosts: RoundType[]): number {
  for (const host of hosts) {
    const at = rounds.findIndex((round) => round.type === host);
    if (at >= 0) return at;
  }
  return -1;
}

export function RoundStrip({ rounds, people }: { rounds: Round[]; people?: boolean }) {
  return (
    <ol className={styles.strip} aria-label="Rounds in order">
      {rounds.map((round, index) => (
        <li key={`${round.name}-${index}`} style={tone(ROUND_KINDS[round.type].accent)}>
          <a href={`#round-${index + 1}`}>
            <span aria-hidden="true">{index + 1}</span>
            {ROUND_KINDS[round.type].short}
          </a>
        </li>
      ))}
      {people && (
        <li style={tone("purple")}>
          <a href="#people">
            <span aria-hidden="true">★</span>
            People rounds
          </a>
        </li>
      )}
    </ol>
  );
}

function QuestionRow({
  href,
  kind,
  title,
  meta,
  id,
  exercise,
}: {
  href: string;
  kind: string;
  title: string;
  meta: string;
  id: string;
  exercise?: string;
}) {
  return (
    <li>
      <Link href={href} className={styles.qRow} prefetch={false}>
        <span className={styles.qKind}>{kind}</span>
        <span className={styles.qTitle}>{title}</span>
        <span className={styles.qMeta}>{meta}</span>
        <DoneMark id={id} exercise={exercise} />
        <span className={styles.qGo} aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}

export function RoundTimeline({
  rounds,
  accent,
  design,
  coding,
  lld,
  reported,
}: {
  rounds: Round[];
  accent: string;
  design: CompanyQuestion[];
  coding: DsaQuestion[];
  lld: LldQuestion[];
  reported: ReportedPrompt[];
}) {
  const codingAt = firstHost(rounds, CODING_HOSTS);
  const designAt = firstHost(rounds, DESIGN_HOSTS);
  return (
    <ol className={styles.timeline}>
      {rounds.map((round, index) => {
        const kind = ROUND_KINDS[round.type];
        const copy = evidenceCopy("design", round.grade);
        const reportedHere = reported.filter((entry) => {
          if (round.type === "machine-coding" || round.type === "lld") return entry.kind === "lld";
          if (round.type === "sql") return entry.kind === "sql";
          if (round.type === "cs") return entry.kind === "cs";
          if (round.type === "domain") return entry.kind === "domain";
          if (round.type === "dsa" && index === codingAt) return entry.kind === "coding";
          if (round.type === "hld" && index === designAt) return entry.kind === "hld";
          return false;
        });
        const samples = ["behavioral", "manager", "hr", "bar-raiser", "sql", "take-home"].includes(round.type)
          ? bookSamples(round.type, 3)
          : [];
        const bookLinks = kind.book
          .map((id) => ({ id, title: bookRoundTitle(id) }))
          .filter((entry): entry is { id: string; title: string } => entry.title !== null);
        const hostsCoding = index === codingAt && coding.length > 0;
        const hostsDesign = index === designAt && design.length > 0;
        const setsHere =
          round.type === "sql"
            ? CS_SETS.filter((set) => set.id === "sql")
            : round.type === "cs"
              ? CS_SETS.filter((set) => set.id !== "sql")
              : [];
        const lldHere = lld.filter((question) => lldHost(rounds, question) === index);
        return (
          <li
            key={`${round.name}-${index}`}
            id={`round-${index + 1}`}
            className={styles.round}
            data-reveal=""
            style={tone(kind.accent || accent)}
          >
            <span className={styles.node} aria-hidden="true">
              {index + 1}
            </span>
            <article className={styles.roundCard}>
              <header className={styles.roundHead}>
                <span className={styles.roundIcon} aria-hidden="true">
                  <RoundIcon name={kind.icon} />
                </span>
                <div>
                  <h3>{round.name}</h3>
                  <p>
                    <span>{kind.label}</span>
                    {round.duration && <span>{round.duration}</span>}
                  </p>
                </div>
                <span className={styles.grade} data-evidence={round.grade} title={copy.hint}>
                  <i aria-hidden="true" />
                  {copy.short}
                </span>
              </header>
              <p className={styles.format}>{round.format}</p>
              {round.tested.length > 0 && (
                <ul className={styles.tested} aria-label="What this round tests">
                  {round.tested.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {round.variesBy && (
                <p className={styles.varies}>
                  <b>Varies:</b> {round.variesBy}
                </p>
              )}

              {(hostsCoding ||
                hostsDesign ||
                lldHere.length > 0 ||
                setsHere.length > 0 ||
                samples.length > 0 ||
                reportedHere.length > 0) && (
                <div className={styles.practice}>
                  <h4>Practise for this round</h4>
                  <ul>
                    {hostsCoding &&
                      coding.map((question) => (
                        <QuestionRow
                          key={question.id}
                          href={codingPath(question.id)}
                          kind="Coding"
                          title={question.title}
                          meta={`${question.difficulty} · ${question.complexity.time}`}
                          id={question.id}
                          exercise={exerciseOf(question.id)}
                        />
                      ))}
                    {hostsDesign &&
                      design.map((question) => (
                        <QuestionRow
                          key={question.id}
                          href={questionPath(question.id)}
                          kind="Design"
                          title={question.title}
                          meta={`${question.chapters.length} chapters · diagrams`}
                          id={question.id}
                        />
                      ))}
                    {lldHere.map((question) => (
                      <QuestionRow
                        key={question.id}
                        href={lldPath(question.id)}
                        kind={question.round === "lld" ? "LLD" : "Machine coding"}
                        title={question.title}
                        meta={`${question.patterns.join(", ")} · runnable code`}
                        id={question.id}
                      />
                    ))}
                    {setsHere.map((set) => (
                      <QuestionRow
                        key={set.id}
                        href={csPath(set.id)}
                        kind="Fundamentals"
                        title={`${set.title}: ${set.questions.length} reported questions`}
                        meta="model answers"
                        id={`cs-${set.id}`}
                      />
                    ))}
                    {samples.map((sample) => (
                      <li key={sample.id}>
                        <Link
                          href={`/interview/${sample.roundId}#${sample.id}`}
                          className={styles.qRow}
                          prefetch={false}
                        >
                          <span className={styles.qKind}>Book</span>
                          <span className={styles.qTitle}>{sample.text}</span>
                          <span className={styles.qMeta}>{sample.roundTitle}</span>
                          <span className={styles.qGo} aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {reportedHere.length > 0 && (
                    <ul className={styles.reported}>
                      {reportedHere.map((entry) => (
                        <li key={entry.title}>
                          <span className={styles.qKind}>Reported</span>
                          <span>
                            {entry.title}
                            {entry.note && <em> {entry.note}</em>}
                          </span>
                          <a href={entry.sources[0]?.url} rel="noopener noreferrer" target="_blank">
                            {entry.sources[0] ? SOURCE_KIND_LABEL[entry.sources[0].kind] : "source"} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {reportedHere.length > 0 && (
                    <p className={styles.reportedNote}>
                      Reported prompts have no written answer yet. Read the linked page for context.
                    </p>
                  )}
                </div>
              )}

              <details className={styles.more}>
                <summary>What can be asked in a {kind.label.toLowerCase()} round</summary>
                <p>{kind.what}</p>
                <ul>
                  {kind.asked.map((item, at) => (
                    <li key={item}>
                      <details className={styles.model}>
                        <summary>{item}</summary>
                        <p>{ASKED_MODEL[round.type][at].a}</p>
                        {ASKED_MODEL[round.type][at].link && (
                          <Link href={ASKED_MODEL[round.type][at].link!.href} prefetch={false}>
                            {ASKED_MODEL[round.type][at].link!.label} →
                          </Link>
                        )}
                      </details>
                    </li>
                  ))}
                </ul>
                {(bookLinks.length > 0 || kind.topics.length > 0) && (
                  <p className={styles.prepare}>
                    <b>Prepare with:</b>{" "}
                    {bookLinks.map((entry) => (
                      <Link key={entry.id} href={`/interview/${entry.id}`} prefetch={false}>
                        Book · {entry.title}
                      </Link>
                    ))}
                    {kind.topics.map((topic) => (
                      <Link key={topic.href} href={topic.href} prefetch={false}>
                        {topic.label}
                      </Link>
                    ))}
                  </p>
                )}
              </details>

              {round.sources.length > 0 && (
                <details className={styles.more}>
                  <summary>
                    {round.sources.length} {round.sources.length === 1 ? "source" : "sources"} for this round
                  </summary>
                  <ul className={styles.srcList}>
                    {round.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} rel="noopener noreferrer" target="_blank">
                          <span>
                            {SOURCE_KIND_LABEL[source.kind]}
                            {source.year ? ` · ${source.year}` : ""}
                          </span>
                          {source.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
