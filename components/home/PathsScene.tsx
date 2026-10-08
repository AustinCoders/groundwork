import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { formatSpan, plural } from "@/lib/format";
import { Chip, Copy, Note, Scene, Spark, Stage, StageCard, Sticker } from "./Stage";
import { buildTrail, TRAIL_SPOTS } from "@/lib/trail";
import { TrackSvg, Walker } from "./Track";
import { accent, inWindow, stepAttrs, vars } from "./tone";
import type { ShelfCard } from "./types";
import { usePin } from "./usePin";
import styles from "./paths.module.css";

type JourneyStep = { topic: string } | { label: string; mark: string; href: string; sub: string; tone: string };

const PATHS: {
  tag: string;
  title: string;
  pain: string;
  tone: string;
  steps: JourneyStep[];
  gains: string[];
}[] = [
  {
    tag: "Frontend developer",
    title: "Build interfaces, then explain them",
    pain: "You can make a page work, but the ideas underneath still feel like magic, and a live widget round scares you.",
    tone: "blue",
    steps: [
      { topic: "js" },
      { topic: "typescript" },
      { topic: "react" },
      { topic: "nextjs" },
      { label: "The frontend round", mark: "R4", href: "/interview/r4fe", sub: "interview round", tone: "red" },
    ],
    gains: [
      "Explain what your code does before it runs, line by line",
      "Say exactly why a component re-rendered, and stop it",
      "Build a working widget live, under a clock",
    ],
  },
  {
    tag: "Interview prep",
    title: "Patterns first, then every round",
    pain: "You are good at the work and out of practice at the interview: puzzles with no theory, and rounds nobody explained.",
    tone: "purple",
    steps: [
      { topic: "dsa" },
      { label: "Online assessment", mark: "OA", href: "/interview/r1oa", sub: "interview round", tone: "red" },
      { label: "Machine coding", mark: "R2", href: "/interview/r2", sub: "interview round", tone: "red" },
      { topic: "system-design" },
      { label: "Behavioural", mark: "R11", href: "/interview/r11", sub: "interview round", tone: "red" },
    ],
    gains: [
      "Solve array and string problems with a pattern, not luck",
      "Walk into the online assessment knowing its format",
      "Talk through a cache or a queue without hand-waving",
    ],
  },
  {
    tag: "Senior and system design",
    title: "Reason about the whole system",
    pain: "The questions stop being about syntax. They are about trade-offs, failure, and proving you can lead without the title.",
    tone: "orange",
    steps: [
      { topic: "react" },
      { topic: "system-design" },
      { topic: "databases" },
      { label: "Distributed systems", mark: "S2", href: "/interview/s2", sub: "senior round", tone: "red" },
      { label: "Staff behavioural", mark: "S4", href: "/interview/s4", sub: "senior round", tone: "red" },
    ],
    gains: [
      "Reason about consensus, partitions and failure out loud",
      "Explain the runtime under React, not just the API",
      "Tell staff-level stories that survive the follow-up",
    ],
  },
];

export const PATH_COUNT = PATHS.length;

interface Stop {
  key: string;
  name: string;
  mark: string;
  tone: string;
  sub: string;
  meta: string;
  href: string | null;
}

export function PathsScene({ head, ready, soon }: { head: ReactNode; ready: ShelfCard[]; soon: ShelfCard[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const { pinned, go } = usePin(sceneRef, (step) => setActive(step));
  const byId = new Map([...ready, ...soon].map((t) => [t.id, t]));
  const writtenIds = new Set(ready.map((t) => t.id));

  function stopsOf(steps: JourneyStep[]): Stop[] {
    return steps.flatMap((step): Stop[] => {
      if (!("topic" in step))
        return [
          {
            key: step.href,
            name: step.label,
            mark: step.mark,
            tone: step.tone,
            sub: step.sub,
            meta: "what it tests, the trap, the follow-up",
            href: step.href,
          },
        ];
      const t = byId.get(step.topic);
      if (!t) return [];
      const written = writtenIds.has(t.id);
      return [
        {
          key: t.id,
          name: t.name,
          mark: t.mark,
          tone: t.accent,
          sub: written ? plural(t.chapters, "chapter") : "soon",
          meta: written
            ? [t.exercises > 0 ? plural(t.exercises, "exercise") : "", formatSpan(t.minutes)]
                .filter(Boolean)
                .join(" · ")
            : "laid out, chapters on the way",
          href: written ? t.href : null,
        },
      ];
    });
  }

  function choose(next: number) {
    if (pinned) go(next, 0);
    else setActive(next);
  }

  function onKey(e: React.KeyboardEvent) {
    const count = PATHS.length;
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (active + 1) % count
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
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
    <Scene side="left" sceneRef={sceneRef} className={styles.pathsScene}>
      <Copy className={styles.pathsHead}>
        {head}
        <div className={styles.pathTabs} role="tablist" aria-label="Where are you now?" onKeyDown={onKey}>
          {PATHS.map((p, i) => (
            <button
              key={p.tag}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`path-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`path-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              className={styles.pathTab}
              style={accent(p.tone)}
              onClick={() => choose(i)}
            >
              <span className={styles.pathNo}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.pathName}>{p.tag}</span>
            </button>
          ))}
        </div>
      </Copy>
      {PATHS.map((p, i) => {
        const stops = stopsOf(p.steps);
        const trail = buildTrail(stops.length);
        const first = stops.find((stop) => stop.href);
        const lead = stops.find((stop) => stop.href && stop.sub.endsWith("chapters"));
        return (
          <div
            key={p.tag}
            className={styles.pathPanel}
            role="tabpanel"
            id={`path-panel-${i}`}
            aria-labelledby={`path-tab-${i}`}
            style={accent(p.tone)}
            {...stepAttrs(i, PATHS.length)}
            hidden={!inWindow(i, active, pinned)}
            inert={i !== active || undefined}
            aria-hidden={i !== active || undefined}
          >
            <div className={styles.pathCopy} data-fx="part">
              <h3 className={styles.pathTitle}>{p.title}</h3>
              <p className={styles.pathPain}>{p.pain}</p>
              <div className={styles.pathGains}>
                <p className={styles.label}>After this path you can</p>
                <ul className={styles.gains}>
                  {p.gains.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
              {first?.href && (
                <Link href={first.href} prefetch={false} className={styles.pathStart}>
                  Start this path <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
            <Stage live tone={p.tone} className={styles.pathsStage} hostClassName={styles.pathsHost} hostFx="part">
              <TrackSvg trail={trail} tone={p.tone} className={styles.pathTrack} />
              <ol className={styles.journey} aria-label={`${p.tag}: the journey`}>
                {stops.map((stop, k) => {
                  const spot = TRAIL_SPOTS[k];
                  const body = (
                    <>
                      <span className={styles.stopNo} aria-hidden="true">
                        {String(k + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.stopMark} style={accent(stop.tone)} aria-hidden="true">
                        {stop.mark}
                      </span>
                      <span className={styles.stopName}>{stop.name}</span>
                      <span className={styles.stopSub} data-soon={!stop.href || undefined}>
                        {stop.sub}
                      </span>
                      <span className={styles.stopMeta}>{stop.meta}</span>
                    </>
                  );
                  return (
                    <li
                      key={stop.key}
                      className={styles.stopItem}
                      data-stop={k + 1}
                      data-side={spot.x < 50 ? "left" : "right"}
                      data-soon={!stop.href || undefined}
                      data-fx="milestone"
                      data-fx-at={trail.at[k]}
                      style={vars({ sx: spot.x, sy: spot.y })}
                    >
                      <span className={styles.pole} aria-hidden="true">
                        <i />
                      </span>
                      <StageCard
                        still
                        i={k}
                        rot={k % 2 ? 1.6 : -1.6}
                        depth={k % 2 ? -6 : 7}
                        className={styles.stopCard}
                      >
                        {stop.href ? (
                          <Link href={stop.href} prefetch={false} className={styles.stop}>
                            {body}
                          </Link>
                        ) : (
                          <span className={styles.stop}>{body}</span>
                        )}
                      </StageCard>
                    </li>
                  );
                })}
              </ol>
              <Walker count={stops.length} className={styles.pathTrack} />
              <span className={styles.signpost} aria-hidden="true">
                <svg viewBox="0 0 120 80" focusable="false">
                  <path d="M18 78 V6" />
                  <path d="M18 8 H110 L118 19 L110 30 H18 Z" />
                </svg>
                <b>{stops[0]?.name}</b>
              </span>
              <svg className={styles.tree} viewBox="0 0 40 56" aria-hidden="true" focusable="false">
                <path d="M20 54 V34" />
                <path d="M20 4 L34 22 H26 L36 36 H4 L14 22 H6 Z" />
              </svg>
              <Sticker rot={-6} depth={20} tone="success" className={styles.hereFlag}>
                ⚑ you are here
              </Sticker>
              <Sticker rot={5} depth={22} tone="primary" className={styles.finishFlag}>
                ★ interview ready
              </Sticker>
              <Note arrow="ur" rot={-3} depth={16} className={styles.pathsNote}>
                a few topics, then the rounds
              </Note>
              <Spark className={styles.pathsSpark} />
              {lead && (
                <>
                  <Chip fact={lead.sub} rot={-3} depth={12} speed={48} className={styles.chipA}>
                    {lead.sub}
                  </Chip>
                  <Chip fact={lead.meta.split(" · ")[0]} rot={2} depth={-8} speed={-34} className={styles.chipB}>
                    {lead.meta.split(" · ")[0]}
                  </Chip>
                </>
              )}
              <Chip fact="interview round" rot={-2} depth={18} speed={64} className={styles.chipC}>
                interview rounds inside
              </Chip>
            </Stage>
          </div>
        );
      })}
    </Scene>
  );
}
