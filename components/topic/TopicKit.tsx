import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import { accentVar } from "@/lib/accent";
import t from "./topicKit.module.css";

export { t as topicKit };

function join(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export function TopicPage({ accent, id, children }: { accent: string; id?: string; children: ReactNode }) {
  return (
    <div className={t.page} id={id} style={{ "--accent": accentVar(accent) } as CSSProperties}>
      {children}
    </div>
  );
}

export function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={join(t.wrap, className)}>{children}</div>;
}

export function Band({
  no,
  id,
  sectionId,
  label,
  title,
  sub,
  count,
  subId,
  children,
}: {
  no: string;
  id: string;
  sectionId?: string;
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  count?: string;
  subId?: string;
  children?: ReactNode;
}) {
  return (
    <section className={t.band} aria-labelledby={id} id={sectionId}>
      <Wrap>
        <div className={t.bandHead}>
          <Eyebrow no={no} count={count} as="p">
            {label}
          </Eyebrow>
          <h2 className={t.h2} id={id}>
            {title}
          </h2>
          {sub && (
            <p className={t.sub} id={subId}>
              {sub}
            </p>
          )}
        </div>
        {children}
      </Wrap>
    </section>
  );
}

export function Kicker({
  mark,
  dashed,
  id,
  children,
}: {
  mark?: string;
  dashed?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <p className={join(t.kicker, dashed && t.kickerDashed)} id={id}>
      {mark && (
        <span className={t.kickerMark} aria-hidden="true">
          {mark}
        </span>
      )}
      <span>{children}</span>
    </p>
  );
}

export function Heading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h1 className={t.h1} id={id}>
      {children}
    </h1>
  );
}

export function Underlined({ children }: { children: ReactNode }) {
  return (
    <span className={t.underlined}>
      {children}
      <svg className={t.swoosh} viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 16 C 90 4, 190 22, 280 10 S 380 8, 396 14" />
      </svg>
    </span>
  );
}

export function Lead({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className={t.lead} id={id}>
      {children}
    </p>
  );
}

export function Tagline({ children }: { children: ReactNode }) {
  return <p className={t.tagline}>{children}</p>;
}

export function HandNote({ children }: { children: ReactNode }) {
  return <p className={t.handNote}>{children}</p>;
}

export function Highlight({ children }: { children: ReactNode }) {
  return <span className={t.highlight}>{children}</span>;
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className={t.actions}>{children}</div>;
}

export function Button({
  href,
  ghost,
  id,
  onClick,
  children,
}: {
  href: string;
  ghost?: boolean;
  id?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link className={ghost ? t.btnGhost : t.btn} href={href} id={id} prefetch={false} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Facts({ items }: { items: { value: string | number; label: string }[] }) {
  return (
    <dl className={t.facts}>
      {items.map((item) => (
        <div className={t.fact} key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <div className={t.chips}>{children}</div>;
}

export function Notes({ notes, no }: { notes: string[]; no: string }) {
  return (
    <Band no={no} id="honest-notes" label="Straight talk" title="Three honest notes">
      <ul className={t.notes} id="curriculum-notes">
        {notes.map((note, i) => (
          <li key={i} className={t.note} style={{ "--tilt": `${[-1.4, 1, -0.6][i % 3]}deg` } as CSSProperties}>
            <span className={t.noteTape} aria-hidden="true" />
            <span className={t.noteNo} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p>{note}</p>
          </li>
        ))}
      </ul>
    </Band>
  );
}

export function Foot({ children }: { children: ReactNode }) {
  return (
    <Wrap>
      <footer className={t.foot}>{children}</footer>
    </Wrap>
  );
}

export function FootLink({ href, id, children }: { href: string; id?: string; children: ReactNode }) {
  return (
    <Link className={t.link} href={href} id={id}>
      {children}
    </Link>
  );
}

export function List({ columns, id, children }: { columns?: boolean; id?: string; children: ReactNode }) {
  return (
    <ul className={join(t.list, columns && t.twoCol)} id={id}>
      {children}
    </ul>
  );
}

export function Row({
  code,
  title,
  sub,
  href,
  soon,
  done,
  end,
}: {
  code?: string;
  title: string;
  sub?: string;
  href?: string | null;
  soon?: boolean;
  done?: boolean;
  end?: ReactNode;
}) {
  const body = (
    <>
      {code && <span className={join(kit.code, t.rowCode)}>{code}</span>}
      <span className={t.rowText}>
        <span className={kit.title}>{title}</span>
        {sub && <span className={t.rowSub}>{sub}</span>}
      </span>
      {(end || soon || done) && (
        <span className={t.rowEnd}>
          {end}
          {soon && <span className={t.soon}>soon</span>}
          {done && (
            <span className={t.check} aria-hidden="true">
              ✓
            </span>
          )}
        </span>
      )}
    </>
  );
  const className = join(kit.row, t.rowItem, soon && t.rowSoon);
  return (
    <li>
      {href ? (
        <Link className={className} href={href} prefetch={false}>
          {body}
        </Link>
      ) : (
        <span className={className} data-static="">
          {body}
        </span>
      )}
    </li>
  );
}

export function CardKicker({ children }: { children: ReactNode }) {
  return <p className={t.cardKicker}>{children}</p>;
}

export function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className={t.ring} style={{ "--sweep": pct } as CSSProperties} aria-hidden="true">
      <span className={t.ringFace}>
        <strong>{done}</strong>
        <small>of {total}</small>
      </span>
    </div>
  );
}

export function ProgressMeter({
  done,
  total,
  label,
  fillId,
  labelId,
}: {
  done: number;
  total: number;
  label: string;
  fillId?: string;
  labelId?: string;
}) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className={t.meter}>
      <div className={t.meterTrack}>
        <div className={t.meterFill} id={fillId} style={{ width: `${pct}%` }} />
      </div>
      <span className={t.meterLabel} id={labelId}>
        {label}
      </span>
    </div>
  );
}

export function ToggleGroup({ label, lead, children }: { label: string; lead?: string; children: ReactNode }) {
  return (
    <div className={t.toggles} role="group" aria-label={label}>
      {lead && <span>{lead}</span>}
      {children}
    </div>
  );
}

export function Toggle({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={t.toggle} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
