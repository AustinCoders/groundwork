import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import {
  Band,
  Chips,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  TopicPage,
  Underlined,
  Wrap,
  topicKit,
} from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { chapters } from "@/lib/content";
import { plural } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { CompanyFilter } from "./CompanyFilter";
import { QuestionCard } from "./QuestionCard";
import styles from "./company-questions.module.css";

export const metadata: Metadata = pageMetadata({
  title: "System design questions big companies reported",
  description:
    "System design questions that candidates and prep guides report for Google, Meta, Amazon, Flipkart, Swiggy and more, each with a worked answer, the numbers, the trade-offs and the follow-ups, and a link to where it was reported.",
  path: "/system-design/company-questions",
});

const LINKS = [
  { href: "/system-design", label: "System design" },
  { href: "/interview", label: "Interview book" },
];

export default function Page() {
  const titles = Object.fromEntries(chapters("system-design").map((chapter) => [chapter.id, chapter.title]));
  const byCompany = new Map(COMPANIES.map((company) => [company.id, company]));
  const used = COMPANIES.filter((company) => COMPANY_QUESTIONS.some((question) => question.company === company.id));
  const filterCompanies = used.map((company) => ({
    id: company.id,
    name: company.name,
    group: company.group,
    count: COMPANY_QUESTIONS.filter((question) => question.company === company.id).length,
  }));
  return (
    <PageFrame
      title="Company questions"
      mark="SD"
      accent="yellow"
      layout="reader"
      links={LINKS}
      back={{ href: "/system-design", label: "System design" }}
      skipLabel="Skip to the questions"
      scan={COMPANY_QUESTIONS.length}
    >
      <TopicPage accent="yellow">
        <Wrap className={styles.hero}>
          <Kicker mark="SD">System design · reported by candidates</Kicker>
          <Heading id="company-questions-title">
            What big companies <Underlined>reportedly asked</Underlined>
          </Heading>
          <Lead>
            Real design prompts, grouped by company, each with a worked answer: what to ask first, the numbers, the
            design, the trade-offs and the follow-ups. Every question links to the public page that reports it.
          </Lead>
          <p className={styles.honest}>
            <b>Read this first.</b> Companies do not publish their questions and they rotate them. Everything here comes
            from candidate write-ups and prep guides, so it is anecdotal, it may be out of date, and a question being
            listed does not mean you will get it. The answers are written for this site, not copied from anywhere. Use
            them to practise the shape of an answer.
          </p>
          <Chips>
            <span className={topicKit.chip}>{plural(COMPANY_QUESTIONS.length, "question")}</span>
            <span className={topicKit.chip}>{used.length === 1 ? "1 company" : `${used.length} companies`}</span>
          </Chips>
        </Wrap>
        <Band
          no="01"
          id="questions-h"
          sectionId="questions"
          label="The questions"
          title="Pick a company, open an answer"
          sub="Try to answer out loud first, then open the answer and compare."
          count={plural(COMPANY_QUESTIONS.length, "question")}
        >
          <CompanyFilter companies={filterCompanies} total={COMPANY_QUESTIONS.length}>
            {COMPANY_QUESTIONS.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                company={byCompany.get(question.company)!}
                chapterTitles={titles}
              />
            ))}
          </CompanyFilter>
        </Band>
        <Foot>
          <FootLink href="/system-design">All system design chapters</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
