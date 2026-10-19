import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, Kicker, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { THEMES, THEME_OF } from "@/content/system-design/company-questions/themes";
import { accentVar } from "@/lib/accent";
import { chapters } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { AnswerRail } from "../AnswerRail";
import { PractisedButton } from "../PractisedButton";
import { TryFirst } from "../TryFirst";
import { EVIDENCE_COPY, HUB_PATH, questionPath } from "../shared";
import styles from "../company-questions.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPANY_QUESTIONS.map((question) => ({ id: question.id }));
}

const KIND_LABEL = {
  "candidate-report": "Candidate write-up",
  "prep-guide": "Prep guide",
  official: "Official",
} as const;

const STEPS = [
  { id: "ask", title: "Ask first", hint: "Clarify the problem before you draw anything." },
  { id: "numbers", title: "Numbers", hint: "A back-of-envelope that decides the shape." },
  { id: "design", title: "The design", hint: "Components, data and the hard parts." },
  { id: "tradeoffs", title: "Trade-offs", hint: "What you chose, and when you would flip." },
  { id: "followups", title: "Follow-ups to expect", hint: "Where the interviewer pushes next." },
  { id: "slips", title: "Where candidates slip", hint: "The mistakes this question punishes." },
] as const;

const find = (id: string) => COMPANY_QUESTIONS.find((question) => question.id === id);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const question = find(id);
  if (!question) return {};
  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  return pageMetadata({
    title: `${question.title}: a ${company.name} system design question`,
    description: `${question.prompt} A worked answer with the numbers, the design, the trade-offs and the follow-ups. ${EVIDENCE_COPY[question.evidence].label}.`,
    path: questionPath(question.id),
    type: "article",
  });
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = find(id);
  if (!question) notFound();

  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  const titles = Object.fromEntries(chapters("system-design").map((chapter) => [chapter.id, chapter.title]));
  const index = COMPANY_QUESTIONS.indexOf(question);
  const previous = COMPANY_QUESTIONS[(index + COMPANY_QUESTIONS.length - 1) % COMPANY_QUESTIONS.length];
  const next = COMPANY_QUESTIONS[(index + 1) % COMPANY_QUESTIONS.length];
  const theme = THEMES.find((entry) => entry.id === THEME_OF[question.id]);
  const related = COMPANY_QUESTIONS.filter(
    (other) => other.id !== question.id && THEME_OF[other.id] === THEME_OF[question.id]
  ).slice(0, 3);
  const { answer } = question;
  const bodies: Record<string, string> = {
    ask: answer.ask,
    numbers: answer.numbers,
    design: answer.design,
    tradeoffs: answer.tradeoffs,
    slips: answer.slips,
  };
  const tint = { "--accent": accentVar(company.accent) } as CSSProperties;

  return (
    <PageFrame
      title={company.name}
      mark="SD"
      accent="yellow"
      layout="reader"
      links={[
        { href: "/system-design", label: "System design" },
        { href: HUB_PATH, label: "All questions" },
      ]}
      back={{ href: HUB_PATH, label: "Company questions" }}
      skipLabel="Skip to the answer"
      scan={question.id}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <div style={tint}>
            <header className={styles.qHead}>
              <Kicker mark="SD">
                {company.name} · {theme?.name ?? "System design"}
              </Kicker>
              <div className={styles.qTitleRow}>
                <span className={styles.monogramLg} aria-hidden="true">
                  {company.name.charAt(0)}
                </span>
                <h1 className={styles.qTitle} id="question-title">
                  {question.title}
                </h1>
              </div>
              <ul className={styles.qMeta}>
                <li className={styles.badge} data-evidence={question.evidence}>
                  <i aria-hidden="true" />
                  {EVIDENCE_COPY[question.evidence].label}
                </li>
                {!question.level.startsWith("level not stated") && <li>{question.level}</li>}
                <li>
                  <a href="#sources">
                    {question.sources.length} {question.sources.length === 1 ? "source" : "sources"}
                  </a>
                </li>
              </ul>
              <p className={styles.qHint}>{EVIDENCE_COPY[question.evidence].hint}</p>
              <figure className={styles.prompt}>
                <span className={styles.promptTape} aria-hidden="true" />
                <figcaption>The prompt</figcaption>
                <blockquote>{question.prompt}</blockquote>
                <p>
                  A representative prompt in the style reported, not a quote from {company.name}. The answer below is
                  written for this site.
                </p>
              </figure>
            </header>

            <TryFirst rail={<AnswerRail items={STEPS.map((step) => ({ id: step.id, label: step.title }))} />}>
              {STEPS.map((step, position) => (
                <section
                  className={styles.step}
                  id={step.id}
                  key={step.id}
                  data-step={step.id}
                  aria-labelledby={`${step.id}-h`}
                >
                  <header className={styles.stepHead}>
                    <span className={styles.stepNo} aria-hidden="true">
                      {position + 1}
                    </span>
                    <div>
                      <h2 id={`${step.id}-h`}>{step.title}</h2>
                      <p>{step.hint}</p>
                    </div>
                  </header>
                  {step.id === "followups" ? (
                    <ol className={styles.followups}>
                      {answer.followups.map((followUp, at) => (
                        <li key={followUp}>
                          <span aria-hidden="true">Q{at + 1}</span>
                          {followUp}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: bodies[step.id] }} />
                  )}
                </section>
              ))}
            </TryFirst>

            <section className={styles.after} aria-labelledby="after-h">
              <h2 id="after-h">Now make it stick</h2>
              <div className={styles.afterRow}>
                <PractisedButton id={question.id} />
                <Link className={styles.ghostBtn} href="/whiteboard" prefetch={false}>
                  Redraw it on the whiteboard
                </Link>
                <Link className={styles.ghostBtn} href="/mock" prefetch={false}>
                  Run a mock interview
                </Link>
              </div>
            </section>

            <section className={styles.refs} id="sources" aria-labelledby="sources-h">
              <h2 id="sources-h">Where this was reported</h2>
              <p className={styles.refsNote}>
                Public pages only. Companies do not confirm these, and they rotate their questions, so treat each link
                as one person&apos;s account.
              </p>
              <ul className={styles.sources}>
                {question.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} rel="noopener noreferrer" target="_blank">
                      <span className={styles.sourceKind}>
                        {KIND_LABEL[source.kind]}
                        {source.year ? ` · ${source.year}` : ""}
                      </span>
                      <span className={styles.sourceLabel}>{source.label}</span>
                      <span className={styles.sourceGo} aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {question.chapters.length > 0 && (
              <section className={styles.refs} aria-labelledby="read-h">
                <h2 id="read-h">Read these chapters first</h2>
                <ul className={styles.chapterLinks}>
                  {question.chapters.map((chapterId) => (
                    <li key={chapterId}>
                      <Link href={`/system-design/${chapterId}`} prefetch={false}>
                        {titles[chapterId] ?? chapterId} <span aria-hidden="true">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {related.length > 0 && (
              <section className={styles.refs} aria-labelledby="related-h">
                <h2 id="related-h">More on {theme?.name.toLowerCase()}</h2>
                <ul className={styles.related}>
                  {related.map((other) => {
                    const otherCompany = COMPANIES.find((entry) => entry.id === other.company)!;
                    return (
                      <li key={other.id} style={{ "--accent": accentVar(otherCompany.accent) } as CSSProperties}>
                        <Link href={questionPath(other.id)} prefetch={false}>
                          <span>{otherCompany.name}</span>
                          {other.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <nav className={styles.pager} aria-label="Other questions">
              <Link href={questionPath(previous.id)} prefetch={false}>
                <span>← Previous</span>
                {previous.title}
              </Link>
              <Link href={questionPath(next.id)} prefetch={false}>
                <span>Next →</span>
                {next.title}
              </Link>
            </nav>
          </div>
        </Wrap>

        <Foot>
          <FootLink href={HUB_PATH}>All company questions</FootLink>
          <FootLink href="/system-design">System design chapters</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
