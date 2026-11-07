import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { InfoHero, type InfoEntry } from "@/components/info/InfoHero";
import { InfoSection } from "@/components/info/InfoSection";
import styles from "@/components/info/info.module.css";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: "How to report a mistake, a bug or a privacy request to the person who runs Groundwork.",
  path: "/contact",
});

const ENTRIES: InfoEntry[] = [
  { id: "write", title: "Write to us" },
  { id: "mistake", title: "Report a mistake" },
  { id: "other", title: "Bugs, privacy and ideas" },
];

const MAIL = "help@austincoders.com";

export default function ContactPage() {
  return (
    <PageFrame title="Contact" mark="@" accent="blue" skipLabel="Skip to the contact details" layout="reader">
      <TopicPage accent="blue">
        <InfoHero
          mark="@"
          kicker="Get in touch"
          title="Contact"
          lead="One mailbox, read by the person who runs the site. A wrong answer, a broken page or a privacy request all go to the same place."
          entries={ENTRIES}
          updated="Last updated 7 November 2026"
          tag="✓ a real person"
          short="Replies can take a few days. There is no live chat and no ticket tracker."
          contact={MAIL}
          jump={{ href: "#mistake", label: "Report a mistake" }}
        />

        <InfoSection no="01" id="write" label="Write" title="Write to us">
          <p>
            Email <a href={`mailto:${MAIL}`}>{MAIL}</a>. This is a one-person project, so replies can take a few days,
            and not every suggestion will be built. Every report about a mistake is read.
          </p>
        </InfoSection>

        <InfoSection no="02" id="mistake" label="Mistake" title="Report a mistake">
          <p>The most useful report names the page and says what is wrong. Please include:</p>
          <ul className={styles.rows}>
            <li>
              <b>The page address</b>
              Copy it from the browser, for example <code>/dsa/dsa-trees</code> or a problem&rsquo;s address.
            </li>
            <li>
              <b>What it says and what is true</b>
              Quote a few words, and say what you expected. A link to a reliable source helps most.
            </li>
            <li>
              <b>For a failing problem</b>
              The code you ran and the test that failed or the output you got, and your browser.
            </li>
          </ul>
          <p>
            Corrections are listed on the <Link href="/changelog">changelog</Link>.
          </p>
        </InfoSection>

        <InfoSection no="03" id="other" label="Other" title="Bugs, privacy and ideas">
          <p>
            For bugs, say what you clicked and what happened. For anything about your data or the host&rsquo;s logs, see
            the <Link href="/privacy">privacy page</Link>; the same address handles removal requests. For ideas for new
            chapters or answers, write the topic and what you could not find. If something is hard to use with a
            keyboard, a screen reader or low vision, tell us, and see the{" "}
            <Link href="/accessibility">accessibility statement</Link>.
          </p>
        </InfoSection>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href="/about">About</FootLink>
          <FootLink href="/privacy">Privacy</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
