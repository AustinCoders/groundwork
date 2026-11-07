import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { InfoHero, type InfoEntry } from "@/components/info/InfoHero";
import { InfoSection } from "@/components/info/InfoSection";
import styles from "@/components/info/info.module.css";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { COMPANY_QUESTIONS } from "@/content/system-design/company-questions";
import { COMPANY_DSA } from "@/content/system-design/company-questions/dsa-index";
import { COMPANY_LLD } from "@/content/system-design/company-questions/lld-index";
import { topics } from "@/content/topics";
import { chapters, exercises } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What Groundwork is, how its chapters and answers are made and checked, what is written and what is not yet, and who runs it.",
  path: "/about",
});

const ENTRIES: InfoEntry[] = [
  { id: "what", title: "What this is" },
  { id: "made", title: "How it is made" },
  { id: "checked", title: "How it is checked" },
  { id: "state", title: "What exists today" },
  { id: "who", title: "Who runs it" },
];

export default function AboutPage() {
  const byTopic = topics.topics.map((topic) => ({
    id: topic.id,
    written: chapters(topic.id).filter((entry) => entry.ready),
  }));
  const written = byTopic.flatMap((topic) => topic.written);
  const writtenTopics = new Set(byTopic.filter((topic) => topic.written.length > 0).map((topic) => topic.id));
  const unwritten = topics.topics.filter((topic) => !writtenTopics.has(topic.id)).length;
  const companyAnswers = COMPANY_QUESTIONS.length + COMPANY_DSA.length + COMPANY_LLD.length;

  return (
    <PageFrame title="About" mark="i" accent="blue" skipLabel="Skip to the notes" layout="reader">
      <TopicPage accent="blue">
        <InfoHero
          mark="i"
          kicker="What this site is"
          title="About"
          lead="A free place to learn programming fundamentals and prepare for interviews, with no account. This page says how the content is made, how it is checked, and where it is still thin."
          entries={ENTRIES}
          updated="Last updated 7 November 2026"
          tag="✓ no account"
          short="Written with AI assistance under a written standard, checked by tests and independent reviews, and run by one person."
          contact="help@austincoders.com"
          jump={{ href: "#made", label: "How it is made" }}
        />

        <InfoSection no="01" id="what" label="What" title="What this is">
          <p>
            Groundwork is a set of chapters, practice problems and interview answers for developers. You read a chapter,
            run its code in the browser, solve exercises that are graded by real tests, and review what you got wrong.
            Everything works without signing up, and your progress stays in your browser.
          </p>
          <p>
            It is not a course with a teacher or a certificate. It is a reference and a practice room, and it says
            plainly where it is incomplete.
          </p>
        </InfoSection>

        <InfoSection no="02" id="made" label="Made" title="How it is made">
          <p>
            Chapters, exercises and interview answers are drafted with the help of AI (Claude), working from a written{" "}
            <Link href="/architecture">content standard</Link> that sets the length, the structure, the practice that
            must come with a chapter and the way claims are checked. The site is not handwritten, and it does not claim
            to be.
          </p>
          <p>
            The person behind it plans each batch, sets the standard, runs the checks and decides what ships. Company
            interview data is collected from public pages, written in our own words, and labelled by how well it is
            supported: reported in several places, reported once, or listed in prep guides only. Companies do not
            publish their questions, so none of it is a promise about what you will be asked.
          </p>
        </InfoSection>

        <InfoSection no="03" id="checked" label="Checked" title="How it is checked">
          <ul className={styles.rows}>
            <li>
              <b>Tests that run the code</b>
              Every reference solution is run against its tests, every starter must fail at least one test, and the code
              in the machine coding and coding answers is run against its checks. You can rerun the checks on an answer
              page.
            </li>
            <li>
              <b>Independent review</b>A second AI pass that did not write the text re-runs the code, fuzzes it against
              a simple reference, and re-reads the claims and sources. These reviews have found real bugs, which were
              then fixed. They are not a substitute for a human expert, and there is no outside reviewer yet.
            </li>
            <li>
              <b>Audits</b>
              The DSA and System Design chapters were audited against well-known references, and the site was
              benchmarked against larger learning platforms in October 2026. Known problems are listed in the
              repository&rsquo;s audit notes until they are fixed.
            </li>
            <li>
              <b>Corrections</b>
              If you find a mistake, <Link href="/contact">tell us</Link> with the page address. See the{" "}
              <Link href="/changelog">changelog</Link> for what changed and when.
            </li>
          </ul>
        </InfoSection>

        <InfoSection no="04" id="state" label="Today" title="What exists today">
          <ul className={styles.figures}>
            <li>
              <b>{written.length}</b>
              <span>written chapters</span>
            </li>
            <li>
              <b>{exercises().length}</b>
              <span>exercises with tests</span>
            </li>
            <li>
              <b>{companyAnswers}</b>
              <span>company answers</span>
            </li>
            <li>
              <b>{writtenTopics.size}</b>
              <span>topics with chapters</span>
            </li>
          </ul>
          <p>
            {unwritten} of the {topics.topics.length} topics on the shelf have no written chapters yet. They are marked
            as coming soon, and they fill in as chapters are written. The strongest areas today are JavaScript, React,
            data structures and algorithms, system design and the interview book.
          </p>
        </InfoSection>

        <InfoSection no="05" id="who" label="Who" title="Who runs it">
          <p>
            Groundwork is run by AustinCoders, at groundwork.austincoders.com. It is a one-person project, so replies to{" "}
            <Link href="/contact">the contact address</Link> can take a few days. What the site does with your data is
            on the <Link href="/privacy">privacy page</Link>.
          </p>
        </InfoSection>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href="/changelog">Changelog</FootLink>
          <FootLink href="/accessibility">Accessibility</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
