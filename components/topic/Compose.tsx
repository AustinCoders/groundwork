import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import c from "./compose.module.css";

export type Layout = "trio" | "rail" | "duo" | "quad" | "loop" | "stack";
export type Slot = "a" | "b" | "c" | "d";
export type Tone = "paper" | "note" | "alert" | "draft" | "ghost";
export type Tilt = -1 | 0 | 1;
export type TagTone = "success" | "primary" | "info" | "caution";
export type Corner = "top" | "bottom";
export type JoinTo = "right" | "left" | "down";

export const TILT_DEGREES = 1.2;
export const TAPE_DEGREES = -2;

type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

function join(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export function Compose({
  layout,
  live,
  fixed,
  className,
  style,
  children,
}: {
  layout: Layout;
  live?: boolean;
  fixed?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={join(c.compose, className)}
      data-stage
      data-layout={layout}
      data-fixed={fixed || undefined}
      aria-hidden={live ? undefined : true}
      style={style}
    >
      {children}
    </div>
  );
}

export function Card({
  at,
  tone = "paper",
  tilt = 0,
  taped,
  as,
  decor,
  extra,
  className,
  style,
  children,
  ...rest
}: {
  at?: Slot;
  tone?: Tone;
  tilt?: Tilt;
  taped?: boolean;
  as?: ElementType;
  decor?: boolean;
  extra?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "style" | "children"> &
  DataAttributes) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      aria-hidden={decor ? true : undefined}
      {...rest}
      className={join(c.card, className)}
      data-card
      data-at={at}
      data-tone={tone}
      data-tilt={tilt}
      data-extra={extra || undefined}
      style={{ "--tilt": tilt, ...style } as CSSProperties}
    >
      {taped && <span className={c.tape} data-tape aria-hidden="true" />}
      {children}
    </Tag>
  );
}

export function Column({ at, children }: { at: Slot; children: ReactNode }) {
  return (
    <div className={c.column} data-at={at}>
      {children}
    </div>
  );
}

export function Deck({ at, children }: { at: Slot; children: ReactNode }) {
  return (
    <div className={c.deck} data-at={at}>
      {children}
    </div>
  );
}

export function Tag({
  tone,
  corner = "top",
  className,
  children,
}: {
  tone?: TagTone;
  corner?: Corner;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={join(c.tag, className)} data-sticker data-tone={tone} data-corner={corner} aria-hidden="true">
      {children}
    </span>
  );
}

export function Remark({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={join(c.remark, className)} data-note aria-hidden="true">
      <svg className={c.arrow} data-arrow viewBox="0 0 36 32" focusable="false">
        <path d="M30 30 C 34 18, 26 9, 15 3" />
        <path d="M20.5 10.5 L14 2.5 L24 2" />
      </svg>
      <span className={c.remarkText}>{children}</span>
    </span>
  );
}

export function Join({ to }: { to: JoinTo }) {
  return <span className={c.join} data-join={to} aria-hidden="true" />;
}
