import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RevealRoot } from "../RevealRoot";
import { ShaderHero } from "../ShaderHero";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, Kicker, TopicPage, Wrap } from "@/components/topic/TopicKit";
import { accentVar } from "@/lib/accent";
import { pageMetadata } from "@/lib/metadata";
import { PEOPLE } from "@/content/system-design/company-questions/people";
import { PeopleSection } from "../PeopleSection";
import { RoundStrip, RoundTimeline } from "../CompanyParts";
import { CompanyRing, DoneMark } from "../DoneMark";
import { companyView, companyViews, exerciseOf } from "../data";
import { HUB_PATH, codingPath, lldPath, questionPath } from "../shared";
import styles from "../company.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return companyViews().map((view) => ({ company: view.company.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ company: string }> }): Promise<Metadata> {
  const { company } = await params;
  const view = companyView(company);
  if (!view) return {};
  const rounds = view.process?.rounds.length ?? 0;
  return pageMetadata({
    title: `${view.company.name} interview process and reported questions`,
    description: `${view.process?.summary ?? `Questions reported for ${view.company.name}.`} ${rounds} rounds, with the questions candidates report for each and worked answers where we have them.`,
    path: `${HUB_PATH}/${view.company.id}`,
  });
}

export default async function Page({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  const view = companyView(company);
  if (!view) notFound();
  const { process, design, coding, lld, reported } = view;
  const rounds = process?.rounds ?? [];
  const people = PEOPLE.find((entry) => entry.company === view.company.id);
  const tint = { "--accent": accentVar(view.company.accent) } as CSSProperties;
  const others = companyViews()
    .filter((entry) => entry.company.group === view.company.group && entry.company.id !== view.company.id)
    .slice(0, 6);
  const tracked = [
    ...design.map((question) => ({ id: question.id })),
    ...coding.map((question) => ({ id: question.id, exercise: exerciseOf(question.id) })),
    ...lld.map((question) => ({ id: question.id })),
  ];
  const wellReported = rounds.filter((round) => round.grade === "several").length;

  return (
    <PageFrame
      title={view.company.name}
      mark="CQ"
      accent="yellow"
      layout="reader"
      links={[
        { href: HUB_PATH, label: "All companies" },
        { href: "/interview", label: "Interview book" },
      ]}
      back={{ href: HUB_PATH, label: "Company questions" }}
      skipLabel="Skip to the rounds"
      scan={view.company.id}
    >
      <TopicPage accent="yellow">
        <Wrap>
          <div style={tint}>
            <RevealRoot />
            <header className={styles.hero}>
              <ShaderHero />
              <span className={styles.heroMonogram} aria-hidden="true">
                {view.company.name.charAt(0)}
              </span>
              <div className={styles.heroCopy}>
                <Kicker mark="CQ">{view.company.group === "global" ? "Global" : "India"} · interview process</Kicker>
                <h1 id="company-title">{view.company.name}</h1>
                {process && <p className={styles.heroLead}>{process.summary}</p>}
                <ul className={styles.heroChips}>
                  {rounds.length > 0 && <li>{rounds.length} rounds</li>}
                  {process?.typicalWeeks && <li>{process.typicalWeeks}</li>}
                  {design.length > 0 && (
                    <li>
                      {design.length} design {design.length === 1 ? "answer" : "answers"}
                    </li>
                  )}
                  {coding.length > 0 && (
                    <li>
                      {coding.length} coding {coding.length === 1 ? "answer" : "answers"}
                    </li>
                  )}
                  {reported.length > 0 && (
                    <li>
                      {reported.length} more reported {reported.length === 1 ? "prompt" : "prompts"}
                    </li>
                  )}
                  {wellReported > 0 && <li>{wellReported} well-reported rounds</li>}
                </ul>
                <div className={styles.heroActions}>
                  {rounds.length > 0 && (
                    <a className="btn btn--primary" href="#round-1">
                      Start with round 1 <span aria-hidden="true">↓</span>
                    </a>
                  )}
                  <Link className="btn" href={`${HUB_PATH}#questions`} prefetch={false}>
                    Browse every question
                  </Link>
                </div>
              </div>
              <CompanyRing items={tracked} />
            </header>

            {rounds.length > 0 && <RoundStrip rounds={rounds} people={!!people} />}

            <div className={styles.layout}>
              <section aria-labelledby="rounds-h">
                <h2 className={styles.sectionTitle} id="rounds-h">
                  The process, round by round
                </h2>
                <p className={styles.sectionSub}>
                  Reported by candidates and, where we found one, the company itself. Each round shows how well it is
                  reported. Processes change by team, level and year.
                </p>
                <RoundTimeline
                  rounds={rounds}
                  accent={view.company.accent}
                  design={design}
                  coding={coding}
                  lld={lld}
                  reported={reported}
                />
                {people && <PeopleSection name={view.company.name} people={people} />}
                {process?.gaps && (
                  <p className={styles.gaps}>
                    <b>What we could not verify.</b> {process.gaps}
                  </p>
                )}
              </section>

              <aside className={styles.aside} aria-label="Questions and related companies">
                <div className={styles.asideCard} data-reveal="">
                  <h2>All {view.company.name} answers</h2>
                  {tracked.length === 0 ? (
                    <p>No written answer yet. The rounds above list what was reported.</p>
                  ) : (
                    <ul>
                      {design.map((question) => (
                        <li key={question.id}>
                          <Link href={questionPath(question.id)} prefetch={false}>
                            <span>Design</span>
                            {question.title}
                          </Link>
                          <DoneMark id={question.id} />
                        </li>
                      ))}
                      {coding.map((question) => (
                        <li key={question.id}>
                          <Link href={codingPath(question.id)} prefetch={false}>
                            <span>{question.difficulty}</span>
                            {question.title}
                          </Link>
                          <DoneMark id={question.id} exercise={exerciseOf(question.id)} />
                        </li>
                      ))}
                      {lld.map((question) => (
                        <li key={question.id}>
                          <Link href={lldPath(question.id)} prefetch={false}>
                            <span>{question.round === "lld" ? "LLD" : "Machine"}</span>
                            {question.title}
                          </Link>
                          <DoneMark id={question.id} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={styles.asideCard} data-reveal="">
                  <h2>How to read the labels</h2>
                  <ul className={styles.legend}>
                    <li>
                      <i data-evidence="several" /> Several reports agree
                    </li>
                    <li>
                      <i data-evidence="one" /> One report
                    </li>
                    <li>
                      <i data-evidence="guide" /> Prep guides only
                    </li>
                  </ul>
                  <p>Companies do not publish their questions and rotate them, so every round here is anecdotal.</p>
                </div>
                {others.length > 0 && (
                  <div className={styles.asideCard} data-reveal="">
                    <h2>More {view.company.group === "global" ? "global" : "Indian"} companies</h2>
                    <div className={styles.chips}>
                      {others.map((entry) => (
                        <Link
                          key={entry.company.id}
                          href={`${HUB_PATH}/${entry.company.id}`}
                          style={{ "--accent": accentVar(entry.company.accent) } as CSSProperties}
                          prefetch={false}
                        >
                          <b aria-hidden="true">{entry.company.name.charAt(0)}</b>
                          {entry.company.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </Wrap>

        <Foot>
          <FootLink href={HUB_PATH}>All company questions</FootLink>
          <FootLink href="/interview">Interview book</FootLink>
          <FootLink href="/system-design">System design course</FootLink>
          <FootLink href="/level/dsa">DSA course</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
