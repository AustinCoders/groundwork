import Link from "next/link";
import type { ReactNode } from "react";
import { Chip, Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import shared from "./stage.module.css";
import styles from "./resume.module.css";

export function ResumeScene({ head, questions }: { head: ReactNode; questions: number }) {
  return (
    <Scene flip className={styles.resumeScene}>
      <Copy className={styles.resumeCopy}>
        {head}
        <ul className={styles.points}>
          <li>
            <b>Your own bullets, questioned.</b> Every number on the page gets a “how did you measure that?”.
          </li>
          <li>
            <b>Real questions for each skill</b> from the interview book and company rounds, with the model answer one
            click away.
          </li>
          <li>
            <b>Fixes before you apply:</b> vague verbs, missing numbers, personal details, and the job description’s
            keywords you do not have.
          </li>
        </ul>
        <div className={styles.actions}>
          <Link href="/resume" className={shared.btnPrimary}>
            Check my resume <span aria-hidden="true">→</span>
          </Link>
          <Link href="/resume#resume-sample" className={shared.btnGhost}>
            See a sample
          </Link>
        </div>
        <p className={styles.micro}>Free with an account. Read in your browser; no AI service sees your file.</p>
      </Copy>
      <Stage tone="purple" className={styles.resumeStage}>
        <StageCard rot={-2.5} depth={-12} i={0} className={styles.cPaper}>
          <Tape rot={-4} />
          <p className={shared.kicker}>resume.pdf</p>
          <p className={styles.paperName}>Riya Sharma</p>
          <p className={styles.paperRole}>Software Engineer II · Cartwheel Commerce</p>
          <p className={styles.paperBullet}>
            Led the checkout move to NestJS, cutting p95 latency <mark>from 1.8s to 420ms</mark>.
          </p>
          <p className={`${styles.paperBullet} ${styles.weak}`}>
            <s>Responsible for</s> the payments integration with Razorpay.
          </p>
          <span className={shared.paperLine} />
          <span className={`${shared.paperLine} ${shared.short}`} />
        </StageCard>
        <StageCard rot={2} depth={14} i={1} className={styles.cAsk}>
          <p className={shared.kicker}>They will ask</p>
          <p className={styles.askText}>How did you measure “1.8s to 420ms”, and what was it before?</p>
          <p className={styles.follow}>then: which dashboard? over what window?</p>
        </StageCard>
        <StageCard rot={-1.5} depth={6} i={2} extra className={styles.cFix}>
          <span className={styles.fixTag}>Fix</span>
          <span>
            <b>Start with what you did</b>
            <small>“Built the Razorpay integration…”</small>
          </span>
        </StageCard>
        <StageCard rot={2.4} depth={-6} i={3} extra className={styles.cGap}>
          <span className={styles.gapChip}>Kubernetes ?</span>
          <small>asked for in the job, not on your resume</small>
        </StageCard>
        <Sticker rot={7} depth={22} tone="primary" className={styles.cCount}>
          {questions}+ questions
        </Sticker>
        <Note arrow="dl" rot={-4} depth={18} className={styles.cNote}>
          from your own bullets
        </Note>
        <Spark className={styles.cSpark} />
        <Chip fact="PDF or Word" rot={-3} depth={12} speed={48} className={styles.chipA}>
          PDF or Word
        </Chip>
        <Chip fact="read in your browser" rot={2} depth={-8} speed={-34} className={styles.chipB}>
          read in your browser
        </Chip>
        <Chip fact="free" rot={-2} depth={18} speed={62} className={styles.chipC}>
          free
        </Chip>
      </Stage>
    </Scene>
  );
}
