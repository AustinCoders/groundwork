import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Chip, Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import { useMounted } from "./useMounted";
import shared from "./stage.module.css";
import styles from "./faq.module.css";

export interface Faq {
  q: string;
  a?: string;
  contrasts?: boolean;
  link?: { href: string; label: string };
}

const COMPARE = [
  {
    them: "Video courses",
    gap: "You watch someone else type. Nothing checks that you understood, and you cannot search a video.",
    us: "Every idea is written down, searchable, and followed by an exercise graded by real tests.",
  },
  {
    them: "Grinding problem sites",
    gap: "Hundreds of puzzles with no theory behind them, so a new twist breaks you.",
    us: "Problems are grouped by the pattern they teach, and each pattern has a chapter that explains it.",
  },
  {
    them: "Official docs",
    gap: "Complete and correct, but written for people who already know what they are looking for.",
    us: "Layered bottom to top: nothing uses a word that has not been explained yet.",
  },
  {
    them: "Interview blog posts",
    gap: "A list of questions with one-line answers, and nothing about how the round actually runs.",
    us: "Every round in order, what it is really testing, the wrong answer that loses the room, and the follow-up.",
  },
];

const NOTES = [
  { title: "No account", text: "No sign-up and no card. Open a chapter and read.", tone: "mark" },
  { title: "All of it free", text: "Every chapter, exercise, mock and the whiteboard.", tone: "info" },
  { title: "Stays on this device", text: "Progress, streak and boards are saved in this browser.", tone: "success" },
];

export function FaqScene({ head, faqs, languages }: { head: ReactNode; faqs: Faq[]; languages: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const mounted = useMounted();
  return (
    <Scene side="left">
      <Copy className={styles.faqLead}>
        {head}
        <Stage tone="yellow" className={styles.faqStage} height="clamp(280px, 46vh, 440px)">
          {NOTES.map((note, i) => (
            <StageCard
              key={note.title}
              rot={[-4, 3, -2][i]}
              depth={[16, -14, 20][i]}
              i={i}
              extra={i === 2}
              className={`${styles.sticky} ${styles[`sticky${i}`]}`}
              data-tone={note.tone}
            >
              {i === 0 && <Tape rot={-5} />}
              <b>{note.title}</b>
              <span>{note.text}</span>
            </StageCard>
          ))}
          <Sticker rot={8} depth={22} tone="primary" className={styles.faqSticker}>
            ask away
          </Sticker>
          <Note arrow="dr" rot={-4} depth={16} className={styles.faqNote}>
            nothing to sign
          </Note>
          <Spark className={styles.faqSpark} />
          <Chip fact={String(languages)} rot={-3} depth={12} speed={44} className={styles.chipA}>
            {languages} languages run
          </Chip>
          <Chip fact="no sign-up" rot={2} depth={-8} speed={-30} className={styles.chipB}>
            no sign-up
          </Chip>
          <Chip fact="free" rot={-2} depth={16} speed={52} className={styles.chipC}>
            free to use
          </Chip>
        </Stage>
        <div className={styles.faqActions}>
          <a href="#shelf" className={shared.btnPrimary}>
            Pick a topic <span aria-hidden="true">→</span>
          </a>
          <Link href="/interview" className={shared.btnGhost}>
            Prepare for an interview
          </Link>
        </div>
      </Copy>
      <div className={styles.faq}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={styles.faqItem} data-open={isOpen || undefined}>
              <h3 className={styles.faqHead}>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  className={styles.faqBtn}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {f.q}
                  <span className={styles.faqIcon} aria-hidden="true" />
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className={styles.faqPanel}
                inert={mounted && !isOpen ? true : undefined}
              >
                <div className={styles.faqPanelInner}>
                  <div className={styles.faqBody}>
                    {f.a && (
                      <p>
                        {f.a}
                        {f.link && (
                          <>
                            {" "}
                            <Link href={f.link.href}>{f.link.label}</Link>
                          </>
                        )}
                      </p>
                    )}
                    {f.contrasts && (
                      <ul className={styles.contrasts}>
                        {COMPARE.map((c) => (
                          <li key={c.them}>
                            <strong>{c.them}</strong>
                            <span className={styles.them}>
                              <span aria-hidden="true">✗</span> {c.gap}
                            </span>
                            <span className={styles.us}>
                              <span aria-hidden="true">✓</span> {c.us}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Scene>
  );
}
