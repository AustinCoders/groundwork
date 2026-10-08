import Link from "next/link";
import type { ReactNode } from "react";
import { Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import styles from "./scenes.module.css";

export function CtaScene({ head }: { head: ReactNode }) {
  return (
    <Scene className={styles.ctaScene}>
      <Copy className={styles.ctaCopy}>
        {head}
        <div className={styles.ctaActions}>
          <a href="#shelf" className={styles.btnPrimary}>
            Pick a topic <span aria-hidden="true">→</span>
          </a>
          <Link href="/problems" className={styles.btnGhost}>
            Solve a problem
          </Link>
        </div>
        <p className={styles.micro}>Open a chapter. No account, no card, no catch.</p>
      </Copy>
      <Stage tone="orange" className={styles.ctaStage}>
        <StageCard rot={-3} depth={-14} i={1} className={styles.cChapter}>
          <Tape rot={-5} />
          <p className={styles.kicker}>Your first chapter</p>
          <p className={styles.chapterTitle}>
            One idea, <mark>explained from the ground up</mark>, then one exercise to prove it.
          </p>
          <span className={styles.paperLine} />
          <span className={`${styles.paperLine} ${styles.short}`} />
          <span className={`${styles.paperLine} ${styles.mid}`} />
        </StageCard>
        <StageCard rot={2} depth={12} i={0} className={styles.cTimer}>
          <p className={styles.kicker}>Ten minutes</p>
          <div className={styles.ring}>
            <span className={styles.ringFace}>
              <strong>10:00</strong>
              <small>to one real idea</small>
            </span>
          </div>
        </StageCard>
        <StageCard rot={-1.6} depth={-8} i={2} extra className={styles.cCheck}>
          <span className={styles.doneTick}>✓</span>
          <span>
            <b>Understood</b>
            <small>and tested in the page</small>
          </span>
        </StageCard>
        <StageCard rot={2.6} depth={14} i={3} extra className={styles.cReview}>
          <span className={styles.flame}>↻</span>
          <span>
            <b>Comes back in 3 days</b>
            <small>so it stays</small>
          </span>
        </StageCard>
        <Sticker rot={8} depth={22} tone="success" className={styles.cXp}>
          +25 XP
        </Sticker>
        <Note arrow="ur" rot={-5} depth={18} className={styles.cNote}>
          go on
        </Note>
        <Spark className={styles.cSpark} />
      </Stage>
    </Scene>
  );
}
