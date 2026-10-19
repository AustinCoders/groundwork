import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, Kicker, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { PATTERN_NAMES } from "@/content/system-design/company-questions/dsa-patterns";
import { accentVar } from "@/lib/accent";
import { chapters } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { AnswerRail } from "../../AnswerRail";
import { CodeBlock } from "../../CodeBlock";
import { DoneMark } from "../../DoneMark";
import { PatternGlyph } from "../../PatternGlyph";
import { AfterActions, ChapterLinks, Pager, RelatedList, SourcesList } from "../../ReaderParts";
import { TryFirst } from "../../TryFirst";
import { highlight } from "../../highlight";
import { exerciseOf } from "../../data";
import { CODING_PHASES, HUB_PATH, codingPath, evidenceCopy, withArticle } from "../../shared";
import styles from "../../company-questions.module.css";
import coding from "../../coding.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPANY_DSA.map((question) => ({ id: question.id }));
}

const STEPS = [
  { id: "ask", title: "Clarify first", hint: "Pin down the input before you touch the keyboard." },
  { id: "brute", title: "Brute force", hint: "Say the obvious answer and why it is too slow." },
  { id: "insight", title: "The insight", hint: "The one idea that makes it fast, and why it is correct." },
  { id: "walkthrough", title: "Walk it through", hint: "A dry run on the example, step by step." },
  { id: "code", title: "The code", hint: "Runnable JavaScript, checked against test cases." },
  { id: "edges", title: "Edge cases", hint: "What to test before you say you are done." },
  { id: "followups", title: "Follow-ups to expect", hint: "Where the interviewer pushes next." },
  { id: "slips", title: "Where candidates slip", hint: "The mistakes this problem punishes." },
] as const;

const find = (id: string) => COMPANY_DSA.find((question) => question.id === id);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const question = find(id);
  if (!question) return {};
  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  return pageMetadata({
    title: `${question.title}: ${withArticle(company.name)} coding interview question`,
    description: `${question.prompt.slice(0, 150)} Brute force, the key insight, a dry run, runnable code and the follow-ups. ${evidenceCopy("coding", question.evidence).label}.`,
    path: codingPath(question.id),
    type: "article",
  });
}

const short = (value: unknown) => {
  const text = JSON.stringify(value);
  return text.length > 70 ? `${text.slice(0, 67)}…` : text;
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = find(id);
  if (!question) notFound();

  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  const titles = Object.fromEntries(chapters("dsa").map((chapter) => [chapter.id, chapter.title]));
  const index = COMPANY_DSA.indexOf(question);
  const previous = COMPANY_DSA[(index + COMPANY_DSA.length - 1) % COMPANY_DSA.length];
  const next = COMPANY_DSA[(index + 1) % COMPANY_DSA.length];
  const related = COMPANY_DSA.filter((other) => other.id !== question.id && other.patternId === question.patternId)
    .slice(0, 3)
    .map((other) => {
      const otherCompany = COMPANIES.find((entry) => entry.id === other.company)!;
      return {
        href: codingPath(other.id),
        company: `${otherCompany.name} · ${other.difficulty}`,
        title: other.title,
        accent: accentVar(otherCompany.accent),
      };
    });
  const { answer, solution, trace, complexity } = question;
  const bodies: Record<string, string> = {
    ask: answer.ask,
    brute: answer.brute,
    insight: answer.insight,
    walkthrough: answer.walkthrough,
    edges: answer.edges,
    slips: answer.slips,
  };
  const copy = evidenceCopy("coding", question.evidence);
  const exercise = exerciseOf(question.id);
  const tint = { "--accent": accentVar(company.accent) } as CSSProperties;

  return (
    <PageFrame
      title={company.name}
      mark="CQ"
      accent="yellow"
      layout="reader"
      links={[
        { href: "/level/dsa", label: "DSA" },
        { href: HUB_PATH, label: "All questions" },
      ]}
      back={{ href: HUB_PATH, label: "Company questions" }}
      skipLabel="Skip to the solution"
      scan={question.id}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <div style={tint}>
            <header className={styles.qHead}>
              <Kicker mark="CQ">
                {company.name} · Coding · {PATTERN_NAMES[question.patternId]}
              </Kicker>
              <div className={styles.qTitleRow}>
                <span className={coding.titleGlyph} aria-hidden="true">
                  <PatternGlyph pattern={question.patternId} />
                </span>
                <h1 className={styles.qTitle} id="question-title">
                  {question.title}
                </h1>
              </div>
              <ul className={styles.qMeta}>
                <li className={styles.badge} data-evidence={question.evidence}>
                  <i aria-hidden="true" />
                  {copy.label}
                </li>
                <li className={coding.difficulty} data-level={question.difficulty}>
                  {question.difficulty}
                </li>
                {!question.level.startsWith("level not stated") && <li>{question.level}</li>}
                <li>
                  <a href="#sources">
                    {question.sources.length} {question.sources.length === 1 ? "source" : "sources"}
                  </a>
                </li>
                {question.leetcode && (
                  <li>
                    <a
                      href={`https://leetcode.com/problems/${question.leetcode.slug}/`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      LeetCode {question.leetcode.number} ↗
                    </a>
                  </li>
                )}
              </ul>
              <p className={styles.qHint}>{copy.hint}</p>
              {exercise && (
                <p className={styles.solveRow}>
                  <Link className={styles.primaryBtn} href={`/problems/${exercise}`} prefetch={false}>
                    Solve it in the playground, with tests <span aria-hidden="true">→</span>
                  </Link>
                  <DoneMark id={question.id} exercise={exercise} />
                  <span>The playground checks your code against test cases and has hints.</span>
                </p>
              )}
              <figure className={styles.prompt}>
                <span className={styles.promptTape} aria-hidden="true" />
                <figcaption>The problem</figcaption>
                <blockquote>{question.prompt}</blockquote>
                <p>
                  Restated in our own words, not a quote from {company.name} or any page. The answer below is written
                  for this site.
                </p>
              </figure>
            </header>

            <TryFirst
              phases={CODING_PHASES}
              rail={<AnswerRail items={STEPS.map((step) => ({ id: step.id, label: step.title }))} />}
            >
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
                  {step.id === "followups" && (
                    <ol className={styles.followups}>
                      {answer.followups.map((followUp, at) => (
                        <li key={followUp}>
                          <span aria-hidden="true">Q{at + 1}</span>
                          {followUp}
                        </li>
                      ))}
                    </ol>
                  )}
                  {step.id === "insight" && (
                    <dl className={coding.cx}>
                      <div>
                        <dt>Brute force</dt>
                        <dd data-bad="">{complexity.brute}</dd>
                      </div>
                      <div>
                        <dt>Time</dt>
                        <dd>{complexity.time}</dd>
                      </div>
                      <div>
                        <dt>Space</dt>
                        <dd>{complexity.space}</dd>
                      </div>
                    </dl>
                  )}
                  {step.id === "walkthrough" && (
                    <figure className={coding.trace}>
                      <figcaption>{trace.caption}</figcaption>
                      <div
                        className={coding.traceScroll}
                        tabIndex={0}
                        role="group"
                        aria-label="Dry run table, scrollable"
                      >
                        <table>
                          <thead>
                            <tr>
                              {trace.head.map((cell) => (
                                <th key={cell} scope="col">
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {trace.rows.map((row, at) => (
                              <tr key={at}>
                                {row.map((cell, column) => (
                                  <td key={column}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </figure>
                  )}
                  {step.id === "code" && (
                    <>
                      <CodeBlock text={solution.code} title={`${solution.entry}.js`}>
                        {highlight(solution.code)}
                      </CodeBlock>
                      <details className={coding.cases}>
                        <summary>Checked on {solution.cases.length} test cases</summary>
                        <ul>
                          {solution.cases.map((testCase, at) => (
                            <li key={at}>
                              <code>
                                {solution.entry}({testCase.args.map(short).join(", ")})
                              </code>
                              <span aria-hidden="true">→</span>
                              <code>{short(testCase.expected)}</code>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </>
                  )}
                  {step.id !== "followups" && step.id !== "code" && (
                    <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: bodies[step.id] }} />
                  )}
                </section>
              ))}
            </TryFirst>

            <AfterActions
              id={question.id}
              extra={[
                ...(exercise ? [{ href: `/problems/${exercise}`, label: "Solve it with tests" }] : []),
                { href: "/mock", label: "Run a mock interview" },
              ]}
            />
            <SourcesList sources={question.sources} />
            <ChapterLinks heading="Learn the pattern first" ids={question.chapters} base="/dsa" titles={titles} />
            <RelatedList heading={`More on ${PATTERN_NAMES[question.patternId].toLowerCase()}`} items={related} />
            <Pager
              previous={{ href: codingPath(previous.id), title: previous.title }}
              next={{ href: codingPath(next.id), title: next.title }}
            />
          </div>
        </Wrap>

        <Foot>
          <FootLink href={HUB_PATH}>All company questions</FootLink>
          <FootLink href="/level/dsa">DSA course</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
