import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/frame/PageFrame";
import { pageMetadata } from "@/lib/metadata";
import styles from "./privacy.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "No account and no cookies of our own. What stays in your browser, what leaves it, and which service receives it: page analytics, the weather lookup, the narrator, error reports and the language runtimes.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <PageFrame title="Privacy" skipLabel="Skip to the privacy notes">
      <article className={styles.article}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>What leaves this browser</p>
          <h1 className={styles.h1}>Privacy</h1>
          <p className={styles.lead}>
            There is no account and no database behind this site. Most of what you do stays in this browser. This page
            lists everything that does not, and the service that receives it.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="no-account">
          <h2 id="no-account" className={styles.h2}>
            No account
          </h2>
          <p>There is nothing to sign up for, and the site sets no cookies of its own.</p>
        </section>

        <section className={styles.section} aria-labelledby="stays">
          <h2 id="stays" className={styles.h2}>
            What stays in this browser
          </h2>
          <p>
            Your progress and streak, the marks you give interview answers, your mock interview history, your boards,
            your code drafts and run history, and your settings, such as the theme, the font, the text size and the
            narrator&rsquo;s voice. They are kept in this browser&rsquo;s local storage. None of it is sent anywhere,
            except that the narrator&rsquo;s voice, speed and pitch go with the text it reads, as described below. They
            do not follow you to another browser or device, and clearing this site&rsquo;s data in your browser removes
            them.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="leaves">
          <h2 id="leaves" className={styles.h2}>
            What leaves it
          </h2>
          <ul className={styles.list}>
            <li>
              <b>Page analytics.</b> Vercel Web Analytics counts page views. For each one it receives the page&rsquo;s
              address, including its query string, and the referrer, and works out your country, device type, browser
              and operating system from the request. Vercel Speed Insights records how fast pages load. Neither sets a
              cookie.
            </li>
            <li>
              <b>The weather, only when you ask for it.</b> Pressing &ldquo;add weather&rdquo; on the clock asks your
              browser for your location. Your browser sends your exact coordinates to this site&rsquo;s{" "}
              <code>/api/weather</code> in the address of the request, so they can appear in the host&rsquo;s request
              logs. The server rounds them to one decimal place before asking Open-Meteo for the forecast, so Open-Meteo
              sees only the rounded position. The answer stays in this browser until the next lookup, and the clock
              reuses it for half an hour.
            </li>
            <li>
              <b>The narrator.</b> When a chapter is read aloud, the text being read is sent to this site&rsquo;s{" "}
              <code>/api/tts</code> a few paragraphs at a time, with your chosen voice, speed and pitch, and the server
              asks Microsoft&rsquo;s Edge read-aloud service for the audio. It is the chapter&rsquo;s own text, never
              anything you typed.
            </li>
            <li>
              <b>Error reports.</b> When something breaks, the error message, the stack trace, the page address and your
              browser&rsquo;s user agent go to <code>/api/client-error</code> and into the host&rsquo;s logs. If error
              tracking with Sentry is switched on, the report goes to Sentry instead, with Sentry&rsquo;s option to send
              personal data turned off. Sentry then also receives timing traces for about one in ten page loads and page
              changes, and an error report sent to it can include the addresses of recent requests and page changes,
              which can include your exact weather coordinates.
            </li>
            <li>
              <b>Language runtimes.</b> Running Python, SQL, Lua, Ruby, PHP, C or C++ in the playground downloads that
              language&rsquo;s runtime from jsDelivr, a public CDN. Your code runs in your browser and is not sent with
              the download.
            </li>
            <li>
              <b>Hosting.</b> Vercel serves every page and keeps standard request logs: the address requested, your IP
              address and your browser&rsquo;s user agent. The dev joke on the{" "}
              <Link href="/progress">progress page</Link> is fetched by the server from JokeAPI, and nothing of yours
              goes with it.
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="never">
          <h2 id="never" className={styles.h2}>
            What never leaves
          </h2>
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
        </section>

        <section className={styles.section} aria-labelledby="who">
          <h2 id="who" className={styles.h2}>
            Who runs this site
          </h2>
          <p>
            Groundwork is run by AustinCoders, at groundwork.austincoders.com. For questions about privacy or your data,
            write to <a href="mailto:help@austincoders.com">help@austincoders.com</a>. That is also the address to ask
            for anything held in the host&rsquo;s logs or in Sentry to be removed.
          </p>
        </section>

        <p className={styles.updated}>Last updated 30 September 2026.</p>
      </article>
    </PageFrame>
  );
}
