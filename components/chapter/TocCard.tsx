"use client";

import type { ReactNode } from "react";
import { TopIcon } from "@/components/practice/TopIcon";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import { openCheckOnClick } from "@/lib/checkOpen";
import { prefersMotion } from "@/lib/dom";
import type { TocItem } from "./types";
import { ReaderAside } from "./ChapterKit";
import styles from "./rail.module.css";

const MARK_GLYPH: Record<string, string> = { knew: "✓", shaky: "?", blank: "–" };
const MARK_NAME: Record<string, string> = { knew: "knew it", shaky: "shaky", blank: "blank" };

export function TocCard({
  toc,
  active,
  pct,
  read,
  onToggleRead,
  tickHref,
  label = "On this page",
  item = "Section",
  unit = "chapters",
  marks,
  before,
  after,
}: {
  toc: TocItem[];
  active: string | null;
  pct: number;
  read: boolean;
  onToggleRead: () => void;
  tickHref?: string | null;
  label?: string;
  item?: string;
  unit?: string;
  marks?: Record<string, string | undefined>;
  before?: ReactNode;
  after?: ReactNode;
}) {
  const at = toc.findIndex((t) => t.id === active);
  const readClass = `${styles.readBtn}${read ? ` ${styles.readBtnOn}` : ""}`;
  const readBody = (
    <>
      <span className={styles.readTick} aria-hidden="true">
        {read ? "✓" : ""}
      </span>
      {read ? "Read" : "Mark as read"}
    </>
  );
  return (
    <ReaderAside label={label}>
      {before}
      {toc.length > 0 && (
        <section className={`${styles.tocCard}${marks ? ` ${styles.tocDense}` : ""}`} aria-label="Sections">
          <Eyebrow as="p" no={String(Math.max(at, 0) + 1).padStart(2, "0")}>
            {label}
          </Eyebrow>
          <span className={styles.trail} aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </span>
          <p className={styles.tocMeta}>
            {active ? `${item} ${at + 1} of ${toc.length}` : `${toc.length} ${item.toLowerCase()}s`} · {pct}%
          </p>
          <ol className={styles.toc}>
            {toc.map((t, i) => {
              const state = i === at ? "now" : i < at ? "past" : "next";
              const mark = marks?.[t.id];
              return (
                <li key={t.id} data-state={state}>
                  <a href={`#${t.id}`} aria-current={state === "now" ? "location" : undefined}>
                    <span className={kit.code}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.tocText}>{t.text}</span>
                    {mark && (
                      <span className={styles.tocMark} data-mark={mark} role="img" aria-label={MARK_NAME[mark]}>
                        {MARK_GLYPH[mark]}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {after}
      {tickHref ? (
        <a className={readClass} href={tickHref} onClick={openCheckOnClick}>
          {readBody}
        </a>
      ) : (
        <button type="button" className={readClass} aria-pressed={read} onClick={onToggleRead}>
          {readBody}
        </button>
      )}
      <div className={styles.sideFoot}>
        <button
          type="button"
          className={styles.topBtn}
          onClick={() => window.scrollTo({ top: 0, behavior: prefersMotion() ? "smooth" : "auto" })}
          disabled={pct === 0}
        >
          <TopIcon name="prev" size={14} />
          Back to top
        </button>
        <p className={styles.keys}>
          <kbd>[</kbd>
          <kbd>]</kbd> {unit} · <kbd>t</kbd> top
        </p>
      </div>
    </ReaderAside>
  );
}
