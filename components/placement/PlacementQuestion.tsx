"use client";

import { useEffect, useId, useRef } from "react";
import { ChoiceList } from "@/components/check/ChoiceList";
import { OrderList } from "@/components/check/OrderList";
import checkStyles from "@/components/check/check.module.css";
import { topicKit } from "@/components/topic/TopicKit";
import type { Question } from "@/content/quiz-types";
import type { Answer } from "@/lib/checkDraw";
import { choiceIndexForKey, choiceLetter } from "@/lib/choiceDisplay";
import { PLAIN_KEYS } from "@/lib/endPopup";
import styles from "./ask.module.css";

export function answerOf(question: Question, picked: string[]): Answer {
  return question.kind === "multi" || question.kind === "order" ? picked : (picked[0] ?? "");
}

function reasonFor(question: Question, canAnswer: boolean): string {
  if (question.kind === "order") return "Happy with the order? Then continue.";
  if (canAnswer) return "Ready when you are.";
  return question.kind === "multi" ? "Pick every answer that applies to continue." : "Pick an answer to continue.";
}

function keysFor(question: Question, canAnswer: boolean): string | null {
  if (question.kind === "order") return null;
  if (canAnswer) return "Enter works too.";
  const last = question.choices.length;
  return `Keys ${choiceLetter(0)}–${choiceLetter(last - 1)} or 1–${last} also pick.`;
}

export function PlacementQuestion({
  question,
  number,
  picked,
  onPick,
  onNext,
  onNotSure,
}: {
  question: Question;
  number: number;
  picked: string[];
  onPick: (picked: string[]) => void;
  onNext: () => void;
  onNotSure: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reasonId = useId();
  const canAnswer = question.kind === "order" || picked.length > 0;
  const legend = `Question ${number}`;
  const keys = keysFor(question, canAnswer);

  useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>("fieldset")?.focus({ preventScroll: true });
  }, [question.id]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (PLAIN_KEYS.has(event.key)) event.stopPropagation();
      if (question.kind === "order") return;
      const target = event.target instanceof Element ? event.target : null;
      if (event.key === "Enter") {
        if (event.repeat || !canAnswer || target?.closest("button, a, summary")) return;
        event.preventDefault();
        onNext();
        return;
      }
      const index = choiceIndexForKey(event.key, question.choices.length);
      if (index === null) return;
      const id = question.choices[index].id;
      event.preventDefault();
      if (question.kind === "multi") {
        onPick(picked.includes(id) ? picked.filter((entry) => entry !== id) : [...picked, id]);
      } else {
        onPick([id]);
      }
      root.querySelector<HTMLElement>(`[data-choice="${id}"] input`)?.focus({ preventScroll: true });
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [question, picked, canAnswer, onPick, onNext]);

  return (
    <div
      className={`${checkStyles.runner} ${styles.quiz}`}
      ref={rootRef}
      data-variant="quiz"
      data-placement-question={question.id}
    >
      <div className={styles.card}>
        {question.kind === "order" ? (
          <OrderList
            key={question.id}
            questionId={question.id}
            legend={legend}
            prompt={question.prompt}
            items={question.items}
            order={picked}
            onChange={onPick}
          />
        ) : (
          <ChoiceList
            key={question.id}
            questionId={question.id}
            legend={legend}
            prompt={question.prompt}
            kind={question.kind}
            choices={question.choices}
            selected={picked}
            onChange={onPick}
          />
        )}
      </div>
      <div className={styles.bar}>
        <p className={styles.reason} id={reasonId}>
          {reasonFor(question, canAnswer)}
          {keys && (
            <span className={styles.keys} aria-hidden="true">
              {" "}
              {keys}
            </span>
          )}
        </p>
        <div className={styles.buttons}>
          <button
            type="button"
            className={`${topicKit.btnGhost} ${styles.action}`}
            data-not-sure=""
            onClick={onNotSure}
          >
            Not sure yet
          </button>
          <button
            type="button"
            className={`${topicKit.btn} ${styles.action}`}
            disabled={!canAnswer}
            aria-describedby={reasonId}
            onClick={onNext}
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
