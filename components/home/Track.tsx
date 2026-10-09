import { useId } from "react";
import { accent } from "./tone";
import type { Trail } from "@/lib/trail";
import styles from "./track.module.css";

export function TrackSvg({
  trail,
  tone,
  shape,
  className,
}: {
  trail: Trail;
  tone: string;
  shape?: "loop";
  className?: string;
}) {
  const mask = useId();
  return (
    <svg
      className={className ? `${styles.svg} ${className}` : styles.svg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={accent(tone)}
    >
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <path className={styles.reveal} d={trail.d} pathLength={1} data-motion="trail" data-fx-shape={shape} />
        </mask>
      </defs>
      <path className={styles.track} d={trail.d} />
      <path className={styles.walked} d={trail.d} mask={`url(#${mask})`} />
    </svg>
  );
}

export function Walker({ count, shape, className }: { count?: number; shape?: "loop"; className?: string }) {
  return (
    <span
      className={className ? `${styles.walker} ${className}` : styles.walker}
      data-motion="walker"
      data-fx-count={count}
      data-fx-shape={shape}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" focusable="false">
        <circle cx="16" cy="16" r="14" />
        <path d="M9 17 L23 16 L15 23 M23 16 L15 9" />
      </svg>
    </span>
  );
}
