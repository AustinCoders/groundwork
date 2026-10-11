"use client";

import Link from "next/link";
import type { MenuStats } from "@/components/menu/menuStats";
import { Eyebrow } from "@/components/ui/MenuKit";
import type { ContinueCard as Card } from "@/lib/continueCard";
import styles from "../SiteDrawer.module.css";

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

function Standing({ stats, onClose }: { stats: MenuStats; onClose: () => void }) {
  return (
    <Link href="/progress" className={styles.standing} onClick={onClose} prefetch={false}>
      <span>
        Level {stats.level} · {stats.chaptersRead} {plural(stats.chaptersRead, "chapter", "chapters")} read ·{" "}
        {stats.streak} day streak
      </span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function ContinueCard({ card, stats, onClose }: { card: Card; stats: MenuStats | null; onClose: () => void }) {
  if (!card) return null;
  const resume = card.kind === "resume";
  return (
    <section className={styles.block} aria-labelledby="menu-continue">
      <Eyebrow no="01" id="menu-continue">
        {resume ? (
          <>
            Continue<span className="visually-hidden"> where you left off</span>
          </>
        ) : (
          "Start here"
        )}
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
        {stats && <Standing stats={stats} onClose={onClose} />}
      </div>
    </section>
  );
}
