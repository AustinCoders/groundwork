import Link from "next/link";
import { useId, type CSSProperties, type ReactNode } from "react";
import j from "./journey.module.css";

const LEFT = 36;
const RIGHT = 64;

type Pair = [number, number];

export function windingPath(count: number): string {
  const points: Pair[] = [[50, 0]];
  for (let i = 0; i < count; i++) points.push([i % 2 === 0 ? LEFT : RIGHT, ((i + 0.5) / count) * 100]);
  points.push([50, 100]);
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    const h = (by - ay) * 0.55;
    d += ` C${ax} ${ay + h} ${bx} ${by - h} ${bx} ${by}`;
  }
  return d;
}

export type StopState = "done" | "next" | "todo" | "soon";

export function Journey({
  count,
  slot,
  walked = 0,
  label,
  id,
  children,
}: {
  count: number;
  slot: number;
  walked?: number;
  label: string;
  id?: string;
  children: ReactNode;
}) {
  const mask = useId();
  const d = windingPath(count);
  return (
    <div className={j.journeyWrap} style={{ "--slot": `${slot}px`, "--n": count } as CSSProperties}>
      <svg className={j.trail} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
            <path className={j.reveal} d={d} pathLength={1} style={{ strokeDasharray: `${walked} 1` }} />
          </mask>
        </defs>
        <path className={j.track} d={d} />
        <path className={j.walked} d={d} mask={`url(#${mask})`} />
      </svg>
      <ol className={j.journey} aria-label={label} id={id}>
        {children}
      </ol>
    </div>
  );
}

export function JourneyStop({
  state = "todo",
  id,
  data,
  sticker,
  children,
}: {
  state?: StopState;
  id?: string;
  data?: Record<string, string | undefined>;
  sticker?: string;
  children: ReactNode;
}) {
  return (
    <li className={j.stop} data-state={state} id={id} {...data}>
      <span className={j.pole} aria-hidden="true">
        <i />
      </span>
      <div className={j.card}>
        {sticker && (
          <span className={j.here} aria-hidden="true">
            {sticker}
          </span>
        )}
        {children}
      </div>
    </li>
  );
}

export function StopHead({
  code,
  title,
  sub,
  href,
  rawTitle,
  rawSub,
  end,
}: {
  code?: string;
  title: string;
  sub?: string;
  href?: string | null;
  rawTitle?: boolean;
  rawSub?: boolean;
  end?: ReactNode;
}) {
  const titleProps = rawTitle ? { dangerouslySetInnerHTML: { __html: title } } : { children: title };
  const subProps = rawSub ? { dangerouslySetInnerHTML: { __html: sub ?? "" } } : { children: sub };
  const name = <span className={j.name} {...titleProps} />;
  return (
    <div className={j.head}>
      {code && (
        <span className={j.mark} aria-hidden="true">
          {code}
        </span>
      )}
      <div className={j.text}>
        {href ? (
          <Link className={j.link} href={href} prefetch={false}>
            {name}
          </Link>
        ) : (
          name
        )}
        {sub && <span className={j.sub} {...subProps} />}
      </div>
      {end && <div className={j.end}>{end}</div>}
    </div>
  );
}

export function Station({
  no,
  name,
  quote,
  blurb,
  chips,
  mark,
  id,
}: {
  no: string;
  name: string;
  quote?: string;
  blurb?: string;
  chips?: string[];
  mark?: string;
  id?: string;
}) {
  return (
    <div className={j.station}>
      <span className={j.stationNo} aria-hidden="true">
        {no}
      </span>
      <div className={j.stationText}>
        <h3 className={j.stationName} id={id}>
          {name}
        </h3>
        {quote && (
          <p className={j.stationQuote}>
            <span>&ldquo;{quote}&rdquo;</span>
          </p>
        )}
        {blurb && <p className={j.stationBlurb}>{blurb}</p>}
      </div>
      <div className={j.stationAside}>
        {mark && (
          <span className={j.yours} aria-hidden="true">
            {mark}
          </span>
        )}
        {chips && (
          <p className={j.stationChips}>
            {chips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

export function Checkpoint({ children }: { children: ReactNode }) {
  return (
    <p className={j.checkpoint}>
      <span className={j.checkpointLabel}>Checkpoint</span>
      {children}
    </p>
  );
}

export function Check() {
  return (
    <span className={j.check} aria-hidden="true">
      ✓
    </span>
  );
}

export function SoonTag({ children = "soon" }: { children?: ReactNode }) {
  return <span className={j.soonTag}>{children}</span>;
}
