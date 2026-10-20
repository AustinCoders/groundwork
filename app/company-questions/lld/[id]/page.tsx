import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { LLD_DIAGRAMS } from "@/content/system-design/company-questions/lld-diagrams";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { LLD_TOPIC_NAME } from "@/content/system-design/company-questions/lld-topics";
import { accentVar } from "@/lib/accent";
import { chapters } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { AnswerRail } from "../../AnswerRail";
import { CodeBlock } from "../../CodeBlock";
import { Diagram } from "../../Diagram";
import { DiagramDeck } from "../../DiagramDeck";
import { QuestionHero } from "../../QuestionHero";
import { AfterActions, ChapterLinks, Pager, RelatedList, SourcesList } from "../../ReaderParts";
import { RevealRoot } from "../../RevealRoot";
import { TryFirst } from "../../TryFirst";
import { highlight } from "../../highlight";
import { EVIDENCE_COPY, HUB_PATH, LLD_PHASES, lldPath, withArticle } from "../../shared";
import styles from "../../company-questions.module.css";
import coding from "../../coding.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPANY_LLD.map((question) => ({ id: question.id }));
}

const STEPS = [
  { id: "ask", title: "Clarify first", hint: "Pin the scope down before you name a single class." },
  { id: "entities", title: "Entities and relationships", hint: "Who owns what, and who talks to whom." },
  { id: "design", title: "The design", hint: "The class map, the main flow and the patterns that earn their place." },
  { id: "code", title: "The code", hint: "Runnable JavaScript, with the checks it passes." },
  { id: "extend", title: "Extend it", hint: "The change requests an interviewer throws next." },
  { id: "slips", title: "Where candidates slip", hint: "The mistakes this problem punishes." },
] as const;

const find = (id: string) => COMPANY_LLD.find((question) => question.id === id);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const question = find(id);
  if (!question) return {};
  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  const kind = question.round === "lld" ? "low-level design" : "machine coding";
  return pageMetadata({
    title: `${question.title}: ${withArticle(company.name)} ${kind} question`,
    description: `${question.prompt.slice(0, 150)} Requirements, entities, class map, runnable code with checks and the follow-ups. ${EVIDENCE_COPY[question.evidence].label}.`,
    path: lldPath(question.id),
    type: "article",
  });
}

const short = (value: unknown) => {
  const text = JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = find(id);
  if (!question) notFound();

  const company = COMPANIES.find((entry) => entry.id === question.company)!;
  const titles = Object.fromEntries(chapters("system-design").map((chapter) => [chapter.id, chapter.title]));
  const index = COMPANY_LLD.indexOf(question);
  const previous = COMPANY_LLD[(index + COMPANY_LLD.length - 1) % COMPANY_LLD.length];
  const next = COMPANY_LLD[(index + 1) % COMPANY_LLD.length];
  const related = COMPANY_LLD.filter((other) => other.id !== question.id && other.topic === question.topic)
    .slice(0, 3)
    .map((other) => {
      const otherCompany = COMPANIES.find((entry) => entry.id === other.company)!;
      return {
        href: lldPath(other.id),
        company: otherCompany.name,
        title: other.title,
        accent: accentVar(otherCompany.accent),
      };
    });
  const { answer } = question;
  const bodies: Record<string, string> = {
    ask: answer.ask,
    entities: answer.entities,
    design: answer.design,
    slips: answer.slips,
  };
  const diagrams = LLD_DIAGRAMS[question.id] ?? [];
  const tint = { "--accent": accentVar(company.accent) } as CSSProperties;

  return (
    <PageFrame
      title={company.name}
      mark="CQ"
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
            <RevealRoot />
            <QuestionHero
              company={company}
              kind="lld"
              topic={`${question.round === "lld" ? "Low-level design" : "Machine coding"} · ${LLD_TOPIC_NAME[question.topic]}`}
              title={question.title}
              evidence={question.evidence}
              chips={[
                ...(question.level.startsWith("level not stated") ? [] : [question.level]),
                ...question.patterns,
                `${question.sources.length} ${question.sources.length === 1 ? "source" : "sources"}`,
              ]}
              promptLabel="The prompt"
              prompt={question.prompt}
              disclaimer={`Restated in our own words, not a quote from ${company.name} or any page. The answer below is written for this site.`}
              glance={[
                { label: "Round", value: question.round === "lld" ? "Low-level design" : "Machine coding" },
                { label: "Topic", value: LLD_TOPIC_NAME[question.topic] },
                { label: "Patterns", value: question.patterns.join(", ") },
                { label: "Checks", value: `${question.checks.length} pass` },
                { label: "Sources", value: <a href="#sources">{question.sources.length} reports</a> },
              ]}
            />

            <TryFirst
              phases={LLD_PHASES}
              rail={<AnswerRail items={STEPS.map((step) => ({ id: step.id, label: step.title }))} />}
            >
              {STEPS.map((step, position) => (
                <section
                  className={styles.step}
                  id={step.id}
                  key={step.id}
                  data-step={step.id}
                  data-reveal=""
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
                  {step.id === "extend" && (
                    <ol className={styles.followups}>
                      {answer.extend.map((followUp, at) => (
                        <li key={followUp}>
                          <span aria-hidden="true">Q{at + 1}</span>
                          {followUp}
                        </li>
                      ))}
                    </ol>
                  )}
                  {step.id === "design" && diagrams.length > 0 && (
                    <DiagramDeck
                      items={diagrams.map((diagram, at) => ({
                        id: `${question.id}-d${at}`,
                        title: diagram.title,
                        node: <Diagram diagram={diagram} uid={`${question.id}-${at}`} />,
                      }))}
                    />
                  )}
                  {step.id === "code" && (
                    <>
                      <CodeBlock text={question.code} title={`${question.id}.js`}>
                        {highlight(question.code)}
                      </CodeBlock>
                      <details className={coding.cases}>
                        <summary>Passes {question.checks.length} checks</summary>
                        <ul>
                          {question.checks.map((check) => (
                            <li key={check.name}>
                              <span>{check.name}</span>
                              <span aria-hidden="true">→</span>
                              <code>{short(check.expected)}</code>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </>
                  )}
                  {step.id !== "extend" && step.id !== "code" && (
                    <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: bodies[step.id] }} />
                  )}
                </section>
              ))}
            </TryFirst>

            <AfterActions
              id={question.id}
              extra={[
                { href: "/whiteboard", label: "Sketch the class map on the whiteboard" },
                { href: "/mock", label: "Run a mock interview" },
              ]}
            />
            <SourcesList sources={question.sources} />
            <ChapterLinks
              heading="Read these chapters first"
              ids={question.chapters}
              base="/system-design"
              titles={titles}
            />
            <RelatedList heading={`More on ${LLD_TOPIC_NAME[question.topic].toLowerCase()}`} items={related} />
            <Pager
              previous={{ href: lldPath(previous.id), title: previous.title }}
              next={{ href: lldPath(next.id), title: next.title }}
            />
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
