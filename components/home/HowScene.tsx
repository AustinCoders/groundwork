import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersMotion } from "@/lib/dom";
import { buildLoop } from "@/lib/trail";
import { Chip, Copy, Scene, Spark, Stage, StageCard, Sticker } from "./Stage";
import { TrackSvg, Walker } from "./Track";
import { usePin } from "./usePin";
import { NARROW, useMedia } from "./useNarrow";
import { inWindow, stepAttrs } from "./tone";
import styles from "./how.module.css";

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

export const HOW_STEPS = STEPS.length;

const RUN_TESTS = ["returns a promise", "resolves in order", "rejects on the first failure", "handles an empty list"];
const CHAT: { who: "them" | "you"; text: string }[] = [
  { who: "them", text: "Build me a debounce." },
  { who: "you", text: "A timer, cleared on every call." },
  { who: "them", text: "Good. Now how do I cancel it?" },
];
const REVIEW_DAYS = [0, 3, 10, 31];
const AUTO_ADVANCE_MS = 5500;
const CORNERS = ["tl", "tr", "br", "bl"] as const;
const NOTES = [
  "built from the bottom up",
  "real tests, real feedback",
  "the follow-up they push with next",
  "comes back before you forget",
];
const LOOP = buildLoop();

function ReadArt() {
  return (
    <svg className={styles.artSvg} viewBox="0 0 200 100" focusable="false">
      <g className={styles.books}>
        <rect data-book="a" x="12" y="68" width="94" height="16" rx="2" />
        <rect data-book="b" x="22" y="52" width="78" height="16" rx="2" />
        <rect data-book="c" x="16" y="36" width="86" height="16" rx="2" />
        <path d="M24 68v16M94 68v16M32 52v16M88 52v16M26 36v16M92 36v16" />
        <path className={styles.mark} d="M80 36v26l5-4 5 4V36z" />
      </g>
      <g className={styles.sheet}>
        <rect x="116" y="12" width="76" height="76" rx="3" />
        <path d="M124 24h58M124 33h44M124 42h52M124 60h30" />
        <rect
          className={styles.hl}
          data-fx="bar"
          data-fx-from="0.4"
          data-fx-to="0.58"
          x="122"
          y="47"
          width="62"
          height="8"
          rx="2"
        />
        <path d="M124 51h56" />
        <path className={styles.layers} d="M158 82h26M162 77h22M166 72h18M170 67h14M174 62h10" />
      </g>
    </svg>
  );
}

function RunArt() {
  return (
    <div className={styles.term}>
      <div className={styles.termBar}>
        <i />
        <i />
        <i />
        <em>promises.test.js</em>
      </div>
      <ul className={styles.tests}>
        {RUN_TESTS.map((t, k) => (
          <li key={t} data-fx="light" data-fx-from={0.42 + k * 0.07}>
            <span className={styles.tick}>
              <b>○</b>
              <i>✓</i>
            </span>
            {t}
          </li>
        ))}
      </ul>
      <div className={styles.runFoot}>
        <span className={styles.runBar}>
          <span data-fx="bar" data-fx-from="0.42" data-fx-to="0.7" />
        </span>
        <strong className={styles.runBig} data-fx="reveal" data-fx-from="0.62" data-fx-rate="12">
          4 / 4 passed
        </strong>
      </div>
    </div>
  );
}

function AskedArt() {
  return (
    <div className={styles.chat}>
      <p data-who={CHAT[0].who} data-fx="reveal" data-fx-from="0.38" data-fx-rate="14">
        {CHAT[0].text}
      </p>
      <p data-who={CHAT[1].who} data-fx="reveal" data-fx-from="0.46" data-fx-rate="14">
        {CHAT[1].text}
      </p>
      <span className={styles.typing} data-fx="typing" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p data-who={CHAT[2].who} data-fx="reveal" data-fx-from="0.62" data-fx-rate="14">
        {CHAT[2].text}
      </p>
    </div>
  );
}

function KeepArt() {
  return (
    <div className={styles.keep}>
      <div className={styles.cal}>
        {Array.from({ length: 35 }, (_, k) => {
          const at = REVIEW_DAYS.indexOf(k);
          return (
            <span
              key={k}
              data-on={at >= 0 || undefined}
              data-fx={at >= 0 ? "light" : undefined}
              data-fx-from={at >= 0 ? 0.4 + at * 0.06 : undefined}
            >
              {at >= 0 ? k : ""}
              {at >= 0 && (
                <svg className={styles.pen} viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M12 2.5C18 2 22.5 7 21.5 13 20.5 19 15 22.5 10 21.5 4.5 20.5 1.8 15 3 9.5 4 5 8 3 12.5 3.2"
                    pathLength={1}
                    data-fx="stroke"
                    data-fx-from={0.42 + at * 0.06}
                    data-fx-rate="9"
                  />
                </svg>
              )}
            </span>
          );
        })}
      </div>
      <p className={styles.toast} data-fx="reveal" data-fx-from="0.62" data-fx-rate="12">
        <svg viewBox="0 0 16 16" focusable="false">
          <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2.5h11L12 9V6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0" />
        </svg>
        Comes back in 3 days
      </p>
    </div>
  );
}

const ARTS = [ReadArt, RunArt, AskedArt, KeepArt];

function Station({ k }: { k: number }) {
  const Art = ARTS[k];
  return (
    <li
      className={styles.station}
      data-corner={CORNERS[k]}
      data-fx="milestone"
      data-fx-shape="loop"
      data-fx-at={LOOP.at[k]}
    >
      <span className={styles.badge}>{String(k + 1).padStart(2, "0")}</span>
      <StageCard still i={k} rot={k % 2 ? 1.2 : -1.2} depth={k % 2 ? -5 : 6} className={styles.stationCard}>
        <div className={styles.art} data-step={k}>
          <Art />
        </div>
        <p className={styles.stationLine}>
          <b>{STEPS[k].k}</b> {STEPS[k].line}
        </p>
      </StageCard>
      <span className={styles.stationNote}>{NOTES[k]}</span>
    </li>
  );
}

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
  const { pinned, go } = usePin(sceneRef, (step) => setActive(step));

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

  const running = motion && onScreen && tabVisible && !hovered && !focused && !chosen && !pinned;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setActive((current) => (current + 1) % STEPS.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [running, active]);

  function choose(next: number) {
    if (pinned) {
      go(next, 0);
      return;
    }
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
              {(running || pinned) && i === active && (
                <span className={styles.stepFill} data-fx="fill" data-scrub={pinned || undefined} aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </Copy>
      <Stage live tone="green" className={styles.howStage} hostClassName={styles.howHost}>
        <TrackSvg trail={LOOP} tone="green" shape="loop" className={styles.loopTrack} />
        <ol className={styles.stations} aria-hidden="true">
          {STEPS.map((s, k) => (
            <Station key={s.k} k={k} />
          ))}
        </ol>
        <Walker shape="loop" className={styles.loopTrack} />
        <span className={styles.again} aria-hidden="true">
          and round it goes again
        </span>
        {STEPS.map((s, i) => (
          <StageCard
            key={s.k}
            fx="part"
            rot={-0.4}
            depth={6}
            i={1 + i}
            className={styles.howCaption}
            {...stepAttrs(i, STEPS.length)}
            role="tabpanel"
            id={`how-panel-${i}`}
            aria-labelledby={`how-tab-${i}`}
            hidden={!inWindow(i, active, pinned)}
            inert={i !== active || undefined}
            aria-hidden={i !== active || undefined}
          >
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </StageCard>
        ))}
        <Sticker rot={7} depth={22} tone="success" className={styles.hSticker}>
          +25 XP
        </Sticker>
        <Spark className={styles.hSpark} />
        <Chip fact="4 / 4 passed" rot={-3} depth={12} speed={50} className={styles.chipA}>
          4 / 4 passed
        </Chip>
        <Chip fact="back in 3 days" rot={2} depth={-8} speed={-36} className={styles.chipB}>
          back in 3 days
        </Chip>
      </Stage>
    </Scene>
  );
}
