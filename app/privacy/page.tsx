import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { Foot, FootLink, TopicPage } from "@/components/topic/TopicKit";
import { pageMetadata } from "@/lib/metadata";
import { PrivacyHero, type PrivacyEntry } from "./PrivacyHero";
import { PrivacySection } from "./PrivacySection";
import styles from "./privacy.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "No account and no cookies of our own. What stays in your browser, what leaves it, and which service receives it: page analytics, the narrator, error reports and the language runtimes.",
  path: "/privacy",
});

const ENTRIES: PrivacyEntry[] = [
  { id: "no-account", title: "No account" },
  { id: "stays", title: "What stays in this browser" },
  { id: "leaves", title: "What leaves it" },
  { id: "never", title: "What never leaves" },
  { id: "who", title: "Who runs this site" },
];

export default function PrivacyPage() {
  return (
    <PageFrame title="Privacy" mark="§" accent="blue" skipLabel="Skip to the privacy notes" layout="reader">
      <TopicPage accent="blue">
        <PrivacyHero entries={ENTRIES} updated="Last updated 30 September 2026" contact="help@austincoders.com" />

        <PrivacySection no="01" id="no-account" label="Account" title="No account">
          <p>There is nothing to sign up for, and the site sets no cookies of its own.</p>
        </PrivacySection>

        <PrivacySection no="02" id="stays" label="Stays here" title="What stays in this browser">
          <p>
            Your progress and streak, the marks you give interview answers, your mock interview history, your boards,
            your code drafts and run history, and your settings, such as the theme, the font, the text size and the
            narrator&rsquo;s voice. They are kept in this browser&rsquo;s local storage. None of it is sent anywhere,
            except that the narrator&rsquo;s voice, speed and pitch go with the text it reads, as described below. They
            do not follow you to another browser or device, and clearing this site&rsquo;s data in your browser removes
            them.
          </p>
        </PrivacySection>

        <PrivacySection no="03" id="leaves" label="Leaves" title="What leaves it">
          <ul className={styles.rows}>
            <li>
              <b>Page analytics</b> Vercel Web Analytics counts page views. For each one it receives the page&rsquo;s
              address, including its query string, and the referrer, and works out your country, device type, browser
              and operating system from the request. Vercel Speed Insights records how fast pages load. Neither sets a
              cookie.
            </li>
            <li>
              <b>The narrator</b> When a chapter is read aloud, the text being read is sent to this site&rsquo;s{" "}
              <code>/api/tts</code> a few paragraphs at a time, with your chosen voice, speed and pitch, and the server
              asks Microsoft&rsquo;s Edge read-aloud service for the audio. It is the chapter&rsquo;s own text, never
              anything you typed.
            </li>
            <li>
              <b>Error reports</b> When something breaks, the error message, the stack trace, the page address and your
              browser&rsquo;s user agent go to <code>/api/client-error</code> and into the host&rsquo;s logs. If error
              tracking with Sentry is switched on, the report goes to Sentry instead, with Sentry&rsquo;s option to send
              personal data turned off. Sentry then also receives timing traces for about one in ten page loads and page
              changes, and an error report sent to it can include the addresses of recent requests and page changes.
            </li>
            <li>
              <b>Language runtimes</b> Running Python, SQL, Lua, Ruby, PHP, C or C++ in the playground downloads that
              language&rsquo;s runtime from jsDelivr, a public CDN. Your code runs in your browser and is not sent with
              the download.
            </li>
            <li>
              <b>Hosting</b> Vercel serves every page and keeps standard request logs: the address requested, your IP
              address and your browser&rsquo;s user agent. The dev joke on the{" "}
              <Link href="/progress">progress page</Link> is fetched by the server from JokeAPI, and nothing of yours
              goes with it.
            </li>
          </ul>
        </PrivacySection>

        <PrivacySection no="04" id="never" label="Never leaves" title="What never leaves">
          <p>
            Your code and your answers. A share link from the{" "}
            <Link href="/practice?id=free" prefetch={false}>
              playground
            </Link>{" "}
            or the <Link href="/whiteboard">whiteboard</Link> carries the code or the board after the <code>#</code> in
            its address, and browsers do not send that part to a server when they open a page. The page removes it from
            the address as soon as it has read it. An error in the moment before that can still carry it, in a report to{" "}
            <code>/api/client-error</code> or, if it is switched on, to Sentry.
          </p>
        </PrivacySection>

        <PrivacySection no="05" id="who" label="Who" title="Who runs this site">
          <p>
            Groundwork is run by AustinCoders, at groundwork.austincoders.com. For questions about privacy or your data,
            write to <a href="mailto:help@austincoders.com">help@austincoders.com</a>. That is also the address to ask
            for anything held in the host&rsquo;s logs or in Sentry to be removed.
          </p>
        </PrivacySection>

        <Foot>
          <FootLink href="/">All topics</FootLink>
          <FootLink href="/architecture">How this site is built</FootLink>
        </Foot>
      </TopicPage>
    </PageFrame>
  );
}
