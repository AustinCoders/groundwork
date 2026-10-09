"use client";

import Link from "next/link";
import { accentVar } from "@/lib/accent";
import type { ContinueCard as Card } from "@/lib/continueCard";
import styles from "../SiteDrawer.module.css";

const RING_RADIUS = 23;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function Ring({ share, label }: { share: number; label: string }) {
  return (
    <span className={styles.ring} aria-hidden="true">
      <svg viewBox="0 0 60 60" width="60" height="60">
        <circle className={styles.ringTrack} cx="30" cy="30" r={RING_RADIUS} />
        <circle
          className={styles.ringFill}
          cx="30"
          cy="30"
          r={RING_RADIUS}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - share)}
        />
      </svg>
      <span className={styles.ringLabel}>{label}</span>
    </span>
  );
}

export function ContinueCard({ card, onClose }: { card: Card; onClose: () => void }) {
  if (!card) return null;
  const style = { "--accent": accentVar(card.accent) } as React.CSSProperties;
  const resume = card.kind === "resume";
  return (
    <section className={styles.continue} aria-labelledby="menu-continue" style={style}>
      <span className={styles.tape} aria-hidden="true" />
      <span className={styles.watermark} aria-hidden="true">
        {card.mark}
      </span>
      <p className={styles.kicker} id="menu-continue">
        {resume ? "Continue where you left off" : "Start here"}
      </p>
      <Link href={card.href} className={styles.continueLink} onClick={onClose} prefetch={false}>
        <span className={styles.continueMain}>
          {resume ? (
            <Ring share={card.index / card.total} label={`${Math.round((card.index / card.total) * 100)}%`} />
          ) : (
            <span className={styles.continueChip} aria-hidden="true">
              {card.mark}
            </span>
          )}
          <span className={styles.continueText}>
            <span className={styles.continueTitle}>{resume ? card.title : card.name}</span>
            <span className={styles.continueMeta}>
              {resume
                ? `${card.name}, chapter ${card.index} of ${card.total}`
                : `${card.written} ${card.written === 1 ? "chapter" : "chapters"} to read`}
            </span>
            {resume && <span className={styles.continueMeta}>Last read {card.since}</span>}
          </span>
        </span>
        <span className={styles.cta}>
          {resume ? "Pick up where you stopped" : `Open ${card.name}`}
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  );
}
