import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersMotion } from "@/lib/dom";
import { plural } from "@/lib/format";
import { HOME_STAGES, type HomeRound } from "@/lib/homeRounds";
import { smoothScroll } from "@/lib/scrollFx";
import { Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import { NARROW } from "./useNarrow";
import styles from "./scenes.module.css";

function lineAt(): number {
  return window.matchMedia(NARROW).matches ? 0.72 : 0.5;
}

export function InterviewScene({ head, rounds }: { head: ReactNode; rounds: HomeRound[] }) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const stageTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const settling = useRef(false);
  const settleTimer = useRef(0);
  const stageId = rounds[active]?.stage ?? HOME_STAGES[0].id;
  const stages = HOME_STAGES.map((stage) => ({
    ...stage,
    first: rounds.findIndex((round) => round.stage === stage.id),
    count: rounds.filter((round) => round.stage === stage.id).length,
  })).filter((stage) => stage.count > 0);
  const stageIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === stageId)
  );
  const lastStage = stages[stages.length - 1]?.id;
  const peeks = [1, 2]
    .map((step) => rounds[(active + step) % rounds.length])
    .filter((round) => round && round !== rounds[active]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const narrow = window.matchMedia(NARROW);
    let observer: IntersectionObserver | null = null;
    const observe = () => {
      observer?.disconnect();
      const line = lineAt();
      let initial = true;
      observer = new IntersectionObserver(
        (entries) => {
          if (initial) {
            initial = false;
            return;
          }
          if (settling.current) return;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (Number.isFinite(index)) setActive(index);
          }
        },
        { rootMargin: `-${(line * 100 - 1.5).toFixed(1)}% 0px -${((1 - line) * 100 - 1.5).toFixed(1)}% 0px` }
      );
      rows.current.forEach((row) => row && observer?.observe(row));
    };
    observe();
    narrow.addEventListener("change", observe);
    return () => {
      narrow.removeEventListener("change", observe);
      observer?.disconnect();
    };
  }, [stageId]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  function pickAtLine() {
    const y = window.innerHeight * lineAt();
    const index = rows.current.findIndex((row) => {
      const rect = row?.getBoundingClientRect();
      return rect !== undefined && rect.top <= y && rect.bottom >= y;
    });
    if (index >= 0) setActive(index);
  }

  function chooseStage(first: number) {
    const round = rounds[first];
    const stage = stages.find((s) => s.id === round.stage);
    setActive(first);
    setAnnouncement(
      `${stage?.label}: ${plural(stage?.count ?? 0, "round")}. Round ${String(first + 1).padStart(2, "0")}, ${round.title}.`
    );
  }

  function onStageKey(e: React.KeyboardEvent) {
    const count = stages.length;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (stageIndex + 1) % count
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (stageIndex - 1 + count) % count
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? count - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    chooseStage(stages[next].first);
    stageTabs.current[next]?.focus();
  }

  function choose(index: number) {
    const round = rounds[index];
    const row = rows.current[index];
    setActive(index);
    setAnnouncement(
      `Round ${String(index + 1).padStart(2, "0")}, ${round.title}.${round.tests ? ` It tests: ${round.tests}` : ""}`
    );
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const instant = !prefersMotion();
    settling.current = true;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(
      () => {
        settling.current = false;
        pickAtLine();
      },
      instant ? 200 : 1500
    );
    smoothScroll.to(Math.max(0, rect.top + window.scrollY + rect.height / 2 - window.innerHeight * lineAt()), instant);
  }

  const nextStage = stages[stageIndex + 1];

  return (
    <Scene>
      <Copy className={styles.loopCopy}>
        {head}
        <div className={styles.stages} role="tablist" aria-label="Interview stages" onKeyDown={onStageKey}>
          {stages.map((stage, k) => (
            <button
              key={stage.id}
              ref={(el) => {
                stageTabs.current[k] = el;
              }}
              type="button"
              role="tab"
              id={`loop-tab-${stage.id}`}
              aria-selected={stage.id === stageId}
              aria-controls="loop-timeline"
              tabIndex={stage.id === stageId ? 0 : -1}
              className={styles.stageBtn}
              onClick={() => chooseStage(stage.first)}
            >
              <span className={styles.stageNo}>{String(k + 1).padStart(2, "0")}</span>
              <span className={styles.stageName}>{stage.label}</span>
              <span className={styles.stageCount}>{plural(stage.count, "round")}</span>
            </button>
          ))}
        </div>
        <div
          id="loop-timeline"
          role="tabpanel"
          aria-labelledby={`loop-tab-${stageId}`}
          className={styles.timelinePanel}
        >
          <ol className={styles.timeline} aria-label={`${stages[stageIndex]?.label}: interview rounds in order`}>
            {rounds.map((round, i) =>
              round.stage !== stageId ? null : (
                <li
                  key={round.id}
                  className={styles.step}
                  data-state={i < active ? "past" : i === active ? "active" : "next"}
                >
                  <button
                    type="button"
                    className={styles.stepBtn}
                    ref={(el) => {
                      rows.current[i] = el;
                    }}
                    data-index={i}
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => choose(i)}
                  >
                    <span className={styles.node} aria-hidden="true">
                      {round.code}
                    </span>
                    <span className={styles.stepText}>
                      <span className={styles.stepNum}>{`Round ${String(i + 1).padStart(2, "0")}`}</span>
                      <span className={styles.stepTitle}>{round.title}</span>
                    </span>
                  </button>
                </li>
              )
            )}
            {stageId === lastStage && (
              <li className={`${styles.step} ${styles.offerStep}`} data-state="next">
                <span className={styles.stepRow}>
                  <span className={styles.node} aria-hidden="true">
                    🎉
                  </span>
                  <span className={styles.stepText}>
                    <span className={styles.stepNum}>and then</span>
                    <span className={styles.stepTitle}>The offer</span>
                  </span>
                </span>
              </li>
            )}
          </ol>
          {nextStage && (
            <button type="button" className={styles.nextStage} onClick={() => chooseStage(nextStage.first)}>
              <span>Next stage</span>
              <b>{nextStage.label} →</b>
            </button>
          )}
        </div>
      </Copy>
      <Stage live sticky tone="red" className={styles.loopStage} hostClassName={styles.loopHost}>
        <StageCard still rot={-1.4} depth={5} i={0} className={styles.previewWrap}>
          {peeks.map((round, k) => (
            <span key={round.id} className={styles.peek} data-card data-peek={k} aria-hidden="true">
              {k === 0 && (
                <>
                  <span className={styles.peekCode}>{round.code}</span>
                  <span className={styles.peekTitle}>next: {round.title}</span>
                </>
              )}
            </span>
          ))}
          <div className={styles.previewSurface}>
            <Tape rot={-3} />
            <div role="region" aria-labelledby="loop-preview-title" className={styles.previewRegion}>
              <div className={styles.previewStack}>
                {rounds.map((round, i) => (
                  <div
                    key={round.id}
                    className={styles.previewBody}
                    data-active={i === active || undefined}
                    aria-hidden={i === active ? undefined : true}
                    hidden={round.stage !== stageId}
                  >
                    <p className={styles.previewKicker}>{`Round ${String(i + 1).padStart(2, "0")} · ${round.code}`}</p>
                    <h3 id={i === active ? "loop-preview-title" : undefined} className={styles.previewTitle}>
                      {round.title}
                    </h3>
                    {round.tests && (
                      <div className={styles.previewBlock}>
                        <p className={styles.previewLabel}>What they are really testing</p>
                        <p className={styles.previewText}>{round.tests}</p>
                      </div>
                    )}
                    {round.wrong && (
                      <div className={`${styles.previewBlock} ${styles.previewWrong}`}>
                        <p className={styles.previewLabel}>The answer that loses the room</p>
                        <p className={styles.previewText}>{round.wrong}</p>
                      </div>
                    )}
                    {round.sample && (
                      <div className={styles.previewBlock}>
                        <p className={styles.previewLabel}>A question you will get</p>
                        <p className={styles.previewSample}>“{round.sample}”</p>
                      </div>
                    )}
                    {round.followUp && (
                      <div className={`${styles.previewBlock} ${styles.previewFollow}`}>
                        <p className={styles.previewLabel}>and the follow-up they push with</p>
                        <p className={styles.followBubble}>{round.followUp}</p>
                      </div>
                    )}
                    <Link
                      href={round.href}
                      prefetch={false}
                      tabIndex={i === active ? undefined : -1}
                      className={styles.previewLink}
                    >
                      Read this round <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StageCard>
        <Sticker rot={7} depth={22} tone="caution" className={styles.loopSticker}>
          tests + traps
        </Sticker>
        <Note arrow="ur" rot={-3} depth={16} className={styles.loopNote}>
          the follow-up they push with next
        </Note>
        <Spark className={styles.loopSpark} />
      </Stage>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </Scene>
  );
}
