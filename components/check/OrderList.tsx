"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { OrderItem } from "@/content/quiz-types";
import { RichHtml } from "./RichHtml";
import styles from "./check.module.css";

type Direction = "up" | "down";

export function OrderList({
  questionId,
  legend,
  prompt,
  items,
  order,
  onChange,
  checked = false,
  correct = [],
  why,
}: {
  questionId: string;
  legend: string;
  prompt: string;
  items: OrderItem[];
  order: string[];
  onChange: (order: string[]) => void;
  checked?: boolean;
  correct?: string[];
  why?: string;
}) {
  const uid = useId();
  const promptId = `${uid}-prompt`;
  const byId = new Map(items.map((item) => [item.id, item]));
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const [announcement, setAnnouncement] = useState({ text: "", moves: 0 });
  const refocus = useRef<{ id: string; direction: Direction } | null>(null);

  useEffect(() => {
    const pending = refocus.current;
    if (!pending) return;
    refocus.current = null;
    const at = order.indexOf(pending.id);
    const stillMovable = pending.direction === "up" ? at > 0 : at < order.length - 1;
    const direction = stillMovable ? pending.direction : pending.direction === "up" ? "down" : "up";
    buttons.current.get(`${pending.id}:${direction}`)?.focus();
  }, [order]);

  function move(id: string, direction: Direction) {
    const from = order.indexOf(id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (checked || to < 0 || to >= order.length) return;
    const next = [...order];
    [next[from], next[to]] = [next[to], next[from]];
    const name = document.getElementById(`${uid}-${id}-text`)?.textContent ?? "Item";
    setAnnouncement((before) => ({
      text: `${name} moved to position ${to + 1} of ${order.length}`,
      moves: before.moves + 1,
    }));
    refocus.current = { id, direction };
    onChange(next);
  }

  return (
    <fieldset className={styles.fieldset} data-question={questionId} aria-describedby={promptId} tabIndex={-1}>
      <legend className={styles.legend} tabIndex={-1}>
        {legend}
      </legend>
      <RichHtml id={promptId} html={prompt} label={`Code in ${legend.toLowerCase()}`} className={styles.prompt} />
      <p className={styles.hint}>Put the steps in order with the Move up and Move down buttons.</p>
      <ol className={styles.orderList} role="list">
        {order.map((id, at) => {
          const item = byId.get(id)!;
          const textId = `${uid}-${id}-text`;
          const upId = `${uid}-${id}-up`;
          const downId = `${uid}-${id}-down`;
          const inPlace = checked && correct[at] === id;
          const state = checked ? (inPlace ? "right" : "wrong") : "plain";
          return (
            <li key={id} className={styles.orderItem} data-state={state} data-item={id}>
              <span className={styles.orderPosition} aria-hidden="true">
                {at + 1}
              </span>
              <span className={styles.orderText}>
                <span className="visually-hidden">
                  Position {at + 1} of {order.length}.{" "}
                </span>
                <span id={textId} dangerouslySetInnerHTML={{ __html: item.text }} />
                {checked && (
                  <span className={styles.tags}>
                    {inPlace ? "In the right place" : `Not quite, this belongs at position ${correct.indexOf(id) + 1}`}
                  </span>
                )}
              </span>
              <span className={styles.orderButtons}>
                <button
                  type="button"
                  id={upId}
                  ref={(node) => {
                    if (node) buttons.current.set(`${id}:up`, node);
                    else buttons.current.delete(`${id}:up`);
                  }}
                  className={styles.moveButton}
                  aria-labelledby={`${upId} ${textId}`}
                  disabled={checked || at === 0}
                  onClick={() => move(id, "up")}
                >
                  Move up
                </button>
                <button
                  type="button"
                  id={downId}
                  ref={(node) => {
                    if (node) buttons.current.set(`${id}:down`, node);
                    else buttons.current.delete(`${id}:down`);
                  }}
                  className={styles.moveButton}
                  aria-labelledby={`${downId} ${textId}`}
                  disabled={checked || at === order.length - 1}
                  onClick={() => move(id, "down")}
                >
                  Move down
                </button>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement.text}
        {announcement.moves % 2 === 1 ? "\u200b" : ""}
      </p>
      {checked && (
        <div className={styles.why}>
          <p className={styles.tags}>The right order</p>
          <ol className={styles.rightOrder}>
            {correct.map((id) => (
              <li key={id} dangerouslySetInnerHTML={{ __html: byId.get(id)!.text }} />
            ))}
          </ol>
          {why && <span dangerouslySetInnerHTML={{ __html: why }} />}
        </div>
      )}
    </fieldset>
  );
}
