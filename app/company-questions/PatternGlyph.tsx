import type { PatternId } from "@/content/system-design/company-questions/dsa-types";
import styles from "./glyph.module.css";

const CELLS = [0, 1, 2, 3, 4, 5, 6, 7];

function Row({ y, on = [], dim = [] }: { y: number; on?: number[]; dim?: number[] }) {
  return (
    <>
      {CELLS.map((i) => (
        <rect
          key={i}
          x={10 + i * 17}
          y={y}
          width={15}
          height={18}
          rx={3}
          className={styles.cell}
          data-on={on.includes(i) ? "" : undefined}
          data-dim={dim.includes(i) ? "" : undefined}
        />
      ))}
    </>
  );
}

function Dot({ x, y, on }: { x: number; y: number; on?: boolean }) {
  return <circle cx={x} cy={y} r={7} className={styles.dot} data-on={on ? "" : undefined} />;
}

const DRAW: Record<PatternId, () => React.ReactNode> = {
  window: () => (
    <>
      <Row y={26} on={[2, 3, 4]} />
      <path d="M44 52v6h50v-6" className={styles.line} />
      <text x={69} y={72} textAnchor="middle" className={styles.tag}>
        window
      </text>
    </>
  ),
  pointers: () => (
    <>
      <Row y={22} on={[1, 6]} />
      <path d="M26 50v-8M22 46l4-4 4 4" className={styles.line} />
      <path d="M121 50v-8M117 46l4-4 4 4" className={styles.line} />
      <text x={26} y={64} textAnchor="middle" className={styles.tag}>
        left
      </text>
      <text x={121} y={64} textAnchor="middle" className={styles.tag}>
        right
      </text>
    </>
  ),
  hash: () => (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={14}
            y={14 + i * 22}
            width={44}
            height={16}
            rx={4}
            className={styles.cell}
            data-on={i === 1 ? "" : undefined}
          />
          <path d={`M60 ${22 + i * 22}h38`} className={styles.line} />
          <rect
            x={100}
            y={14 + i * 22}
            width={44}
            height={16}
            rx={4}
            className={styles.cell}
            data-dim={i === 1 ? undefined : ""}
          />
        </g>
      ))}
    </>
  ),
  heap: () => (
    <>
      <path d="M80 22L50 48M80 22L110 48M50 48L34 72M50 48L66 72M110 48L94 72" className={styles.line} />
      <Dot x={80} y={20} on />
      <Dot x={50} y={48} />
      <Dot x={110} y={48} />
      <Dot x={34} y={72} />
      <Dot x={66} y={72} />
      <Dot x={94} y={72} />
    </>
  ),
  graph: () => (
    <>
      <path d="M30 28L78 18M78 18L130 34M30 28L50 70M50 70L100 72M100 72L130 34M78 18L100 72" className={styles.line} />
      <Dot x={30} y={28} on />
      <Dot x={78} y={18} on />
      <Dot x={130} y={34} />
      <Dot x={50} y={70} />
      <Dot x={100} y={72} on />
    </>
  ),
  dp: () => (
    <>
      {[0, 1, 2, 3].flatMap((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect
            key={`${r}${c}`}
            x={26 + c * 22}
            y={8 + r * 20}
            width={19}
            height={17}
            rx={3}
            className={styles.cell}
            data-on={r === c || (r === 3 && c === 4) ? "" : undefined}
            data-dim={c > r + 1 ? "" : undefined}
          />
        ))
      )}
    </>
  ),
  search: () => (
    <>
      <Row y={22} dim={[0, 1, 2, 3]} on={[5]} />
      <path d="M95 52v-8M91 48l4-4 4 4" className={styles.line} />
      <text x={95} y={64} textAnchor="middle" className={styles.tag}>
        mid
      </text>
      <text x={20} y={64} textAnchor="middle" className={styles.tag}>
        lo
      </text>
      <text x={133} y={64} textAnchor="middle" className={styles.tag}>
        hi
      </text>
    </>
  ),
  stack: () => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={46}
          y={62 - i * 17}
          width={68}
          height={14}
          rx={4}
          className={styles.cell}
          data-on={i === 3 ? "" : undefined}
        />
      ))}
      <path d="M128 16v22M122 32l6 6 6-6" className={styles.line} />
      <text x={128} y={56} textAnchor="middle" className={styles.tag}>
        push
      </text>
    </>
  ),
  intervals: () => (
    <>
      {[
        [14, 70, 14],
        [50, 110, 32],
        [96, 146, 50],
        [20, 44, 68],
      ].map(([a, b, y]) => (
        <rect
          key={`${a}${y}`}
          x={a}
          y={y}
          width={b - a}
          height={12}
          rx={6}
          className={styles.cell}
          data-on={y === 32 ? "" : undefined}
        />
      ))}
    </>
  ),
  tree: () => (
    <>
      <path d="M80 18L48 44M80 18L112 44M48 44L32 70M48 44L64 70M112 44L96 70M112 44L128 70" className={styles.line} />
      <Dot x={80} y={18} on />
      <Dot x={48} y={44} on />
      <Dot x={112} y={44} />
      <Dot x={32} y={70} on />
      <Dot x={64} y={70} />
      <Dot x={96} y={70} />
      <Dot x={128} y={70} />
    </>
  ),
  list: () => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={10 + i * 38}
            y={34}
            width={26}
            height={22}
            rx={5}
            className={styles.cell}
            data-on={i === 1 ? "" : undefined}
          />
          {i < 3 && <path d={`M${36 + i * 38} 45h12M${44 + i * 38} 41l4 4-4 4`} className={styles.line} />}
        </g>
      ))}
    </>
  ),
  design: () => (
    <>
      <rect x={42} y={14} width={76} height={62} rx={8} className={styles.cell} data-on="" />
      <path d="M54 34h52M54 48h52M54 62h30" className={styles.line} />
      <text x={134} y={36} className={styles.tag}>
        get
      </text>
      <text x={134} y={52} className={styles.tag}>
        put
      </text>
      <path d="M118 33h12M118 49h12" className={styles.line} />
    </>
  ),
  union: () => (
    <>
      <path d="M30 24L52 40M52 40L30 62M110 28L132 50M110 28L128 70M52 40H72" className={styles.line} />
      <Dot x={30} y={24} />
      <Dot x={52} y={40} on />
      <Dot x={30} y={62} />
      <Dot x={92} y={40} />
      <Dot x={110} y={28} on />
      <Dot x={132} y={50} />
      <Dot x={128} y={70} />
      <path d="M72 40h8" className={styles.line} data-hot="" />
    </>
  ),
  greedy: () => (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={16 + i * 22}
          y={70 - (i + 1) * 9}
          width={18}
          height={(i + 1) * 9}
          rx={3}
          className={styles.cell}
          data-on={i === 5 ? "" : undefined}
        />
      ))}
    </>
  ),
  backtrack: () => (
    <>
      <path d="M80 16L40 44M80 16L120 44M40 44L22 72M40 44L58 72M120 44L102 72" className={styles.line} />
      <Dot x={80} y={16} />
      <Dot x={40} y={44} />
      <Dot x={120} y={44} on />
      <Dot x={22} y={72} />
      <Dot x={58} y={72} />
      <Dot x={102} y={72} on />
      <path d="M126 64l12 12M138 64l-12 12" className={styles.line} data-hot="" />
    </>
  ),
  sort: () => (
    <>
      {[5, 2, 7, 3, 6, 1, 4].map((h, i) => (
        <rect
          key={i}
          x={14 + i * 19}
          y={74 - h * 9}
          width={15}
          height={h * 9}
          rx={3}
          className={styles.cell}
          data-on={h === 7 ? "" : undefined}
        />
      ))}
    </>
  ),
};

export function PatternGlyph({ pattern }: { pattern: PatternId }) {
  return (
    <svg viewBox="0 0 160 90" className={styles.glyph} aria-hidden="true">
      {DRAW[pattern]()}
    </svg>
  );
}
