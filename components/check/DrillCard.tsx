"use client";

import { useId, useRef, useState } from "react";
import type { DesignDrill, DrillItem } from "@/content/drill-types";
import { RichHtml } from "./RichHtml";
import styles from "./drill.module.css";

export function drillVerdict(covered: number, total: number): string {
  if (covered === total) return "Everything on the list. This is a complete answer.";
  if (covered * 5 >= total * 4) return "A strong answer. Read the headings below for the few gaps.";
  if (covered * 2 >= total) return "Half or more covered. The links below go to what is missing.";
  return "Mostly gaps. Read the linked headings, then try the drill again from a blank board.";
}

function whiteboardHref(chapterId: string): string {
  return `/whiteboard?template=${encodeURIComponent(chapterId)}`;
}

export function DrillCard({
  chapterId,
  drill,
  titles,
}: {
  chapterId: string;
  drill: DesignDrill;
  titles: Record<string, string>;
}) {
  const [scoring, setScoring] = useState(false);
  const [covered, setCovered] = useState<ReadonlySet<string>>(() => new Set());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const total = drill.checklist.length;

  function toggle(id: string) {
    setCovered((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startScoring() {
    setScoring(true);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function startOver() {
    setScoring(false);
    setCovered(new Set());
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  function sectionLink(item: DrillItem) {
    return (
      <a className={styles.sectionLink} href={`#${item.section}`}>
        Read: {titles[item.section] ?? item.section}
      </a>
    );
  }

  return (
    <div className={styles.drill}>
      <h3 className={styles.title} ref={titleRef} tabIndex={-1} id={headingId}>
        {drill.title}
      </h3>
      <RichHtml html={drill.prompt} label="Design prompt" className={styles.prompt} />
      <p className={styles.note}>
        Work it out on the whiteboard or on paper first. Nothing on this card is saved, and the checklist stays hidden
        until you ask for it.
      </p>
      {!scoring && (
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={startScoring}>
            Score my answer
          </button>
          <a className={styles.secondary} href={whiteboardHref(chapterId)} target="_blank" rel="noreferrer">
            Open a starter whiteboard
          </a>
        </div>
      )}
      {scoring && (
        <div className={styles.scoring}>
          <h4 className={styles.heading} ref={headingRef} tabIndex={-1}>
            Tick what your answer covered
          </h4>
          <p className={styles.status} role="status" aria-live="polite" data-complete={covered.size === total}>
            {covered.size} of {total} covered
            <span className="visually-hidden">. {drillVerdict(covered.size, total)}</span>
          </p>
          <p className={styles.verdict} aria-hidden="true">
            {drillVerdict(covered.size, total)}
          </p>
          <ul className={styles.items}>
            {drill.checklist.map((item) => {
              const done = covered.has(item.id);
              return (
                <li key={item.id} className={styles.item} data-state={done ? "covered" : "open"}>
                  <label className={styles.itemLabel}>
                    <input type="checkbox" className={styles.box} checked={done} onChange={() => toggle(item.id)} />
                    <RichHtml html={item.text} label="Checklist item" className={styles.itemText} />
                  </label>
                  {!done && sectionLink(item)}
                </li>
              );
            })}
          </ul>
          <h4 className={styles.heading}>Common mistakes</h4>
          <ul className={styles.mistakes}>
            {drill.mistakes.map((item) => (
              <li key={item.id} className={styles.mistake}>
                <RichHtml html={item.text} label="Common mistake" className={styles.itemText} />
                {sectionLink(item)}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={startOver}>
              Start the drill again
            </button>
            <a className={styles.secondary} href={whiteboardHref(chapterId)} target="_blank" rel="noreferrer">
              Open a starter whiteboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
