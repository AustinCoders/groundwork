import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { plural } from "@/lib/format";
import { bookStages, type HomeRound } from "@/lib/homeRounds";
import { STRIPS } from "@/lib/pageFlip";
import { nextTab } from "@/lib/tablist";
import { LeftSheet, RightSheet, roundNumber } from "./BookPages";
import { Chip, Copy, Scene, Spark, Stage, StageCard, Sticker } from "./Stage";
import { stepAttrs, vars } from "./tone";
import { usePin } from "./usePin";
import styles from "./interview.module.css";

const RIDE_BEHIND = 1;
const RIDE_AHEAD = 2;
const BLOCK_THIN = 0.2;
const BLOCK_THICK = 1;
const SPEAK_AFTER_MS = 450;
const ZERO_WIDTH = "\u200b";

function Strip({ i, front, back }: { i: number; front: ReactNode; back: ReactNode }) {
  return (
    <div className={styles.strip} data-strip style={vars({ i })}>
      <div className={styles.clip}>
        <div className={styles.inner} data-veil>
          {front}
        </div>
        <i className={styles.shadeFrom} data-shade aria-hidden="true" />
        <i className={styles.shadeTo} data-shade aria-hidden="true" />
      </div>
      <div className={`${styles.clip} ${styles.clipBack}`}>
        <div className={styles.inner} data-veil>
          {back}
        </div>
        <i className={styles.shadeFrom} data-shade aria-hidden="true" />
        <i className={styles.shadeTo} data-shade aria-hidden="true" />
      </div>
      {i < STRIPS - 1 && <Strip i={i + 1} front={front} back={back} />}
    </div>
  );
}

export function InterviewScene({ head, rounds, total }: { head: ReactNode; rounds: HomeRound[]; total: number }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const sceneRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const target = useRef(0);
  const spoken = useRef(0);
  const flip = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stages = useMemo(() => bookStages(rounds), [rounds]);
  const stageAt = (index: number) =>
    Math.max(
      0,
      stages.findIndex((stage) => stage.id === rounds[index]?.stage)
    );
  const stageIndex = stageAt(active);
  const stage = stages[stageIndex];
  const lastStage = stages[stages.length - 1];

  const roundSpeech = (index: number) => {
    const round = rounds[index];
    return `${roundNumber(index)}, ${round.title}.${round.tests ? ` It tests: ${round.tests}` : ""}`;
  };
  const speak = (text: string) => {
    flip.current = !flip.current;
    setAnnouncement(flip.current ? `${text}${ZERO_WIDTH}` : text);
  };
  const settle = (index: number) => {
    target.current = index;
    setActive(index);
  };
  const { pinned, go } = usePin(sceneRef, (group, item) => {
    const first = stages[group]?.first;
    if (first === undefined) return;
    const index = first + item;
    settle(index);
    if (index === spoken.current) return;
    spoken.current = index;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => speak(roundSpeech(index)), SPEAK_AFTER_MS);
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!stage || rounds.length === 0) return null;

  function chooseStage(k: number) {
    const picked = stages[k];
    if (!picked) return;
    clearTimeout(timer.current);
    spoken.current = picked.first;
    target.current = picked.first;
    if (pinned) go(k, 0);
    else setActive(picked.first);
    speak(
      `${picked.label}: ${plural(picked.items.length, "round")}. ${roundNumber(picked.first)}, ${rounds[picked.first].title}.`
    );
  }

  function onTabKey(e: KeyboardEvent) {
    const next = nextTab(e.key, stageAt(target.current), stages.length);
    if (next < 0) return;
    e.preventDefault();
    chooseStage(next);
    tabs.current[next]?.focus();
  }

  function choose(index: number) {
    clearTimeout(timer.current);
    spoken.current = index;
    target.current = index;
    if (pinned) go(stageAt(index), index - stages[stageAt(index)].first);
    else setActive(index);
    speak(roundSpeech(index));
  }

  const from = pinned ? Math.max(0, active - RIDE_BEHIND) : active;
  const to = pinned ? Math.min(rounds.length - 1, active + RIDE_AHEAD) : active;
  const slots = rounds.slice(from, to + 1).map((round, k) => ({ round, index: from + k }));
  const read = rounds.length > 1 ? active / (rounds.length - 1) : 0;

  return (
    <Scene sceneRef={sceneRef} className={styles.bookScene}>
      <Copy className={styles.bookCopy}>
        {head}
        <Link href="/interview" prefetch={false} className={styles.allRounds}>
          Browse all {total} rounds <span aria-hidden="true">→</span>
        </Link>
      </Copy>
      <Stage live tone="red" className={styles.bookStage} hostClassName={styles.bookHost}>
        <StageCard still depth={3} i={0} className={styles.book}>
          <i className={styles.desk} aria-hidden="true" />
          <i className={styles.contact} aria-hidden="true" />
          <div className={styles.tilt}>
            <div className={styles.cover} aria-hidden="true" />
            <div
              className={styles.spread}
              style={vars({
                tl: BLOCK_THIN + (BLOCK_THICK - BLOCK_THIN) * read,
                tr: BLOCK_THICK - (BLOCK_THICK - BLOCK_THIN) * read,
              })}
            >
              <i className={`${styles.stack} ${styles.stackL}`} aria-hidden="true" />
              <i className={`${styles.stack} ${styles.stackR}`} aria-hidden="true" />
              <i className={`${styles.stack} ${styles.stackB}`} aria-hidden="true" />
              <div id="loop-timeline" role="tabpanel" aria-labelledby={`loop-tab-${stage.id}`} className={styles.pageL}>
                <div key={pinned ? "book" : stage.id} className={styles.swap} data-soft={pinned ? undefined : ""}>
                  <LeftSheet stage={stage} active={active} offer={stage === lastStage} onPick={choose} />
                </div>
              </div>
              <div className={styles.leaves}>
                {slots.map(({ round, index }) => {
                  const next = rounds[index + 1];
                  const nextStage = next ? stages[stageAt(index + 1)] : null;
                  const turning = pinned && index === active && nextStage;
                  const front = (copy: boolean) => (
                    <RightSheet
                      round={round}
                      index={index}
                      stageLabel={stages[stageAt(index)].label}
                      on={index === active}
                      copy={copy}
                    />
                  );
                  const back = nextStage ? (
                    <LeftSheet stage={nextStage} active={index + 1} offer={nextStage === lastStage} />
                  ) : null;
                  return (
                    <div
                      key={round.id}
                      className={styles.slot}
                      {...stepAttrs(index, rounds.length)}
                      data-gone={index < active || undefined}
                      inert={index !== active}
                      style={{ zIndex: rounds.length - index }}
                    >
                      <i className={styles.cast} data-motion="cast" aria-hidden="true" />
                      <i
                        className={`${styles.cast} ${styles.castLeft}`}
                        data-motion="cast"
                        data-cast="left"
                        aria-hidden="true"
                      />
                      <div className={styles.leaf} data-motion="leaf">
                        <div className={styles.flat} data-flat>
                          <div className={styles.leafFace}>{front(false)}</div>
                          {pinned && back && (
                            <div className={`${styles.leafFace} ${styles.leafBack}`} aria-hidden="true">
                              {back}
                            </div>
                          )}
                        </div>
                        {turning && (
                          <div className={styles.strips} aria-hidden="true" style={vars({ n: STRIPS })}>
                            <Strip i={0} front={front(true)} back={back} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <i key={active} className={styles.ribbon} aria-hidden="true" />
              <div className={styles.tabs} role="tablist" aria-label="Interview stages" onKeyDown={onTabKey}>
                {stages.map((s, k) => (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabs.current[k] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`loop-tab-${s.id}`}
                    aria-selected={k === stageIndex}
                    aria-controls="loop-timeline"
                    tabIndex={k === stageIndex ? 0 : -1}
                    className={styles.tab}
                    data-stage-id={s.id}
                    style={{ flexGrow: s.label.length }}
                    onClick={() => chooseStage(k)}
                  >
                    <span className={styles.tabNo}>{String(s.number).padStart(2, "0")}</span>
                    <span className={styles.tabName}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </StageCard>
        <Sticker rot={-5} depth={18} tone="caution" className={styles.bookSticker}>
          tests + traps
        </Sticker>
        <Spark className={styles.bookSpark} />
        <Chip fact={`${rounds.length} core rounds`} rot={-3} depth={12} speed={48} className={styles.chipA}>
          {rounds.length} core rounds
        </Chip>
        <Chip fact="follow-ups" rot={2} depth={-8} speed={-34} className={styles.chipB}>
          follow-ups included
        </Chip>
      </Stage>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </Scene>
  );
}
