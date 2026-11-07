import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { InfoHero, type InfoEntry } from "@/components/info/InfoHero";
import { InfoSection } from "@/components/info/InfoSection";
import styles from "@/components/info/info.module.css";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Accessibility",
  description:
    "What Groundwork does for keyboard, screen reader and low-vision readers, what has been checked, and the known gaps.",
  path: "/accessibility",
});

const ENTRIES: InfoEntry[] = [
  { id: "done", title: "What is in place" },
  { id: "checked", title: "What has been checked" },
  { id: "gaps", title: "Known gaps" },
  { id: "report", title: "Tell us" },
];

export default function AccessibilityPage() {
  return (
    <PageFrame title="Accessibility" mark="A" accent="blue" skipLabel="Skip to the statement" layout="reader">
      <TopicPage accent="blue">
        <InfoHero
          mark="A"
          kicker="Reading and using the site"
          title="Accessibility"
          lead="What the site does to be usable with a keyboard, a screen reader and low vision, how much of that has been checked, and where it falls short."
          entries={ENTRIES}
          updated="Last updated 7 November 2026"
          tag="✓ honest about gaps"
          short="Built with standard HTML and tested in part. It has not had a screen reader audit, and some tools are pointer-first."
          contact="help@austincoders.com"
          jump={{ href: "#gaps", label: "Known gaps" }}
        />

        <InfoSection no="01" id="done" label="In place" title="What is in place">
          <ul className={styles.rows}>
            <li>
              <b>Structure</b>
              Pages use headings, landmarks and lists, and every page starts with a skip link that jumps past the
              navigation.
            </li>
            <li>
              <b>Keyboard</b>
              Links, buttons and tabs can be reached and used with the keyboard, and focused controls show a visible
              outline. Menus and dialogs trap focus while open and return it when closed.
            </li>
            <li>
              <b>Look and size</b>
              Nine colour themes, including a dark one and a black-and-white Mono theme, eight reading fonts including
              two plain ones (Reading and Roboto), and a reading size control. The site follows your operating
              system&rsquo;s reduced-motion setting by reducing animation.
            </li>
            <li>
              <b>Announcements</b>
              Results of runs and checks are announced to screen readers when they appear.
            </li>
          </ul>
        </InfoSection>

        <InfoSection no="02" id="checked" label="Checked" title="What has been checked">
          <p>
            On 21 October 2026 text contrast was measured on the company question pages in all nine themes, and a
            separate review of sample pages across the site found the same: body text at 4.5 to 1 or better. Code
            colours are tested against each theme&rsquo;s background by the automated tests, and one of them, comments
            in the kraft theme, falls just short at 3.9 to 1. Pages were also checked at a phone width of 375 pixels,
            with no sideways scrolling.
          </p>
          <p>
            Automated browser accessibility scans are not run on every change at the moment, and the site has not been
            audited with a screen reader or by an accessibility specialist. Treat this page as a description of intent
            and partial checks, not as a conformance claim.
          </p>
        </InfoSection>

        <InfoSection no="03" id="gaps" label="Gaps" title="Known gaps">
          <ul className={styles.rows}>
            <li>
              <b>The whiteboard</b>
              Drawing needs a pointer. Keyboard shortcuts exist for tools and for stepping through a walkthrough, but
              you cannot draw a shape with the keyboard alone.
            </li>
            <li>
              <b>Diagrams and visualisers</b>
              Diagrams carry a text description and the step lists that go with them, but the animated visualisers show
              their state mostly as pictures.
            </li>
            <li>
              <b>The code editor</b>
              It is a third-party editor with its own keyboard behaviour, and it may not be fully usable with a screen
              reader.
            </li>
            <li>
              <b>Handwriting fonts</b>
              The default look uses handwriting-style fonts, which some readers find harder to read. The Reading and
              Roboto fonts in the appearance settings are plain alternatives.
            </li>
            <li>
              <b>Some small text</b>A few labels are set small, and the interface relies on the browser zoom or the
              reading size control to enlarge them.
            </li>
          </ul>
        </InfoSection>

        <InfoSection no="04" id="report" label="Tell us" title="If something blocks you">
          <p>
            Email <a href="mailto:help@austincoders.com">help@austincoders.com</a> with the page address, what you were
            trying to do, and the assistive technology you use if you are comfortable saying. Reports about access are
            read first. The <Link href="/contact">contact page</Link> says what else to include, and fixes appear on the{" "}
            <Link href="/changelog">changelog</Link>.
          </p>
        </InfoSection>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href="/about">About</FootLink>
          <FootLink href="/contact">Contact</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
