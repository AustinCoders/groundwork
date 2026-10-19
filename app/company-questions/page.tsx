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
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { PATTERN_NAMES } from "@/content/system-design/company-questions/dsa-patterns";
import { DIAGRAMS } from "@/content/system-design/company-questions/diagrams";
import { THEMES, THEME_OF } from "@/content/system-design/company-questions/themes";
import { pageMetadata } from "@/lib/metadata";
import { Browser } from "./Browser";
import { CompanyCard } from "./CompanyCard";
import { RevealRoot } from "./RevealRoot";
import { RoundGuide } from "./RoundGuide";
import { ShaderHero } from "./ShaderHero";
import { companyViews, exerciseOf } from "./data";
import { Diagram } from "./Diagram";
import { HeroArt } from "./HeroArt";
import { PatternGlyph } from "./PatternGlyph";
import { HUB_PATH, codingPath, questionPath, type HubCompany, type HubItem, type HubTopic } from "./shared";
import { accentVar } from "@/lib/accent";
import type { CSSProperties, ReactNode } from "react";
import styles from "./hub.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Interview questions big companies reported",
  description:
    "System design and coding questions that candidates, prep guides and company-tagged lists report for Google, Meta, Amazon, Flipkart, Swiggy and more. Each has a worked answer, diagrams or a dry run, the numbers, the trade-offs, runnable code and a link to where it was reported.",
  path: HUB_PATH,
});

const LINKS = [
  { href: "/system-design", label: "System design" },
  { href: "/interview", label: "Interview book" },
];

const STEPS = [
  { n: 1, title: "Pick one", text: "Filter by company, topic or how well it is reported." },
  {
    n: 2,
    title: "Cover and run the clock",
    text: "Sketch it on paper first. The answer stays blurred until you reveal it.",
  },
  { n: 3, title: "Compare and mark it", text: "Read the diagrams or the dry run, then mark it practised." },
];

export default function Page() {
  const byCompany = new Map(COMPANIES.map((company) => [company.id, company]));
  const themeName = new Map(THEMES.map((theme) => [theme.id, theme.name]));
  const thumbs: Record<string, ReactNode> = {};
  const items: HubItem[] = [];

  for (const question of COMPANY_QUESTIONS) {
    const company = byCompany.get(question.company)!;
    const theme = THEME_OF[question.id];
    const first = DIAGRAMS[question.id]?.[0];
    thumbs[`design:${question.id}`] = first ? <Diagram diagram={first} uid={`thumb-${question.id}`} mini /> : null;
    items.push({
      kind: "design",
      id: question.id,
      href: questionPath(question.id),
      company: company.id,
      companyName: company.name,
      group: company.group,
      accent: company.accent,
      title: question.title,
      prompt: question.prompt,
      level: question.level.startsWith("level not stated") ? "" : question.level,
      evidence: question.evidence,
      topic: theme,
      topicName: themeName.get(theme) ?? "",
      search:
        `${company.name} ${question.title} ${question.prompt} ${themeName.get(theme)} system design`.toLowerCase(),
    });
  }

  for (const question of COMPANY_DSA) {
    const company = byCompany.get(question.company)!;
    thumbs[`coding:${question.id}`] = (
      <span className={styles.glyphWrap} style={{ "--accent": accentVar(company.accent) } as CSSProperties}>
        <PatternGlyph pattern={question.patternId} />
      </span>
    );
    items.push({
      kind: "coding",
      id: question.id,
      href: codingPath(question.id),
      company: company.id,
      companyName: company.name,
      group: company.group,
      accent: company.accent,
      title: question.title,
      prompt: question.prompt,
      level: question.level.startsWith("level not stated") ? "" : question.level,
      evidence: question.evidence,
      topic: question.patternId,
      topicName: question.pattern,
      difficulty: question.difficulty,
      time: question.complexity.time,
      space: question.complexity.space,
      leetcode: question.leetcode?.number,
      exercise: exerciseOf(question.id),
      search:
        `${company.name} ${question.title} ${question.prompt} ${question.pattern} ${PATTERN_NAMES[question.patternId]} ${question.difficulty} coding dsa leetcode ${question.leetcode?.number ?? ""}`.toLowerCase(),
    });
  }

  const views = companyViews();
  const companies: HubCompany[] = views.map((view) => ({
    id: view.company.id,
    name: view.company.name,
    group: view.company.group,
    accent: view.company.accent,
  }));

  const topics: HubTopic[] = [
    ...THEMES.map((theme) => ({
      id: theme.id,
      kind: "design" as const,
      name: theme.name,
      blurb: theme.blurb,
      count: items.filter((item) => item.kind === "design" && item.topic === theme.id).length,
    })),
    ...(Object.keys(PATTERN_NAMES) as (keyof typeof PATTERN_NAMES)[])
      .map((id) => ({
        id,
        kind: "coding" as const,
        name: PATTERN_NAMES[id],
        blurb: `Coding questions that use ${PATTERN_NAMES[id].toLowerCase()}`,
        count: items.filter((item) => item.kind === "coding" && item.topic === id).length,
      }))
      .filter((entry) => entry.count > 0),
  ];

  const several = items.filter((item) => item.evidence === "several").length;
  const diagramCount = Object.values(DIAGRAMS).reduce((sum, list) => sum + list.length, 0);
  const featured = DIAGRAMS["microsoft-distributed-rate-limiter"]?.[0] ?? null;
  const featuredCode =
    COMPANY_DSA.find((question) => question.id === "flipkart-max-points-from-cards") ?? COMPANY_DSA[0];
  const codeLines = featuredCode ? featuredCode.solution.code.split("\n").slice(0, 8) : [];

  return (
    <PageFrame
      title="Company questions"
      mark="CQ"
      accent="yellow"
      layout="reader"
      links={LINKS}
      back={{ href: "/", label: "Home" }}
      skipLabel="Skip to the questions"
      scan={items.length}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <RevealRoot />
          <div className={styles.hero}>
            <div className={styles.heroFx}>
              <ShaderHero />
            </div>
            <div className={styles.heroCopy}>
              <Kicker mark="CQ">Interview prep · reported by candidates</Kicker>
              <Heading id="company-questions-title">
                What big companies <Underlined>reportedly asked</Underlined>
              </Heading>
              <Lead>
                {COMPANY_QUESTIONS.length} system design questions with diagrams and {COMPANY_DSA.length} coding
                questions with a dry run and runnable code, for {companies.length} companies. Cover the answer, run the
                clock, then compare.
              </Lead>
              <Actions>
                <Button href="#companies">
                  Pick a company <span aria-hidden="true">↓</span>
                </Button>
                <Button ghost href="/system-design">
                  Learn the chapters first
                </Button>
              </Actions>
              <dl className={styles.stats}>
                {[
                  { value: COMPANY_QUESTIONS.length, label: "design" },
                  { value: COMPANY_DSA.length, label: "coding" },
                  { value: diagramCount, label: "diagrams" },
                  { value: several, label: "widely reported" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dd>{stat.value}</dd>
                    <dt>{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
            <HeroArt
              diagram={featured}
              diagramTitle={featured?.title ?? ""}
              code={codeLines}
              codeTitle={featuredCode?.title ?? ""}
              time={featuredCode?.complexity.time ?? ""}
              space={featuredCode?.complexity.space ?? ""}
            />
          </div>

          <div className={styles.how} data-reveal="">
            <ol className={styles.steps}>
              {STEPS.map((step) => (
                <li key={step.n}>
                  <span aria-hidden="true">{step.n}</span>
                  <div>
                    <b>{step.title}</b>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <aside className={styles.honest} aria-label="How much to trust this page">
              <p>
                <b>Read this first.</b> Companies do not publish their questions and they rotate them. Everything here
                comes from public candidate write-ups, prep guides and company-tagged lists, so it is anecdotal and may
                be out of date. Each card says how well a question is reported; being listed does not mean you will get
                it. The answers are written for this site.
              </p>
              <ul className={styles.legend}>
                <li>
                  <i data-evidence="several" /> Several reports
                </li>
                <li>
                  <i data-evidence="one" /> One report
                </li>
                <li>
                  <i data-evidence="guide" /> Lists and guides only
                </li>
              </ul>
            </aside>
          </div>
        </Wrap>

        <Band
          no="01"
          id="companies-h"
          sectionId="companies"
          label="Companies"
          title="Pick a company, see its whole process"
          sub="Each page lays out the rounds in order, what gets asked in each, and the questions to practise."
          count={`${views.length} companies`}
        >
          {(["global", "india"] as const).map((group) => (
            <div className={styles.companyGroup} key={group} data-reveal="">
              <p className={styles.companyGroupLabel}>
                <b>{group === "global" ? "Global" : "India"}</b>
                <span>
                  {group === "global" ? "Big tech and product companies" : "Indian product companies and startups"}
                </span>
              </p>
              <div className={styles.companies}>
                {views
                  .filter((view) => view.company.group === group)
                  .map((view, at) => (
                    <CompanyCard key={view.company.id} view={view} index={at} />
                  ))}
              </div>
            </div>
          ))}
        </Band>

        <Band
          no="02"
          id="rounds-h"
          sectionId="rounds"
          label="Rounds"
          title="Every kind of round, and what it can ask"
          sub="Open one to see what is usually asked, and where to prepare for it on this site."
        >
          <div data-reveal="">
            <RoundGuide />
          </div>
        </Band>

        <Band
          no="03"
          id="questions-h"
          sectionId="questions"
          label="All questions"
          title="Or browse every answer"
          sub="Open one, cover the answer, and talk it through out loud before you compare."
          count={`${items.length} questions`}
        >
          <Browser items={items} companies={companies} topics={topics} thumbs={thumbs} />
        </Band>

        <Foot>
          <FootLink href="/system-design">System design chapters</FootLink>
          <FootLink href="/level/dsa">DSA course</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/mock">Mock interview</FootLink>
          <FootLink href="/whiteboard">Whiteboard</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
