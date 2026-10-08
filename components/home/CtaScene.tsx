import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import shared from "./stage.module.css";
import styles from "./cta.module.css";

export function CtaScene({ head }: { head: ReactNode }) {
  return (
    <Scene className={styles.ctaScene}>
      <Copy className={styles.ctaCopy}>
        {head}
        <div className={styles.ctaActions}>
          <a href="#shelf" className={shared.btnPrimary}>
            Pick a topic <span aria-hidden="true">→</span>
          </a>
          <Link href="/problems" className={shared.btnGhost}>
            Solve a problem
          </Link>
        </div>
        <p className={styles.micro}>Open a chapter. No account, no card, no catch.</p>
      </Copy>
      <Stage tone="orange" className={styles.ctaStage}>
        <StageCard rot={-3} depth={-14} i={1} className={styles.cChapter}>
          <Tape rot={-5} />
          <p className={shared.kicker}>Your first chapter</p>
          <p className={shared.chapterTitle}>
            One idea, <mark>explained from the ground up</mark>, then one exercise to prove it.
          </p>
          <span className={shared.paperLine} />
          <span className={`${shared.paperLine} ${shared.short}`} />
          <span className={`${shared.paperLine} ${shared.mid}`} />
        </StageCard>
        <StageCard rot={2} depth={12} i={0} className={styles.cTimer}>
          <p className={shared.kicker}>Ten minutes</p>
          <div className={styles.ring}>
            <span className={styles.ringFace}>
              <strong>10:00</strong>
              <small>to one real idea</small>
            </span>
          </div>
        </StageCard>
        <StageCard rot={-1.6} depth={-8} i={2} extra className={styles.cCheck}>
          <span className={shared.doneTick}>✓</span>
          <span>
            <b>Understood</b>
            <small>and tested in the page</small>
          </span>
        </StageCard>
        <StageCard rot={2.6} depth={14} i={3} extra className={styles.cReview}>
          <span className={shared.flame}>↻</span>
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
        <Chip fact="ten minutes" rot={-3} depth={12} speed={50} className={styles.chipA}>
          10 minutes
        </Chip>
        <Chip fact="back in 3 days" rot={2} depth={-8} speed={-36} className={styles.chipB}>
          back in 3 days
        </Chip>
        <Chip fact="no card" rot={-2} depth={18} speed={66} className={styles.chipC}>
          no card
        </Chip>
      </Stage>
    </Scene>
  );
}
