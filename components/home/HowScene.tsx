import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersMotion } from "@/lib/dom";
import { Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import { NARROW, useMedia } from "./useNarrow";
import { vars } from "./tone";
import styles from "./scenes.module.css";

const STEPS = [
  {
    k: "Read",
    line: "Chapters layered bottom to top.",
    title: "Read a chapter that builds on the last one.",
    body: "Every topic is layered bottom to top, so an idea only arrives after the ideas it rests on. You never skim past a word you do not know yet.",
  },
  {
    k: "Run",
    line: "Real tests, right in the page.",
    title: "Prove it with real tests, right in the page.",
    body: "Chapters that need practice end in an editor. Your answer runs in your browser against real tests, and a pass is what counts.",
  },
  {
    k: "Get asked",
    line: "The follow-up they push with next.",
    title: "Then get asked the follow-up.",
    body: "The interview book shows how each round really goes: the question, the wrong answer that loses the room, and what they push with next.",
  },
  {
    k: "Keep",
    line: "Spaced review before you forget.",
    title: "And it comes back before you forget.",
    body: "Chapters you finish come back for review on a spaced schedule, so what you read in week one is still there on interview day.",
  },
];

const LAYERS = ["Syntax and values", "How code runs", "Core concepts", "Patterns", "Systems and scale"];
const RUN_TESTS = ["returns a promise", "resolves in order", "rejects on the first failure", "handles an empty list"];
const CHAT: { who: "them" | "you"; text: string }[] = [
  { who: "them", text: "Build me a debounce." },
  { who: "you", text: "A timer, cleared on every call, fired after the wait." },
  { who: "them", text: "Good. Now the first call fires at once. And how do I cancel it?" },
];
const REVIEW_DAYS = [0, 3, 10, 31];
const AUTO_ADVANCE_MS = 5500;

function ReadArt() {
  return (
    <>
      <StageCard rot={-3.4} depth={-14} i={1} className={styles.hChapter}>
        <Tape rot={-5} />
        <p className={styles.kicker}>A chapter · how code runs</p>
        <p className={styles.chapterTitle}>
          Code runs <mark>one line at a time</mark>, and each line can only use what came before it.
        </p>
        <span className={styles.paperLine} />
        <span className={`${styles.paperLine} ${styles.short}`} />
        <span className={`${styles.paperLine} ${styles.mid}`} />
      </StageCard>
      <StageCard rot={2.2} depth={12} i={0} className={styles.hLayers}>
        <div className={styles.winBar}>
          <i />
          <i />
          <i />
          <em>the layers</em>
        </div>
        <div className={styles.layers}>
          {LAYERS.map((t, i) => (
            <span key={t} className={styles.layer} style={vars({ i })} data-top={i === 3 || undefined}>
              <b>{String(i + 1).padStart(2, "0")}</b>
              {t}
              {i === 3 && <em>you are here</em>}
            </span>
          ))}
        </div>
        <small className={styles.demoNote}>Each layer only uses words from the ones below it.</small>
      </StageCard>
      <StageCard rot={-1.6} depth={-8} i={2} extra className={styles.hDone}>
        <span className={styles.doneTick}>✓</span>
        <span>
          <b>Syntax and values</b>
          <small>read · back for review soon</small>
        </span>
      </StageCard>
      <Sticker rot={7} depth={20} tone="info" className={styles.hSticker}>
        layer 4 of 5
      </Sticker>
      <Note arrow="ur" rot={-4} depth={16} className={styles.hNote}>
        built from the bottom up
      </Note>
    </>
  );
}

function RunArt() {
  return (
    <>
      <StageCard rot={-2.8} depth={-14} i={1} className={styles.hCode}>
        <div className={styles.winBar}>
          <i />
          <i />
          <i />
          <em>load.js</em>
        </div>
        <div className={styles.code}>
          <span className={styles.kw}>async function</span> load(ids) {"{"}
          {"\n  "}
          <span className={styles.kw}>const</span> rows = <span className={styles.kw}>await</span>
          {"\n    "}Promise.all(ids.map(get));{"\n  "}
          <span className={styles.kw}>return</span> rows;{"\n"}
          {"}"}
        </div>
      </StageCard>
      <StageCard rot={1.6} depth={12} i={0} className={styles.hTests}>
        <Tape rot={3} />
        <div className={styles.winBar}>
          <i />
          <i />
          <i />
          <em>promises.test.js</em>
          <b className={styles.runMini}>▶ Run tests</b>
        </div>
        <ul className={styles.runTests}>
          {RUN_TESTS.map((t, k) => (
            <li key={t} style={vars({ k })}>
              <span className={styles.runMark}>
                <b>○</b>
                <i>✓</i>
              </span>
              {t}
            </li>
          ))}
        </ul>
        <span className={styles.runBar}>
          <span />
        </span>
        <strong className={styles.runBig}>4 / 4 passed</strong>
      </StageCard>
      <StageCard rot={-2} depth={-6} i={2} extra className={styles.hHint}>
        <b>Failing?</b> Read the first red test, not the last.
      </StageCard>
      <Sticker rot={8} depth={22} tone="success" className={styles.hSticker}>
        +25 XP
      </Sticker>
      <Note arrow="ur" rot={-3} depth={16} className={styles.hNote}>
        graded in your browser
      </Note>
    </>
  );
}

function AskedArt() {
  return (
    <>
      <StageCard rot={-2.6} depth={-14} i={1} className={styles.hRound}>
        <Tape rot={4} />
        <p className={styles.kicker}>Round 02 · machine coding</p>
        <p className={styles.roundQ}>“Now make it work with two browser tabs open.”</p>
        <p className={styles.followChip}>the follow-up they push with next →</p>
      </StageCard>
      <StageCard rot={1.8} depth={12} i={0} className={styles.hChat}>
        <div className={styles.winBar}>
          <i />
          <i />
          <i />
          <em>the interviewer</em>
        </div>
        <div className={styles.chat}>
          {CHAT.slice(0, 2).map((m, i) => (
            <p key={m.text} data-who={m.who} style={vars({ i })}>
              {m.text}
            </p>
          ))}
          <div className={styles.chatLast}>
            <span className={styles.typing}>
              <i />
              <i />
              <i />
            </span>
            <p data-who={CHAT[2].who} style={vars({ i: 2 })}>
              {CHAT[2].text}
            </p>
          </div>
        </div>
      </StageCard>
      <StageCard rot={-1.8} depth={-8} i={2} extra className={styles.hTrap}>
        <p className={styles.trapLabel}>The answer that loses the room</p>
        <p>“Just call it on every keystroke.”</p>
      </StageCard>
      <Sticker rot={-7} depth={20} tone="caution" className={styles.hSticker}>
        follow-up!
      </Sticker>
      <Note arrow="ur" rot={-3} depth={16} className={styles.hNote}>
        every round shows it
      </Note>
    </>
  );
}

function KeepArt() {
  return (
    <>
      <StageCard rot={-2.4} depth={-14} i={1} className={styles.hDue}>
        <Tape rot={-4} />
        <p className={styles.kicker}>Due for review</p>
        <ul className={styles.dueList}>
          {["Syntax and values", "How code runs", "Core concepts"].map((t, k) => (
            <li key={t} style={vars({ k })}>
              <span aria-hidden="true">↻</span>
              {t}
            </li>
          ))}
        </ul>
      </StageCard>
      <StageCard rot={1.7} depth={12} i={0} className={styles.hCal}>
        <div className={styles.winBar}>
          <i />
          <i />
          <i />
          <em>your review calendar</em>
        </div>
        <div className={styles.cal}>
          {Array.from({ length: 35 }, (_, i) => {
            const k = REVIEW_DAYS.indexOf(i);
            return (
              <span key={i} data-on={k >= 0 || undefined} style={k >= 0 ? vars({ k }) : undefined}>
                {k >= 0 ? i : ""}
              </span>
            );
          })}
        </div>
        <small className={styles.demoNote}>Read today. Back after 3 days, then 7 more, then 21.</small>
      </StageCard>
      <StageCard rot={-1.4} depth={-8} i={2} extra className={styles.hStreak}>
        <span className={styles.flame}>↻</span>
        <span>
          <b>Comes back in 3 days</b>
          <small>before it fades</small>
        </span>
      </StageCard>
      <Sticker rot={6} depth={20} tone="primary" className={styles.hSticker}>
        review due
      </Sticker>
      <Note arrow="ur" rot={-4} depth={16} className={styles.hNote}>
        before you forget
      </Note>
    </>
  );
}

const ARTS = [ReadArt, RunArt, AskedArt, KeepArt];

export function HowScene({ head }: { head: ReactNode }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const narrow = useMedia(NARROW);
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [motion, setMotion] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setMotion(prefersMotion());
    const syncVisible = () => setTabVisible(document.visibilityState === "visible");
    syncMotion();
    syncVisible();
    reduced.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisible);
    const root = sceneRef.current;
    let observer: IntersectionObserver | null = null;
    if (root && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.3 });
      observer.observe(root);
    }
    return () => {
      reduced.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisible);
      observer?.disconnect();
    };
  }, []);

  const running = motion && onScreen && tabVisible && !hovered && !focused && !chosen;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setActive((current) => (current + 1) % STEPS.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [running, active]);

  function choose(next: number) {
    setChosen(true);
    setActive(next);
  }

  function onKey(e: React.KeyboardEvent) {
    const count = STEPS.length;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (active + 1) % count
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (active - 1 + count) % count
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  }

  return (
    <Scene
      sceneRef={sceneRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <Copy>
        {head}
        <div
          className={styles.stepTabs}
          role="tablist"
          aria-label="How it works"
          aria-orientation={narrow ? "horizontal" : "vertical"}
          onKeyDown={onKey}
        >
          {STEPS.map((s, i) => (
            <button
              key={s.k}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`how-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`how-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              className={styles.stepTab}
              onClick={() => choose(i)}
            >
              <span className={styles.stepIdx}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.stepName}>{s.k}</span>
              <span className={styles.stepLine}>{s.line}</span>
              {running && i === active && <span className={styles.stepFill} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </Copy>
      <Stage live tone="green" className={styles.howStage}>
        {STEPS.map((s, i) => {
          const Art = ARTS[i];
          return (
            <div
              key={s.k}
              className={styles.howPanel}
              role="tabpanel"
              id={`how-panel-${i}`}
              aria-labelledby={`how-tab-${i}`}
              hidden={i !== active}
            >
              <div className={styles.howArt} aria-hidden="true">
                <Art />
              </div>
              <StageCard rot={-0.6} depth={6} i={3} className={styles.howCaption}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </StageCard>
              <Spark className={styles.hSpark} />
            </div>
          );
        })}
      </Stage>
    </Scene>
  );
}
