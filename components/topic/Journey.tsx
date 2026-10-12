import Link from "next/link";
import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import j from "./journey.module.css";

type LinkKind = "lead" | "link" | "tail";

const CURVES: Record<LinkKind, string> = {
  lead: "M50 0 C50 55 36 45 36 100",
  link: "M36 0 C36 55 64 45 64 100",
  tail: "M36 0 C36 55 50 45 50 100",
};

export type StopState = "done" | "next" | "todo" | "soon";

function TrailLink({ kind, row, flipped, walked }: { kind: LinkKind; row: number; flipped: boolean; walked: boolean }) {
  return (
    <li
      className={j.leg}
      aria-hidden="true"
      data-kind={kind}
      data-flipped={flipped ? "true" : undefined}
      data-walked={walked ? "true" : undefined}
      style={{ gridRow: `${row} / span 2` }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <path className={j.track} d={CURVES[kind]} />
        <path className={j.walked} d={CURVES[kind]} />
      </svg>
    </li>
  );
}

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
  const stops = Children.toArray(children).filter(isValidElement) as ReactElement<{ index?: number }>[];
  const walkedStops = walked > 0 ? Math.round(walked * count) : 0;
  const last = stops.length - 1;
  const trail: ReactNode[] = [];
  if (last >= 0) trail.push(<TrailLink key="lead" kind="lead" row={1} flipped={false} walked={walkedStops >= 1} />);
  stops.forEach((stop, i) => {
    trail.push(cloneElement(stop, { index: i }));
    const isTail = i === last;
    trail.push(
      <TrailLink
        key={`link-${i}`}
        kind={isTail ? "tail" : "link"}
        row={isTail ? 2 * i + 1 : 2 * i + 2}
        flipped={i % 2 === 1}
        walked={walkedStops >= i + 1}
      />
    );
  });
  return (
    <ol className={j.journey} aria-label={label} id={id} style={{ "--slot": `${slot}px` } as CSSProperties}>
      {trail}
    </ol>
  );
}

export function JourneyStop({
  state = "todo",
  id,
  data,
  sticker,
  index = 0,
  children,
}: {
  state?: StopState;
  id?: string;
  data?: Record<string, string | undefined>;
  sticker?: string;
  index?: number;
  children: ReactNode;
}) {
  return (
    <li
      className={j.stop}
      data-state={state}
      data-side={index % 2 === 0 ? "left" : "right"}
      id={id}
      style={{ gridRow: `${2 * index + 1} / span 2` }}
      {...data}
    >
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
