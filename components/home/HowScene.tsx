import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersMotion, REDUCED_MOTION } from "@/lib/dom";
import { HOW_STEP_COPY, NEXT_REVIEW, REVIEW_DAYS } from "@/lib/homeHow";
import { nextTab } from "@/lib/tablist";
import { buildLoop } from "@/lib/trail";
import { Chip, Copy, Scene, Spark, Stage, StageCard, Sticker } from "./Stage";
import { TrackSvg, Walker } from "./Track";
import { usePin } from "./usePin";
import { useMedia } from "./useNarrow";
import { inWindow, panelAttrs, stepAttrs, XP_STICKER } from "./tone";
import { NARROW } from "@/lib/breakpoints";
import { useMounted } from "./useMounted";
import styles from "./how.module.css";

const RUN_TESTS = ["returns a promise", "resolves in order", "rejects on the first failure", "handles an empty list"];
const PASSED = `${RUN_TESTS.length} / ${RUN_TESTS.length} passed`;
const CHAT: { who: "them" | "you"; text: string }[] = [
  { who: "them", text: "Build me a debounce." },
  { who: "you", text: "A timer, cleared on every call." },
  { who: "them", text: "Good. Now how do I cancel it?" },
];
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
          data-motion="bar"
          data-fx-from="0.2"
          data-fx-to="0.4"
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
          <li key={t} data-motion="light" data-fx-from={0.24 + k * 0.07}>
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
          <span data-motion="bar" data-fx-from="0.24" data-fx-to="0.52" />
        </span>
        <strong className={styles.runBig} data-motion="reveal" data-fx-from="0.44" data-fx-rate="12">
          {PASSED}
        </strong>
      </div>
    </div>
  );
}

function AskedArt() {
  return (
    <div className={styles.chat}>
      <p data-who={CHAT[0].who} data-motion="reveal" data-fx-from="0.2" data-fx-rate="14">
        {CHAT[0].text}
      </p>
      <p data-who={CHAT[1].who} data-motion="reveal" data-fx-from="0.28" data-fx-rate="14">
        {CHAT[1].text}
      </p>
      <span className={styles.typing} data-motion="typing" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <p data-who={CHAT[2].who} data-motion="reveal" data-fx-from="0.46" data-fx-rate="14">
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
              data-motion={at >= 0 ? "light" : undefined}
              data-fx-from={at >= 0 ? 0.22 + at * 0.06 : undefined}
            >
              {at >= 0 ? k : ""}
              {at >= 0 && (
                <svg className={styles.pen} viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M12 2.5C18 2 22.5 7 21.5 13 20.5 19 15 22.5 10 21.5 4.5 20.5 1.8 15 3 9.5 4 5 8 3 12.5 3.2"
                    pathLength={1}
                    data-motion="stroke"
                    data-fx-from={0.24 + at * 0.06}
                    data-fx-rate="9"
                  />
                </svg>
              )}
            </span>
          );
        })}
      </div>
      <p className={styles.toast} data-motion="reveal" data-fx-from="0.44" data-fx-rate="12">
        <svg viewBox="0 0 16 16" focusable="false">
          <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2.5h11L12 9V6a4 4 0 0 0-4-4zM6.5 13a1.5 1.5 0 0 0 3 0" />
        </svg>
        Comes back in {NEXT_REVIEW}
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
      data-motion="milestone"
      data-fx-shape="loop"
      data-fx-at={LOOP.at[k]}
    >
      <span className={styles.badge}>{String(k + 1).padStart(2, "0")}</span>
      <StageCard still i={k} rot={k % 2 ? 1.2 : -1.2} depth={k % 2 ? -5 : 6} className={styles.stationCard}>
        <div className={styles.art} data-step={k}>
          <Art />
        </div>
        <p className={styles.stationLine}>
          <b>{HOW_STEP_COPY[k].k}</b> {HOW_STEP_COPY[k].line}
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
  const mounted = useMounted();
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState(false);
  const [motion, setMotion] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const target = useRef(0);
  const advances = useRef(0);
  const [focused, setFocused] = useState(false);
  function settle(next: number) {
    target.current = next;
    setActive(next);
  }

  const { pinned, go } = usePin(sceneRef, settle);

  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION);
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

  const playing = !paused && !finished;
  const running = motion && onScreen && tabVisible && !hovered && !focused && !chosen && !pinned && playing;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      advances.current += 1;
      if (advances.current >= HOW_STEP_COPY.length) setFinished(true);
      settle((target.current + 1) % HOW_STEP_COPY.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [running, active]);

  function choose(next: number) {
    target.current = next;
    if (pinned) {
      go(next, 0);
      return;
    }
    setChosen(true);
    setActive(next);
  }

  function toggleAutoplay() {
    if (playing) {
      setPaused(true);
      return;
    }
    advances.current = 0;
    setFinished(false);
    setPaused(false);
    setChosen(false);
  }

  function onKey(e: React.KeyboardEvent) {
    const next = nextTab(e.key, target.current, HOW_STEP_COPY.length);
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
      onFocus={(e) => {
        if (!(e.target as HTMLElement).closest("[data-autoplay]")) setFocused(true);
      }}
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
          {HOW_STEP_COPY.map((s, i) => (
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
                <span
                  className={styles.stepFill}
                  data-motion="fill"
                  data-scrub={pinned || undefined}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        {motion && !pinned && (
          <button type="button" className={styles.autoplay} data-autoplay onClick={toggleAutoplay}>
            {playing ? "Pause the steps" : "Play the steps"}
          </button>
        )}
      </Copy>
      <Stage live tone="green" className={styles.howStage} hostClassName={styles.howHost}>
        <TrackSvg trail={LOOP} tone="green" shape="loop" className={styles.loopTrack} />
        <ol className={styles.stations} aria-hidden="true">
          {HOW_STEP_COPY.map((s, k) => (
            <Station key={s.k} k={k} />
          ))}
        </ol>
        <Walker shape="loop" className={styles.loopTrack} />
        <span className={styles.again} aria-hidden="true">
          and round it goes again
        </span>
        {HOW_STEP_COPY.map((s, i) => (
          <StageCard
            key={s.k}
            fx="part"
            rot={-0.4}
            depth={6}
            i={1 + i}
            className={styles.howCaption}
            {...stepAttrs(i, HOW_STEP_COPY.length)}
            role="tabpanel"
            id={`how-panel-${i}`}
            aria-labelledby={`how-tab-${i}`}
            {...panelAttrs(mounted, !inWindow(i, active, pinned), i !== active)}
          >
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </StageCard>
        ))}
        <Sticker rot={7} depth={22} tone="success" className={styles.hSticker}>
          {XP_STICKER}
        </Sticker>
        <Spark className={styles.hSpark} />
        <Chip fact={PASSED} rot={-3} depth={12} speed={50} className={styles.chipA}>
          {PASSED}
        </Chip>
        <Chip fact={`back in ${NEXT_REVIEW}`} rot={2} depth={-8} speed={-36} className={styles.chipB}>
          back in {NEXT_REVIEW}
        </Chip>
      </Stage>
    </Scene>
  );
}
