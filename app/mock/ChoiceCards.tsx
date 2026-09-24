"use client";

import styles from "./mock.module.css";

/**
 * Small line drawings for the lobby's choices. Each one says something about
 * the option rather than decorating it: experience is bars that fill, a loop's
 * length is a clock that fills, a service company is a grid of many teams.
 */
export type IconName =
  | "frontend"
  | "fullstack"
  | "backend"
  | "level-1"
  | "level-2"
  | "level-3"
  | "service"
  | "product"
  | "saas"
  | "agency"
  | "clock-1"
  | "clock-2"
  | "clock-4";

function Icon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 40 40",
    width: 40,
    height: 40,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "frontend":
      return (
        <svg {...common}>
          <rect x="5" y="8" width="30" height="24" rx="3" />
          <path d="M5 14h30" />
          <circle cx="9" cy="11" r="0.9" fill="currentColor" />
          <circle cx="12" cy="11" r="0.9" fill="currentColor" />
          <path d="M11 20h10M11 25h16" />
        </svg>
      );
    case "fullstack":
      return (
        <svg {...common}>
          <rect x="7" y="5" width="26" height="12" rx="2.5" />
          <path d="M7 9.5h26" />
          <path d="M20 17v6" />
          <rect x="9" y="23" width="22" height="5" rx="2" />
          <rect x="9" y="30" width="22" height="5" rx="2" />
        </svg>
      );
    case "backend":
      return (
        <svg {...common}>
          <rect x="8" y="7" width="24" height="7" rx="2" />
          <rect x="8" y="16.5" width="24" height="7" rx="2" />
          <rect x="8" y="26" width="24" height="7" rx="2" />
          <circle cx="12" cy="10.5" r="0.9" fill="currentColor" />
          <circle cx="12" cy="20" r="0.9" fill="currentColor" />
          <circle cx="12" cy="29.5" r="0.9" fill="currentColor" />
        </svg>
      );
    case "level-1":
    case "level-2":
    case "level-3": {
      const filled = Number(name.slice(-1));
      return (
        <svg {...common}>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={8 + i * 9}
              y={26 - i * 8}
              width="6"
              height={8 + i * 8}
              rx="1.5"
              fill={i < filled ? "currentColor" : "none"}
            />
          ))}
        </svg>
      );
    }
    case "service":
      return (
        <svg {...common}>
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} x={7 + c * 9.5} y={7 + r * 9.5} width="7" height="7" rx="1.5" />
            ))
          )}
        </svg>
      );
    case "product":
      return (
        <svg {...common}>
          <path d="M6 33h28" />
          <path d="M8 28l7-7 5 4 12-13" />
          <path d="M26 12h6v6" />
        </svg>
      );
    case "saas":
      return (
        <svg {...common}>
          <path d="M13 29h16a6 6 0 0 0 0-12 9 9 0 0 0-17.4-2A6.5 6.5 0 0 0 13 29z" />
        </svg>
      );
    case "agency":
      return (
        <svg {...common}>
          <rect x="6" y="13" width="28" height="19" rx="2.5" />
          <path d="M15 13v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
          <path d="M6 21h28" />
        </svg>
      );
    case "clock-1":
    case "clock-2":
    case "clock-4": {
      const quarters = Number(name.slice(-1));
      const angle = (quarters / 4) * 2 * Math.PI;
      const x = 20 + 13 * Math.sin(angle);
      const y = 20 - 13 * Math.cos(angle);
      const wedge =
        quarters === 4
          ? "M20 20m-13 0a13 13 0 1 0 26 0a13 13 0 1 0 -26 0"
          : `M20 20L20 7A13 13 0 ${quarters > 2 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z`;
      return (
        <svg {...common}>
          <path d={wedge} fill="currentColor" stroke="none" opacity="0.28" />
          <circle cx="20" cy="20" r="13" />
          <path d="M20 12v8l5 3" />
        </svg>
      );
    }
  }
}

export interface ChoiceOption<T extends string> {
  value: T;
  name: string;
  detail?: string;
  icon?: IconName;
}

/**
 * A set of large cards, one per option, for one choice. Pressing a card chooses it;
 * the wizard moves on by itself, so there is no separate confirm step.
 */
export function ChoiceCards<T extends string>({
  label,
  options,
  value,
  onChoose,
  compact = false,
}: {
  label: string;
  options: ChoiceOption<T>[];
  value: T;
  onChoose: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? `${styles.cards} ${styles.cardsCompact}` : styles.cards} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={styles.card}
          aria-pressed={value === o.value}
          onClick={() => onChoose(o.value)}
        >
          {o.icon && (
            <span className={styles.cardIcon}>
              <Icon name={o.icon} />
            </span>
          )}
          <span className={styles.cardName}>{o.name}</span>
          {o.detail && <span className={styles.cardDetail}>{o.detail}</span>}
          <span className={styles.cardCheck} aria-hidden="true">
            ✓
          </span>
        </button>
      ))}
    </div>
  );
}
