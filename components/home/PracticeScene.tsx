import Link from "next/link";
import type { ReactNode } from "react";
import { Copy, Note, Scene, Spark, Stage, StageCard, Sticker, Tape } from "./Stage";
import { accent, vars } from "./tone";
import type { HomeViewProps } from "./types";
import styles from "./scenes.module.css";

const TOOLS = [
  { href: "/problems", name: "Problems", tone: "purple", mark: "⌘" },
  { href: "/practice?id=free", name: "Playground", tone: "blue", mark: "✎" },
  { href: "/mock", name: "Mock interviews", tone: "orange", mark: "⏱" },
  { href: "/whiteboard", name: "Whiteboard", tone: "teal", mark: "▱" },
];

const TEST_NAMES = ["counts up from 1", "each counter keeps its own n", "survives a thousand calls"];

export function PracticeScene({
  head,
  stats,
  languages,
  interview,
}: { head: ReactNode } & Pick<HomeViewProps, "stats" | "languages" | "interview">) {
  const copy: Record<string, { text: string; chip: string }> = {
    Problems: {
      text: "Exercises grouped by the pattern each one teaches, graded by real tests.",
      chip: `${stats.exercises} exercises`,
    },
    Playground: {
      text: "A full editor with a debugger. No install, no server.",
      chip: `${languages.runnable} languages run`,
    },
    "Mock interviews": {
      text: "A timed loop for your role and level, with follow-ups and a debrief.",
      chip: "Loop or one round",
    },
    Whiteboard: {
      text: "Sketch a system design with templates and arrows that stay stuck.",
      chip: "Design templates",
    },
  };
  const numbers = [
    { n: String(stats.exercises), l: "exercises graded by real tests" },
    { n: String(languages.runnable), l: "languages the editor runs" },
    { n: String(interview.rounds), l: "interview rounds, in order" },
    { n: `${interview.questions}+`, l: "interview questions answered" },
  ];
  const chips = languages.runs.slice(0, 7);

  return (
    <Scene flip>
      <Copy>
        {head}
        <dl className={styles.numbers}>
          {numbers.map((x) => (
            <div key={x.l}>
              <dt>{x.l}</dt>
              <dd>{x.n}</dd>
            </div>
          ))}
        </dl>
        <ul className={styles.tools}>
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} prefetch={false} className={styles.tool} style={accent(tool.tone)}>
                <span className={styles.toolMark} aria-hidden="true">
                  {tool.mark}
                </span>
                <span className={styles.toolName}>{tool.name}</span>
                <span className={styles.toolText}>{copy[tool.name].text}</span>
                <span className={styles.toolChip}>{copy[tool.name].chip}</span>
                <span className={styles.toolGo} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Copy>
      <Stage tone="purple" className={styles.practiceStage}>
        <StageCard rot={-2.6} depth={-14} i={1} extra className={styles.pBoard}>
          <div className={styles.winBar}>
            <i />
            <i />
            <i />
            <em>whiteboard · cache</em>
          </div>
          <svg className={styles.boardArt} viewBox="0 0 240 120" focusable="false">
            <g className={styles.boardBoxes}>
              <rect x="6" y="38" width="62" height="38" rx="8" />
              <rect x="88" y="14" width="62" height="38" rx="8" />
              <rect x="88" y="70" width="62" height="38" rx="8" />
              <rect x="172" y="38" width="62" height="38" rx="8" />
            </g>
            <g className={styles.boardLines}>
              <path d="M68 52 L88 36" />
              <path d="M68 62 L88 86" />
              <path d="M150 36 L172 52" />
              <path d="M150 90 L172 66" />
            </g>
            <g className={styles.boardText}>
              <text x="37" y="61" textAnchor="middle">
                client
              </text>
              <text x="119" y="37" textAnchor="middle">
                api
              </text>
              <text x="119" y="93" textAnchor="middle">
                cache
              </text>
              <text x="203" y="61" textAnchor="middle">
                db
              </text>
            </g>
          </svg>
          <span className={styles.boardSticky}>cache this read?</span>
        </StageCard>
        <StageCard rot={1.8} depth={12} i={0} className={styles.pEditor}>
          <Tape rot={-3} />
          <div className={styles.winBar}>
            <i />
            <i />
            <i />
            <em>counter.js</em>
            <b className={styles.runMini}>▶ Run tests</b>
          </div>
          <div className={styles.code}>
            <span className={styles.kw}>function</span> counter() {"{"}
            {"\n  "}
            <span className={styles.kw}>let</span> n = <span className={styles.num}>0</span>;{"\n  "}
            <span className={styles.kw}>return</span> () =&gt; ++n;{"\n"}
            {"}"}
          </div>
          <ul className={styles.testList}>
            {TEST_NAMES.map((name, k) => (
              <li key={name} style={vars({ k })}>
                <span className={styles.tick}>✓</span>
                {name}
              </li>
            ))}
          </ul>
          <p className={styles.passed}>
            <strong>3 / 3 passed</strong>
            <span>graded in your browser</span>
          </p>
        </StageCard>
        <StageCard rot={-1.4} depth={-8} i={2} className={styles.pMock}>
          <p className={styles.mockKicker}>
            <span className={styles.rec} />
            Mock · Round 2 of {interview.rounds}
          </p>
          <div className={styles.mockTop}>
            <span className={styles.timer}>⏱ 45:00</span>
            <span className={styles.timeBar}>
              <i />
            </span>
          </div>
          <p className={styles.bubble}>“Build me a debounce.”</p>
          <p className={styles.followChip}>follow-up: “now let me cancel it.”</p>
        </StageCard>
        <StageCard rot={2.4} depth={16} i={3} extra className={styles.pLangs}>
          <p className={styles.langKicker}>The Playground runs</p>
          <div className={styles.langChips}>
            {chips.map((label) => (
              <span key={label}>{label}</span>
            ))}
            {languages.runnable > chips.length && <span>+{languages.runnable - chips.length} more</span>}
          </div>
        </StageCard>
        <Sticker rot={7} depth={22} tone="success" className={styles.pXp}>
          +25 XP
        </Sticker>
        <Sticker rot={-6} depth={18} className={styles.pLangSticker}>
          runs {languages.runnable} languages
        </Sticker>
        <Note arrow="dr" rot={-4} depth={18} className={styles.pNote}>
          go on, run it
        </Note>
        <Spark className={styles.pSpark} />
      </Stage>
    </Scene>
  );
}
