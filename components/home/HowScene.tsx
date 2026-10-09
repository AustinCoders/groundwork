import { useReducer, useRef, useState, type ReactNode } from "react";
import { HOW_STEP_COPY, HOW_STEPS, NEXT_REVIEW } from "@/lib/homeHow";
import { nextTab } from "@/lib/tablist";
import { AskPanel, KeepPanel, ReadPanel, RunPanel } from "./HowPanels";
import { achieved, demoReducer, START } from "./howState";
import { Chip, Copy, Note, Scene, Spark, Stage, Sticker, Tape } from "./Stage";
import { panelAttrs } from "./tone";
import { useMounted } from "./useMounted";
import styles from "./how.module.css";

const NOTES = ["tap a line", "break it, then fix it", "pick one", "press the button"];

export function HowScene({ head }: { head: ReactNode }) {
  const mounted = useMounted();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [demo, dispatch] = useReducer(demoReducer, START);
  const done = achieved(demo);
  const tried = done.filter(Boolean).length;
  const last = HOW_STEPS - 1;
  const complete = tried === HOW_STEPS;
  const panels = [
    {
      id: "read",
      node: <ReadPanel demo={demo} mounted={mounted} onOpen={(line) => dispatch({ type: "open", line })} />,
    },
    {
      id: "run",
      node: (
        <RunPanel
          demo={demo}
          mounted={mounted}
          onPick={(variant) => dispatch({ type: "pick", variant })}
          onRun={() => dispatch({ type: "run" })}
        />
      ),
    },
    {
      id: "ask",
      node: <AskPanel demo={demo} mounted={mounted} onAnswer={(option) => dispatch({ type: "answer", option })} />,
    },
    {
      id: "keep",
      node: <KeepPanel demo={demo} mounted={mounted} onMark={() => dispatch({ type: "mark", today: new Date() })} />,
    },
  ];

  function onKey(e: React.KeyboardEvent) {
    const next = nextTab(e.key, active, HOW_STEPS);
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <Scene>
      <Copy>
        {head}
        <div className={styles.ladderBox}>
          <div className={styles.ladder} role="tablist" aria-label="How it works" onKeyDown={onKey}>
            {HOW_STEP_COPY.map((step, i) => (
              <button
                key={step.k}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`how-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`how-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                className={styles.rung}
                data-done={done[i] || undefined}
                onClick={() => setActive(i)}
              >
                <span className={styles.rungNo}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.rungName}>{step.k}</span>
                <span className={styles.rungLine}>{step.line}</span>
                <span className={styles.rungTick} aria-hidden="true">
                  {done[i] ? "✓" : ""}
                </span>
                {done[i] && <span className="visually-hidden">tried</span>}
              </button>
            ))}
          </div>
          <div className={styles.ladderFoot}>
            <p className={styles.tried} aria-live="polite" data-complete={complete || undefined}>
              <b>{tried}</b> of {HOW_STEPS} tried
            </p>
            {complete ? (
              <a className={styles.pick} href="#shelf">
                Pick a topic <span aria-hidden="true">→</span>
              </a>
            ) : (
              <button type="button" className={styles.next} onClick={() => setActive(active === last ? 0 : active + 1)}>
                {active === last ? "Back to the start" : "Next step"} <span aria-hidden="true">→</span>
              </button>
            )}
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                dispatch({ type: "reset" });
                setActive(0);
              }}
            >
              Reset demo
            </button>
          </div>
          <p className={styles.demoNote}>A small demo. Nothing you do here is saved.</p>
        </div>
      </Copy>
      <Stage live tone="green" className={styles.howStage} hostClassName={styles.howHost}>
        <div className={styles.bench}>
          <Tape rot={-3} />
          {panels.map((panel, i) => (
            <div
              key={panel.id}
              className={styles.panel}
              role="tabpanel"
              id={`how-panel-${i}`}
              aria-labelledby={`how-tab-${i}`}
              data-step={i}
              data-active={i === active || undefined}
              {...panelAttrs(mounted, i !== active, i !== active)}
            >
              {panel.node}
            </div>
          ))}
        </div>
        <Sticker rot={5} depth={20} tone="primary" className={styles.hSticker}>
          {complete ? "all four done" : "try it live"}
        </Sticker>
        <Note arrow="dr" rot={-3} depth={16} className={styles.hNote}>
          {complete ? "that was the whole loop" : NOTES[active]}
        </Note>
        <Spark className={styles.hSpark} />
        <Chip fact="real tests" rot={-3} depth={12} speed={46} className={styles.chipA}>
          real tests
        </Chip>
        <Chip fact={NEXT_REVIEW} rot={2} depth={-8} speed={-34} className={styles.chipB}>
          back in {NEXT_REVIEW}
        </Chip>
      </Stage>
    </Scene>
  );
}
