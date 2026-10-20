import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RevealRoot } from "../../RevealRoot";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { DIAGRAMS } from "@/content/system-design/company-questions/diagrams";
import { THEMES, THEME_OF } from "@/content/system-design/company-questions/themes";
import { accentVar } from "@/lib/accent";
import { chapters } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { whiteboardLink } from "@/lib/whiteboard/walk";
import { AnswerRail } from "../../AnswerRail";
import { Diagram } from "../../Diagram";
import { DiagramDeck } from "../../DiagramDeck";
import { QuestionHero } from "../../QuestionHero";
import { AfterActions, BoardLink, ChapterLinks, Pager, RelatedList, SourcesList } from "../../ReaderParts";
import { TryFirst } from "../../TryFirst";
import { DESIGN_PHASES, EVIDENCE_COPY, HUB_PATH, questionPath, withArticle } from "../../shared";
import styles from "../../company-questions.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPANY_QUESTIONS.map((question) => ({ id: question.id }));
}

const STEPS = [
  { id: "ask", title: "Ask first", hint: "Clarify the problem before you draw anything." },
  { id: "numbers", title: "Numbers", hint: "A back-of-envelope that decides the shape." },
  { id: "design", title: "The design", hint: "Diagrams first, then components, data and the hard parts." },
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
    title: `${question.title}: ${withArticle(company.name)} system design question`,
    description: `${question.prompt} A worked answer with diagrams, the numbers, the design, the trade-offs and the follow-ups. ${EVIDENCE_COPY[question.evidence].label}.`,
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
  )
    .slice(0, 3)
    .map((other) => {
      const otherCompany = COMPANIES.find((entry) => entry.id === other.company)!;
      return {
        href: questionPath(other.id),
        company: otherCompany.name,
        title: other.title,
        accent: accentVar(otherCompany.accent),
      };
    });
  const { answer } = question;
  const bodies: Record<string, string> = {
    ask: answer.ask,
    numbers: answer.numbers,
    design: answer.design,
    tradeoffs: answer.tradeoffs,
    slips: answer.slips,
  };
  const diagrams = DIAGRAMS[question.id] ?? [];
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
              kind="design"
              topic={`System design · ${theme?.name ?? ""}`}
              title={question.title}
              evidence={question.evidence}
              chips={[
                ...(question.level.startsWith("level not stated") ? [] : [question.level]),
                `${diagrams.length} diagrams`,
                `${question.sources.length} ${question.sources.length === 1 ? "source" : "sources"}`,
              ]}
              promptLabel="The prompt"
              prompt={question.prompt}
              disclaimer={`A representative prompt in the style reported, not a quote from ${company.name}. The answer below is written for this site.`}
              glance={[
                { label: "Round", value: "System design" },
                { label: "Topic", value: theme?.name ?? "" },
                { label: "Diagrams", value: diagrams.length },
                { label: "Read first", value: `${question.chapters.length} chapters` },
                { label: "Sources", value: <a href="#sources">{question.sources.length} reports</a> },
              ]}
            />

            <TryFirst
              phases={DESIGN_PHASES}
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
                    <>
                      {step.id === "design" && diagrams.length > 0 && (
                        <DiagramDeck
                          items={diagrams.map((diagram, at) => ({
                            id: `${question.id}-d${at}`,
                            title: diagram.title,
                            node: <Diagram diagram={diagram} uid={`${question.id}-${at}`} />,
                          }))}
                        />
                      )}
                      {step.id === "design" && diagrams.length > 0 && (
                        <BoardLink
                          source="design"
                          id={question.id}
                          note={`All ${diagrams.length} diagrams on one tidy board, with a step-by-step walkthrough.`}
                        />
                      )}
                      <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: bodies[step.id] }} />
                    </>
                  )}
                </section>
              ))}
            </TryFirst>

            <AfterActions
              id={question.id}
              extra={[
                { href: whiteboardLink("design", question.id), label: "Redraw it on the whiteboard" },
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
            <RelatedList heading={`More on ${theme?.name.toLowerCase() ?? "this topic"}`} items={related} />
            <Pager
              previous={{ href: questionPath(previous.id), title: previous.title }}
              next={{ href: questionPath(next.id), title: next.title }}
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
