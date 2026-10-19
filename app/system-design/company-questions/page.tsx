import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import {
  Actions,
  Band,
  Button,
  Foot,
  FootLink,
  Heading,
  Kicker,
  Lead,
  TopicPage,
  Underlined,
  Wrap,
} from "@/components/topic/TopicKit";
import { COMPANIES } from "@/content/system-design/company-questions/companies";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { THEMES, THEME_OF } from "@/content/system-design/company-questions/themes";
import { chapters } from "@/lib/content";
import { plural } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { Browser } from "./Browser";
import { HUB_PATH, type HubCompany, type HubQuestion, type HubTheme } from "./shared";
import styles from "./company-questions.module.css";

export const metadata: Metadata = pageMetadata({
  title: "System design questions big companies reported",
  description:
    "System design questions that candidates and prep guides report for Google, Meta, Amazon, Flipkart, Swiggy and more, each with a worked answer, the numbers, the trade-offs and the follow-ups, and a link to where it was reported.",
  path: HUB_PATH,
});

const LINKS = [
  { href: "/system-design", label: "System design" },
  { href: "/interview", label: "Interview book" },
];

export default function Page() {
  const byCompany = new Map(COMPANIES.map((company) => [company.id, company]));
  const themeName = new Map(THEMES.map((theme) => [theme.id, theme.name]));

  const questions: HubQuestion[] = COMPANY_QUESTIONS.map((question) => {
    const company = byCompany.get(question.company)!;
    const theme = THEME_OF[question.id];
    return {
      id: question.id,
      company: company.id,
      companyName: company.name,
      group: company.group,
      accent: company.accent,
      title: question.title,
      prompt: question.prompt,
      level: question.level.startsWith("level not stated") ? "" : question.level,
      evidence: question.evidence,
      theme,
      themeName: themeName.get(theme) ?? "",
      sources: question.sources.length,
      chapters: question.chapters.length,
      search:
        `${company.name} ${question.title} ${question.prompt} ${themeName.get(theme)} ${question.level}`.toLowerCase(),
    };
  });

  const companies: HubCompany[] = COMPANIES.map((company) => {
    const own = questions.filter((question) => question.company === company.id);
    return {
      id: company.id,
      name: company.name,
      group: company.group,
      accent: company.accent,
      count: own.length,
      ids: own.map((question) => question.id),
    };
  }).filter((company) => company.count > 0);

  const themes: HubTheme[] = THEMES.map((theme) => ({
    id: theme.id,
    name: theme.name,
    blurb: theme.blurb,
    count: questions.filter((question) => question.theme === theme.id).length,
  }));

  const several = questions.filter((question) => question.evidence === "several").length;

  return (
    <PageFrame
      title="Company questions"
      mark="SD"
      accent="yellow"
      layout="reader"
      links={LINKS}
      back={{ href: "/system-design", label: "System design" }}
      skipLabel="Skip to the questions"
      scan={questions.length}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <Kicker mark="SD">System design · reported by candidates</Kicker>
              <Heading id="company-questions-title">
                What big companies <Underlined>reportedly asked</Underlined>
              </Heading>
              <Lead>
                {plural(questions.length, "design question")} that candidates and prep guides report for{" "}
                {companies.length} companies. Every one has a worked answer: what to ask first, the numbers, the design,
                the trade-offs and the follow-ups. Cover the answer, run the clock, then compare.
              </Lead>
              <Actions>
                <Button href="#questions">
                  Browse the questions <span aria-hidden="true">↓</span>
                </Button>
                <Button ghost href="/system-design">
                  Learn the chapters first
                </Button>
              </Actions>
            </div>
            <aside className={styles.sticky} aria-label="How much to trust this page">
              <span className={styles.stickyTape} aria-hidden="true" />
              <p className={styles.stickyHead}>Read this first</p>
              <p>
                Companies do not publish their questions and they rotate them. Everything here comes from public
                candidate write-ups and prep guides, so it is anecdotal and may be out of date.
              </p>
              <p>
                Being listed does not mean you will get it. The answers are written for this site, not copied from
                anywhere. Use them to practise the shape of an answer.
              </p>
            </aside>
          </div>
          <dl className={styles.stats}>
            {[
              { value: questions.length, label: "questions" },
              { value: companies.length, label: "companies" },
              { value: several, label: "reported in several places" },
              { value: chapters("system-design").length, label: "chapters to learn from" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd>{stat.value}</dd>
                <dt>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Wrap>

        <Band
          no="01"
          id="questions-h"
          sectionId="questions"
          label="The questions"
          title="Pick a company, or pick a topic"
          sub="Open one, cover the answer, and talk it through out loud before you compare."
          count={plural(questions.length, "question")}
        >
          <Browser questions={questions} companies={companies} themes={themes} />
        </Band>

        <Foot>
          <FootLink href="/system-design">All system design chapters</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/whiteboard">Whiteboard</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
