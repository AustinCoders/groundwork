import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { formatSpan, plural } from "@/lib/format";
import { HOME_PATHS, leadStop, PATH_COUNT, pathStops, startOf, type Stop } from "@/lib/homePaths";
import { nextTab } from "@/lib/tablist";
import { Chip, Copy, Note, Scene, Spark, Stage, StageCard, Sticker } from "./Stage";
import { buildTrail, TRAIL_SPOTS } from "@/lib/trail";
import { TrackSvg, Walker } from "./Track";
import { accent, inWindow, panelAttrs, stepAttrs, vars } from "./tone";
import { useMounted } from "./useMounted";
import type { ShelfCard } from "./types";
import { usePin } from "./usePin";
import styles from "./paths.module.css";

const leadFact = (stop: Stop) => (stop.exercises > 0 ? plural(stop.exercises, "exercise") : formatSpan(stop.minutes));

export function PathsScene({ head, ready, soon }: { head: ReactNode; ready: ShelfCard[]; soon: ShelfCard[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const target = useRef(0);
  const { pinned, go } = usePin(sceneRef, (step) => {
    target.current = step;
    setActive(step);
  });

  function choose(next: number) {
    target.current = next;
    if (pinned) go(next, 0);
    else setActive(next);
  }

  function onKey(e: React.KeyboardEvent) {
    const next = nextTab(e.key, target.current, PATH_COUNT);
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
          {HOME_PATHS.map((p, i) => (
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
      {HOME_PATHS.map((p, i) => {
        const stops = pathStops(p.steps, ready, soon);
        const trail = buildTrail(stops.length);
        const start = startOf(stops);
        const lead = leadStop(stops);
        return (
          <div
            key={p.tag}
            className={styles.pathPanel}
            role="tabpanel"
            id={`path-panel-${i}`}
            aria-labelledby={`path-tab-${i}`}
            style={accent(p.tone)}
            {...stepAttrs(i, PATH_COUNT)}
            {...panelAttrs(mounted, !inWindow(i, active, pinned), i !== active)}
          >
            <div className={styles.pathCopy} data-motion="part">
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
              {start?.stop.href && (
                <Link href={start.stop.href} prefetch={false} className={styles.pathStart}>
                  {start.label} <span aria-hidden="true">→</span>
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
                      data-motion="milestone"
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
                  <Chip fact={leadFact(lead)} rot={2} depth={-8} speed={-34} className={styles.chipB}>
                    {leadFact(lead)}
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
