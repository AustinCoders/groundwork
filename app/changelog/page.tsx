import type { Metadata } from "next";
import { PageFrame } from "@/components/frame/PageFrame";
import { InfoHero, type InfoEntry } from "@/components/info/InfoHero";
import { InfoSection } from "@/components/info/InfoSection";
import styles from "@/components/info/info.module.css";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { CHANGELOG } from "@/content/changelog";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Changelog",
  description: "What changed on Groundwork and when: new chapters, answers, features and fixes, newest first.",
  path: "/changelog",
});

const ENTRIES: InfoEntry[] = [
  { id: "recent", title: "What changed" },
  { id: "how", title: "How this list is kept" },
];

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function ChangelogPage() {
  return (
    <PageFrame title="Changelog" mark="Δ" accent="blue" skipLabel="Skip to the changes" layout="reader">
      <TopicPage accent="blue">
        <InfoHero
          mark="Δ"
          kicker="What changed"
          title="Changelog"
          lead="New chapters, answers, features and fixes, newest first. Corrections to existing content are listed too, so you can see what was wrong."
          entries={ENTRIES}
          updated={`Last entry ${longDate(CHANGELOG[0].date)}`}
          tag="✓ kept by hand"
          short="Each entry says what changed in plain words. Smaller edits are not listed."
          contact="help@austincoders.com"
          jump={{ href: "#recent", label: "See what changed" }}
        />

        <InfoSection no="01" id="recent" label="Recent" title="What changed">
          <ul className={styles.updates}>
            {CHANGELOG.map((entry) => (
              <li key={`${entry.date}-${entry.title}`}>
                <time dateTime={entry.date}>{longDate(entry.date)}</time>
                <h3>{entry.title}</h3>
                <ul>
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </InfoSection>

        <InfoSection no="02" id="how" label="How" title="How this list is kept">
          <p>
            It is written by hand after each batch of work, from the project history, and it starts on 12 October 2026.
            It lists what a reader would notice, not every edit. If you spot something that changed without being
            listed, or a mistake that was fixed silently, write to the address on the contact page.
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
