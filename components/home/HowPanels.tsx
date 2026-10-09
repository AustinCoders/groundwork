import type { ReactNode } from "react";
import { plural } from "@/lib/format";
import { HOW_STEP_COPY, LAYERS, NEXT_REVIEW, READ_LINES } from "@/lib/homeHow";
import {
  CALENDAR_DAYS,
  QUESTION,
  RIGHT_GRADE,
  TEST_NAMES,
  VARIANTS,
  dayAfter,
  gradeAnswer,
  reviewSchedule,
  runVariant,
  variantOf,
  type Grade,
  type Report,
  type VariantId,
} from "@/lib/howDemo";
import type { Demo } from "./howState";
import { vars } from "./tone";
import styles from "./how.module.css";

const LAYER_COUNT = LAYERS.length;
const CLOSURE_REPORT = runVariant("closure");

function Heading({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className={styles.panelHead}>
      <span className={styles.panelNo} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3>{children}</h3>
    </div>
  );
}

function dayText(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function BuiltOn({ layer }: { layer: number }) {
  return (
    <p className={styles.builtOn}>
      <b>Rests on</b> {LAYERS[layer]}
      {layer > 0 && (
        <>
          , <b>built on</b>{" "}
          {LAYERS.slice(0, layer)
            .reverse()
            .map((name) => name.toLowerCase())
            .join(" and ")}
        </>
      )}
      .
    </p>
  );
}

export function ReadPanel({ demo, mounted, onOpen }: { demo: Demo; mounted: boolean; onOpen: (line: number) => void }) {
  const line = demo.open === null ? null : READ_LINES[demo.open];
  const rests = line === null ? null : line.layer;
  return (
    <>
      <Heading index={0}>{HOW_STEP_COPY[0].title}</Heading>
      <div className={styles.read}>
        <div className={styles.readMain}>
          <div className={styles.liveOnly}>
            <p className={styles.prompt}>Tap a line to see it in plain words.</p>
            <ol className={styles.lines}>
              {READ_LINES.map((item, i) => (
                <li key={item.line}>
                  <button
                    type="button"
                    className={styles.line}
                    aria-pressed={demo.open === i}
                    aria-controls="how-plain"
                    onClick={() => onOpen(i)}
                  >
                    <span className={styles.lineNo} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{item.line}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div
            id="how-plain"
            className={`${styles.plainBox} ${styles.liveOnly}`}
            aria-live="polite"
            data-idle={line === null || undefined}
          >
            {line === null ? (
              <>
                <p className={styles.prompt}>The code behind these three lines</p>
                <Code variant="closure" flagged={false} tight />
                <p className={styles.idleNote}>Step 2 runs it.</p>
              </>
            ) : (
              <div key={demo.open}>
                <p>
                  <b>In plain words.</b> {line.plain}
                </p>
                <BuiltOn layer={line.layer} />
              </div>
            )}
          </div>
          {!mounted && (
            <ol className={`${styles.finalLines} ${styles.finalOnly}`}>
              {READ_LINES.map((item) => (
                <li key={item.line}>
                  <b>{item.line}</b>
                  <span>{item.plain}</span>
                  <BuiltOn layer={item.layer} />
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className={styles.layers} aria-hidden="true">
          <p className={styles.layersLabel}>Layers, bottom to top</p>
          <ol>
            {LAYERS.map((name, i) => (
              <li
                key={name}
                style={vars({ o: LAYER_COUNT - i, i })}
                data-state={rests === null ? undefined : i === rests ? "rests" : i < rests ? "below" : "above"}
              >
                <span>{name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

function Results({ report }: { report: Report | null }) {
  return (
    <ul className={styles.results}>
      {TEST_NAMES.map((name, i) => {
        const outcome = report?.outcomes[i];
        return (
          <li key={name} data-result={outcome ? (outcome.ok ? "pass" : "fail") : "idle"} style={vars({ k: i })}>
            <span className={styles.mark} aria-hidden="true">
              {outcome ? (outcome.ok ? "✓" : "✗") : "○"}
            </span>
            <span className={styles.testName}>{name}</span>
            {outcome && !outcome.ok && (
              <span className={styles.diff}>
                expected {outcome.expected}, received {outcome.received}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Code({ variant, flagged, tight }: { variant: VariantId; flagged: boolean; tight?: boolean }) {
  const { source, culprit } = variantOf(variant);
  return (
    <pre className={tight ? `${styles.code} ${styles.codeTight}` : styles.code}>
      <code>
        {source.map((text, i) => (
          <span key={i} className={styles.codeLine} data-culprit={(flagged && i === culprit) || undefined}>
            {text || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function RunPanel({
  demo,
  mounted,
  onPick,
  onRun,
}: {
  demo: Demo;
  mounted: boolean;
  onPick: (variant: VariantId) => void;
  onRun: () => void;
}) {
  const report = demo.report;
  const variant = variantOf(demo.variant);
  const score = report ? `${report.passed} / ${report.total} passed` : "Not run yet";
  return (
    <>
      <Heading index={1}>{HOW_STEP_COPY[1].title}</Heading>
      <div className={styles.run}>
        <div className={styles.runLeft}>
          <fieldset className={`${styles.variants} ${styles.liveOnly}`}>
            <legend>Pick a version of counter()</legend>
            <div className={styles.segmented}>
              {VARIANTS.map((item) => (
                <span key={item.id} className={styles.variant}>
                  <input
                    type="radio"
                    name="how-variant"
                    id={`how-variant-${item.id}`}
                    checked={demo.variant === item.id}
                    onChange={() => onPick(item.id)}
                  />
                  <label htmlFor={`how-variant-${item.id}`}>{item.label}</label>
                </span>
              ))}
            </div>
          </fieldset>
          <div className={styles.liveOnly}>
            <Code variant={demo.variant} flagged={report !== null && !report.ok} />
          </div>
          <p className={`${styles.hint} ${styles.liveOnly}`}>
            {report
              ? variant.hint
              : "These are real functions running in your browser. Run the broken one first, then fix it."}
          </p>
          {!mounted && (
            <div className={styles.finalOnly}>
              <p className={styles.prompt}>The closure version, run against three tests.</p>
              <Code variant="closure" flagged={false} />
            </div>
          )}
        </div>
        <div className={styles.runRight}>
          <div className={`${styles.runRow} ${styles.liveOnly}`}>
            <button type="button" className={styles.primary} onClick={onRun}>
              Run tests
            </button>
            <p className={styles.score} role="status" data-state={report ? (report.ok ? "pass" : "fail") : "idle"}>
              {score}
            </p>
          </div>
          <div className={styles.liveOnly}>
            <Results report={report} />
          </div>
          {!mounted && (
            <div className={styles.finalOnly}>
              <Results report={CLOSURE_REPORT} />
              <p className={styles.score} data-state="pass">
                {CLOSURE_REPORT.passed} / {CLOSURE_REPORT.total} passed
              </p>
            </div>
          )}
          <ul className={`${styles.tasks} ${styles.liveOnly}`}>
            <Task done={demo.failed}>Break it: run a version that fails a test</Task>
            <Task done={demo.fixed}>Fix it: run the closure and get all three green</Task>
          </ul>
        </div>
      </div>
    </>
  );
}

function Task({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li data-done={done || undefined}>
      <span className={styles.taskMark} aria-hidden="true">
        {done ? "✓" : ""}
      </span>
      <span className="visually-hidden">{done ? "Done: " : "To do: "}</span>
      {children}
    </li>
  );
}

function Reply({ grade }: { grade: Grade }) {
  return (
    <div className={styles.reply} data-correct={grade.correct || undefined}>
      <p className={styles.you}>
        <span className={styles.verdict}>{grade.correct ? "✓ You said" : "✗ You said"}</span>{" "}
        <code>{grade.option.label}</code>. {grade.why}
      </p>
      <span className={styles.typingDots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div className={styles.followUp}>
        <p className={styles.them}>{grade.ask}</p>
        <p className={styles.testing}>
          <b>What they are really testing.</b> {grade.testing}
        </p>
      </div>
    </div>
  );
}

export function AskPanel({
  demo,
  mounted,
  onAnswer,
}: {
  demo: Demo;
  mounted: boolean;
  onAnswer: (option: string) => void;
}) {
  const grade = demo.answer === null ? null : gradeAnswer(demo.answer);
  return (
    <>
      <Heading index={2}>{HOW_STEP_COPY[2].title}</Heading>
      <div className={styles.ask}>
        <div className={styles.question}>
          <p className={styles.them}>{QUESTION.prompt}</p>
          <pre className={`${styles.code} ${styles.codeTight}`}>
            <code>
              {QUESTION.code.map((text) => (
                <span key={text} className={styles.codeLine}>
                  {text}
                </span>
              ))}
            </code>
          </pre>
        </div>
        <div className={styles.liveOnly}>
          <div role="group" aria-label="What does it log?" className={styles.options}>
            {QUESTION.options.map((option) => {
              const chosen = demo.answer === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={styles.option}
                  aria-pressed={chosen}
                  data-result={chosen && grade ? (grade.correct ? "right" : "wrong") : undefined}
                  onClick={() => onAnswer(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.liveOnly} aria-live="polite">
          {grade ? (
            <Reply key={grade.option.id} grade={grade} />
          ) : (
            <p className={styles.them}>
              Take your time. Pick what you think it logs and I will tell you how that went.
            </p>
          )}
        </div>
        {!mounted && (
          <div className={styles.finalOnly}>
            <Reply grade={RIGHT_GRADE} />
          </div>
        )}
      </div>
    </>
  );
}

function Calendar({ today, lit }: { today: Date | null; lit: number[] }) {
  return (
    <div className={styles.calendar} aria-hidden="true">
      <div className={styles.weekdays}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i}>{today ? dayAfter(today, i).toLocaleDateString(undefined, { weekday: "narrow" }) : ""}</span>
        ))}
      </div>
      <div className={styles.days}>
        {Array.from({ length: CALENDAR_DAYS }, (_, i) => {
          const at = lit.indexOf(i);
          return (
            <span key={i} data-lit={at >= 0 || undefined} data-today={i === 0 || undefined} style={vars({ k: at })}>
              {today ? dayAfter(today, i).getDate() : ""}
              {at >= 0 && (
                <svg className={styles.pen} viewBox="0 0 24 24" focusable="false">
                  <path
                    d="M12 2.5C18 2 22.5 7 21.5 13 20.5 19 15 22.5 10 21.5 4.5 20.5 1.8 15 3 9.5 4 5 8 3 12.5 3.2"
                    pathLength={1}
                  />
                </svg>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Schedule({ today, lit }: { today: Date | null; lit: boolean }) {
  const days = reviewSchedule(today ?? new Date(0));
  return (
    <>
      <p className={styles.hint}>
        {lit
          ? `Review 1 comes back in ${NEXT_REVIEW}, and every review pushes the next one further out.`
          : "Press the button and these days light up. Each gap is counted from the last review."}
      </p>
      <ol className={styles.schedule}>
        {days.map((day, i) => (
          <li key={day.offset} data-lit={lit || undefined} style={vars({ k: i })}>
            <b>{day.label}</b>
            {today && <span className={styles.date}>{dayText(day.date)}</span>}
            <span className={styles.why}>
              {day.gap === null
                ? "you read it"
                : i === 1
                  ? "first review"
                  : `review ${i}, ${plural(day.gap, "day")} later`}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

export function KeepPanel({ demo, mounted, onMark }: { demo: Demo; mounted: boolean; onMark: () => void }) {
  const marked = demo.today !== null;
  const lit = reviewSchedule(demo.today ?? new Date(0))
    .map((day) => day.offset)
    .filter((offset) => offset < CALENDAR_DAYS);
  return (
    <>
      <Heading index={3}>{HOW_STEP_COPY[3].title}</Heading>
      <div className={styles.keep}>
        <div className={styles.keepLeft}>
          <p className={styles.chapter}>
            <b>Closures</b>
            <span>JavaScript, a chapter you just read</span>
          </p>
          <button type="button" className={`${styles.primary} ${styles.liveOnly}`} onClick={onMark} disabled={marked}>
            {marked ? "Marked as read today" : "Mark as read today"}
          </button>
          <div className={styles.liveOnly}>
            <Calendar today={demo.today} lit={marked ? lit : []} />
          </div>
          {!mounted && (
            <div className={styles.finalOnly}>
              <Calendar today={null} lit={lit} />
            </div>
          )}
        </div>
        <div className={`${styles.keepRight} ${styles.liveOnly}`} aria-live="polite">
          <Schedule today={demo.today} lit={marked} />
        </div>
        {!mounted && (
          <div className={`${styles.keepRight} ${styles.finalOnly}`}>
            <Schedule today={null} lit />
          </div>
        )}
      </div>
    </>
  );
}
