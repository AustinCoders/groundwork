import menuButton from "@/components/MenuButton.module.css";
import { TopIcon } from "@/components/practice/TopIcon";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import { CardKicker, Facts } from "@/components/topic/TopicKit";
import type { ReactNode } from "react";
import styles from "./tour.module.css";

export interface Slide {
  id: string;
  label: string;
  title: string;
  lead: string;
  action?: { href: string; label: string };
  stage: ReactNode;
}

function TopicsStage() {
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <CardKicker>1 · Pick a topic</CardKicker>
        <ul className={styles.rows}>
          <li>
            <span className={styles.mark}>JS</span>
            <span>JavaScript</span>
          </li>
          <li>
            <span className={styles.mark}>⚛</span>
            <span>React</span>
          </li>
          <li>
            <span className={styles.mark}>{"{ }"}</span>
            <span>Data structures</span>
          </li>
        </ul>
      </Card>
      <Card at="b" tilt={1}>
        <Tag tone="primary">your level</Tag>
        <CardKicker>2 · How much do you know?</CardKicker>
        <ul className={styles.choices}>
          <li>Beginner</li>
          <li data-picked>Intermediate</li>
          <li>Advanced</li>
        </ul>
        <p className={styles.cardFoot}>Not sure? Start at Beginner and move up any time.</p>
      </Card>
      <Card at="c" tone="note" tilt={-1} extra>
        <CardKicker>3 · Your path</CardKicker>
        <p className={styles.cardText}>Short chapters in order, each with an exercise.</p>
        <Remark>a path, not a pile</Remark>
      </Card>
    </Compose>
  );
}

function ChaptersStage() {
  return (
    <Compose layout="rail">
      <Card at="a" tilt={-1} taped className={styles.pageCard}>
        <CardKicker>Closures · B13</CardKicker>
        <p className={styles.pageTitle}>A function that remembers</p>
        <p className={styles.cardText}>A closure is a function plus the scope it was born in.</p>
        <pre className={styles.code}>{"const make = () => {\n  let n = 0;\n  return () => ++n;\n};"}</pre>
        <p className={styles.cardFoot}>Return the inner function and that scope stays alive.</p>
      </Card>
      <Card at="b" tilt={1}>
        <CardKicker>On this page</CardKicker>
        <ul className={styles.toc}>
          <li data-here>What a closure is</li>
          <li>A counter</li>
          <li>Common traps</li>
        </ul>
      </Card>
      <Card at="c" tone="note" tilt={-1} extra>
        <CardKicker>Done reading?</CardKicker>
        <span className={styles.tick}>✓ Mark as read</span>
        <Remark>back in 3 days</Remark>
      </Card>
    </Compose>
  );
}

function PracticeStage() {
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <p className={styles.fileBar}>
          <span className={styles.fileName}>counter.js</span>
          <span className={styles.runPill}>▶ Run tests</span>
        </p>
        <pre className={styles.code}>{"function counter() {\n  let n = 0;\n  return () => ++n;\n}"}</pre>
      </Card>
      <Card at="b" tilt={1}>
        <Tag tone="caution">2 of 3 pass</Tag>
        <CardKicker>Real tests</CardKicker>
        <ul className={styles.tests}>
          <li data-ok>counts up from 1</li>
          <li data-ok>keeps its own n</li>
          <li>survives 1000 calls</li>
        </ul>
        <p className={styles.cardFoot}>Fix the last one, run again.</p>
      </Card>
      <Card at="c" tone="note" tilt={-1} extra>
        <CardKicker>In your browser</CardKicker>
        <p className={styles.cardText}>No setup, no sign-up.</p>
        <Remark>type, run, fix</Remark>
      </Card>
    </Compose>
  );
}

function InterviewStage() {
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped className={styles.flipCard}>
        <div className={styles.flip}>
          <div className={styles.front}>
            <CardKicker>Round 2 · Machine coding</CardKicker>
            <p className={styles.pageTitle}>What does a closure capture?</p>
          </div>
          <div className={styles.back}>
            <CardKicker>Round 2 · Machine coding</CardKicker>
            <p className={styles.cardText}>What does a closure capture?</p>
            <p className={styles.pageTitle}>Variables, not values.</p>
            <p className={styles.cardText}>Follow-up: two tabs open, does each get its own counter?</p>
          </div>
        </div>
      </Card>
      <Card at="b" tilt={1}>
        <Tag tone="success">timed</Tag>
        <CardKicker>Mock interview</CardKicker>
        <p className={styles.timer}>32:10</p>
        <ul className={styles.rounds}>
          <li data-done>Warm-up</li>
          <li data-done>Coding</li>
          <li>Design</li>
          <li>Wrap-up</li>
        </ul>
        <p className={styles.cardFoot}>The debrief comes when the clock ends.</p>
      </Card>
      <Card at="c" tone="note" tilt={-1} extra>
        <CardKicker>Debrief</CardKicker>
        <p className={styles.cardText}>Strong on closures, shaky on the event loop.</p>
        <Remark>fix the shaky one</Remark>
      </Card>
    </Compose>
  );
}

function MenuStage() {
  return (
    <Compose layout="trio">
      <Card at="a" tilt={-1} taped>
        <CardKicker>Review · today</CardKicker>
        <p className={styles.pageTitle}>Closures</p>
        <p className={styles.cardText}>Back after 3 days, just before you forget.</p>
      </Card>
      <Card at="b" tilt={1} extra>
        <Tag tone="caution">↻ 2 due</Tag>
        <CardKicker>Progress</CardKicker>
        <Facts
          items={[
            { value: 12, label: "chapters read" },
            { value: 3, label: "day streak" },
          ]}
        />
        <p className={styles.cardFoot}>Saved in this browser, no account.</p>
      </Card>
      <Card at="c" tone="note" tilt={-1}>
        <CardKicker>Always in the header</CardKicker>
        <p className={styles.cardText}>
          Search with <kbd className={styles.kbd}>Ctrl K</kbd> or <kbd className={styles.kbd}>⌘ K</kbd>
        </p>
        <div className={styles.header}>
          <span className={menuButton.pill}>
            <TopIcon name="menu" size={18} />
            <span>Menu</span>
          </span>
          <span className={styles.brand}>
            <span className="brand__mark">G</span>
          </span>
        </div>
        <Remark>The Menu is here</Remark>
      </Card>
    </Compose>
  );
}

export const SLIDES: Slide[] = [
  {
    id: "topics",
    label: "Topics and levels",
    title: "Pick a topic, then say how much you know.",
    lead: "Every topic comes in three levels. Tell the site where you are and it lays out a path of short chapters, in order, so you never wonder what to read next.",
    action: { href: "/#shelf", label: "Browse the topics" },
    stage: <TopicsStage />,
  },
  {
    id: "chapters",
    label: "Chapters",
    title: "Read in short parts.",
    lead: "Each chapter takes a few minutes. The sidebar shows where you are, On this page jumps between sections, and one tick marks it read.",
    stage: <ChaptersStage />,
  },
  {
    id: "practice",
    label: "Practice",
    title: "Run real code against real tests.",
    lead: "The playground and every problem run in your browser. Write the function, press Run, and the tests tell you which case fails.",
    action: { href: "/practice?id=free", label: "Open the playground" },
    stage: <PracticeStage />,
  },
  {
    id: "interview",
    label: "Interview book and mock",
    title: "Practise the interview, not just the facts.",
    lead: "The interview book walks every round and the follow-up they push next. The mock interview times you and ends with a debrief on what to fix.",
    action: { href: "/mock", label: "Try a mock interview" },
    stage: <InterviewStage />,
  },
  {
    id: "menu",
    label: "Review, progress and the Menu",
    title: "It comes back for review. The Menu gets you around.",
    lead: "Chapters return for review just before you would forget them, and your progress stays in this browser. The Menu is always in the header, and Ctrl or Cmd plus K searches the site.",
    stage: <MenuStage />,
  },
];
