import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { CS_SETS } from "@/content/system-design/company-questions/cs-index";
import { accentVar } from "@/lib/accent";
import { pageMetadata } from "@/lib/metadata";
import { AnswerRail } from "../../AnswerRail";
import { CodeBlock } from "../../CodeBlock";
import { RevealRoot } from "../../RevealRoot";
import { AfterActions } from "../../ReaderParts";
import { SetHero } from "../../SetHero";
import { SOURCE_KIND_LABEL, EVIDENCE_COPY, HUB_PATH, csPath } from "../../shared";
import styles from "../../company-questions.module.css";
import cs from "../../cs.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return CS_SETS.map((set) => ({ topic: set.id }));
}

const find = (id: string) => CS_SETS.find((set) => set.id === id);

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const set = find(topic);
  if (!set) return {};
  return pageMetadata({
    title: `${set.title} interview questions with model answers`,
    description: `${set.questions.length} ${set.title.toLowerCase()} questions that candidates report in interviews, each with a short model answer, the companies it was reported for and where it was reported.`,
    path: csPath(set.id),
    type: "article",
  });
}

export default async function Page({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const set = find(topic);
  if (!set) notFound();

  const names = new Map(COMPANIES.map((company) => [company.id, company]));
  const companyCount = new Set(set.questions.flatMap((question) => question.companies)).size;
  const reported = set.questions.filter((question) => question.evidence !== "guide").length;
  const others = CS_SETS.filter((entry) => entry.id !== set.id);

  return (
    <PageFrame
      title={set.title}
      mark="CQ"
      accent="yellow"
      layout="reader"
      links={[
        { href: HUB_PATH, label: "All questions" },
        { href: "/interview", label: "Interview book" },
      ]}
      back={{ href: HUB_PATH, label: "Company questions" }}
      skipLabel="Skip to the questions"
      scan={set.id}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <div>
            <RevealRoot />
            <SetHero
              crumb={set.title}
              topic={`Fundamentals · ${set.title}`}
              title={`${set.title}: the questions candidates report`}
              chips={[
                `${set.questions.length} questions`,
                `${set.themes.length} themes`,
                `${companyCount} companies`,
                `${reported} with candidate reports`,
              ]}
              lead={set.intro}
              glance={[
                { label: "Round", value: "Fundamentals" },
                { label: "Questions", value: set.questions.length },
                { label: "Themes", value: set.themes.length },
                { label: "Companies", value: companyCount },
              ]}
              tip={{
                title: "Use it like a drill",
                steps: [
                  "Read the question and answer out loud.",
                  "Open the answer and compare.",
                  "Note the follow-up it hints at.",
                ],
                href: "#first-theme",
                link: "Start with the first theme ↓",
              }}
              accent={accentVar("yellow")}
            />

            <div className={styles.reader} id="first-theme">
              <aside className={styles.rail}>
                <AnswerRail
                  title="In this set"
                  items={set.themes.map((theme) => ({ id: `theme-${theme.id}`, label: theme.name }))}
                />
              </aside>
              <div className={cs.sets}>
                {set.schema && (
                  <section className={cs.schema} data-reveal="">
                    <h2>The tables used below</h2>
                    <p>{set.schema.caption}</p>
                    <details className={cs.schemaBox}>
                      <summary>Show the tables and the sample rows</summary>
                      <CodeBlock text={set.schema.sql} title="schema.sql">
                        {set.schema.sql}
                      </CodeBlock>
                    </details>
                  </section>
                )}
                {set.themes.map((theme) => {
                  const list = set.questions.filter((question) => question.theme === theme.id);
                  return (
                    <section className={cs.theme} id={`theme-${theme.id}`} key={theme.id} data-reveal="">
                      <h2>{theme.name}</h2>
                      <ol className={cs.list}>
                        {list.map((question, at) => (
                          <li key={question.id} id={question.id}>
                            <details className={cs.item}>
                              <summary>
                                <span className={cs.no} aria-hidden="true">
                                  {at + 1}
                                </span>
                                <span className={cs.q}>{question.q}</span>
                                <span className={cs.level} data-level={question.level}>
                                  {question.level}
                                </span>
                                <span className={cs.badge} data-evidence={question.evidence}>
                                  <i aria-hidden="true" />
                                  {EVIDENCE_COPY[question.evidence].short}
                                </span>
                              </summary>
                              <div className={cs.body}>
                                <div
                                  className={`prose ${styles.body}`}
                                  dangerouslySetInnerHTML={{ __html: question.a }}
                                />
                                {question.query && (
                                  <CodeBlock text={question.query} title="query.sql">
                                    {question.query}
                                  </CodeBlock>
                                )}
                                {question.result && (
                                  <div className={cs.tableWrap}>
                                    <table>
                                      <thead>
                                        <tr>
                                          {question.result.head.map((cell) => (
                                            <th key={cell}>{cell}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {question.result.rows.map((row, rowAt) => (
                                          <tr key={rowAt}>
                                            {row.map((cell, cellAt) => (
                                              <td key={cellAt}>{cell}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                                {question.links && question.links.length > 0 && (
                                  <p className={cs.links}>
                                    {question.links.map((link) => (
                                      <Link key={link.href} href={link.href} prefetch={false}>
                                        {link.label} →
                                      </Link>
                                    ))}
                                  </p>
                                )}
                                <div className={cs.meta}>
                                  {question.companies.length > 0 && (
                                    <ul className={cs.companies} aria-label="Companies it was reported for">
                                      {question.companies.map((id) => (
                                        <li key={id}>
                                          <Link
                                            href={`${HUB_PATH}/${id}`}
                                            prefetch={false}
                                            style={
                                              {
                                                "--accent": accentVar(names.get(id)?.accent ?? "grey"),
                                              } as React.CSSProperties
                                            }
                                          >
                                            {names.get(id)?.name ?? id}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <ul className={cs.sources} aria-label="Where it was reported">
                                    {question.sources.map((source) => (
                                      <li key={source.url}>
                                        <a href={source.url} rel="noopener noreferrer" target="_blank">
                                          {SOURCE_KIND_LABEL[source.kind]}
                                          {source.year ? ` · ${source.year}` : ""} ↗
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </details>
                          </li>
                        ))}
                      </ol>
                    </section>
                  );
                })}

                <section className={cs.theme} data-reveal="">
                  <h2>Keep going</h2>
                  <ul className={cs.next}>
                    {set.chapters.map((chapter) => (
                      <li key={chapter.href}>
                        <Link href={chapter.href} prefetch={false}>
                          {chapter.label} <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                    {others.map((entry) => (
                      <li key={entry.id}>
                        <Link href={csPath(entry.id)} prefetch={false}>
                          {entry.title} questions <span aria-hidden="true">→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className={cs.note}>
                    Companies do not publish their questions and rotate them. These come from public candidate write-ups
                    and prep guides, so treat the labels as one person&apos;s account or one list&apos;s tag. The
                    answers are written for this site.
                  </p>
                </section>
              </div>
            </div>
            <AfterActions
              id={`cs-${set.id}`}
              extra={[
                { href: "/mock", label: "Run a mock interview" },
                { href: HUB_PATH, label: "Back to all questions" },
              ]}
            />
          </div>
        </Wrap>

        <Foot>
          <FootLink href={HUB_PATH}>All company questions</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
