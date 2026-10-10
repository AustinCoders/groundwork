"use client";

import Link from "next/link";
import { Eyebrow } from "@/components/menu/Eyebrow";
import type { ContinueCard as Card } from "@/lib/continueCard";
import styles from "../SiteDrawer.module.css";

export function ContinueCard({ card, onClose }: { card: Card; onClose: () => void }) {
  if (!card) return null;
  const resume = card.kind === "resume";
  return (
    <section className={styles.block} aria-labelledby="menu-continue">
      <Eyebrow no="01" id="menu-continue">
        {resume ? "Continue where you left off" : "Start here"}
      </Eyebrow>
      <div className={styles.paper}>
        <span className={styles.tape} aria-hidden="true" />
        <Link href={card.href} className={styles.paperLink} onClick={onClose} prefetch={false}>
          <span className={styles.paperKicker}>
            {resume
              ? `${card.name} · chapter ${card.index} of ${card.total}`
              : `${card.written} ${card.written === 1 ? "chapter" : "chapters"} to read`}
          </span>
          <span className={styles.paperTitle}>{resume ? card.title : card.name}</span>
          {resume && (
            <span className={styles.trail} aria-hidden="true">
              <span style={{ width: `${(card.index / card.total) * 100}%` }} />
            </span>
          )}
          {resume && <span className={styles.paperMeta}>Last read {card.since}</span>}
          <span className={styles.btn}>
            {resume ? "Pick up where you stopped" : `Open ${card.name}`}
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
