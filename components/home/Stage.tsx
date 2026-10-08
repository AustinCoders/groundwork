import type { CSSProperties, ElementType, HTMLAttributes, ReactNode, Ref } from "react";
import { accent, vars } from "./tone";
import { useStage } from "./useStage";
import styles from "./stage.module.css";

export function Scene({
  flip,
  className,
  sceneRef,
  children,
  ...rest
}: {
  flip?: boolean;
  className?: string;
  sceneRef?: Ref<HTMLDivElement>;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      ref={sceneRef}
      className={className ? `${styles.scene} ${className}` : styles.scene}
      data-flip={flip || undefined}
    >
      {children}
    </div>
  );
}

export function Copy({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={className ? `${styles.copy} ${className}` : styles.copy}>{children}</div>;
}

export function Stage({
  live,
  tone,
  className,
  hostClassName,
  height,
  sticky,
  children,
}: {
  live?: boolean;
  tone?: string;
  className?: string;
  hostClassName?: string;
  height?: string;
  sticky?: boolean;
  children: ReactNode;
}) {
  const ref = useStage<HTMLDivElement>();
  return (
    <div className={hostClassName ? `${styles.host} ${hostClassName}` : styles.host} data-sticky={sticky || undefined}>
      <div
        ref={ref}
        className={className ? `${styles.stage} ${className}` : styles.stage}
        data-stage
        aria-hidden={live ? undefined : true}
        style={{ ...(tone ? accent(tone) : {}), ...(height ? { "--stage-h": height } : {}) } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}

export function StageCard({
  as,
  rot = 0,
  depth = 0,
  i = 0,
  extra,
  decor,
  still,
  className,
  style,
  children,
  ...rest
}: {
  as?: ElementType;
  rot?: number;
  depth?: number;
  i?: number;
  extra?: boolean;
  decor?: boolean;
  still?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      {...rest}
      className={className ? `${styles.card} ${className}` : styles.card}
      data-card
      data-extra={extra || undefined}
      data-still={still || undefined}
      aria-hidden={decor ? true : undefined}
      style={{ ...vars({ rot, depth, i, dir: i % 2 ? -1 : 1 }), ...style }}
    >
      {children}
    </Tag>
  );
}

export function Tape({ rot = -4, className }: { rot?: number; className?: string }) {
  return (
    <span
      className={className ? `${styles.tape} ${className}` : styles.tape}
      data-tape
      aria-hidden="true"
      style={vars({ rot })}
    />
  );
}

export function Sticker({
  rot = 6,
  depth = 10,
  tone,
  i = 0,
  className,
  children,
}: {
  rot?: number;
  depth?: number;
  tone?: "success" | "primary" | "info" | "caution";
  i?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={className ? `${styles.sticker} ${className}` : styles.sticker}
      data-sticker
      data-tone={tone}
      aria-hidden="true"
      style={vars({ rot, depth, i })}
    >
      {children}
    </span>
  );
}

export function Note({
  arrow = "dr",
  rot = 4,
  depth = 14,
  i = 0,
  className,
  children,
}: {
  arrow?: "dr" | "dl" | "ur" | "ul";
  rot?: number;
  depth?: number;
  i?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={className ? `${styles.note} ${className}` : styles.note}
      data-note
      aria-hidden="true"
      style={vars({ rot, depth, i })}
    >
      {children}
      <svg className={styles.arrow} data-dir={arrow} viewBox="0 0 120 80" focusable="false">
        <path d="M8 12 C 40 4, 86 20, 100 62" />
        <path d="M86 56 L 101 64 L 106 47" />
      </svg>
    </span>
  );
}

export function Spark({ className, depth = 8 }: { className?: string; depth?: number }) {
  return (
    <svg
      className={className ? `${styles.spark} ${className}` : styles.spark}
      data-spark
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={vars({ depth })}
    >
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
    </svg>
  );
}
