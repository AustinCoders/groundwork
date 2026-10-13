"use client";

import { useEffect, useRef } from "react";
import { ChoiceList } from "@/components/check/ChoiceList";
import { OrderList } from "@/components/check/OrderList";
import checkStyles from "@/components/check/check.module.css";
import type { Question } from "@/content/quiz-types";
import type { Answer } from "@/lib/checkDraw";
import { PLAIN_KEYS } from "@/lib/endPopup";

export function answerOf(question: Question, picked: string[]): Answer {
  return question.kind === "multi" || question.kind === "order" ? picked : (picked[0] ?? "");
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
  const canAnswer = question.kind === "order" || picked.length > 0;
  const legend = `Question ${number}`;

  useEffect(() => {
    rootRef.current?.querySelector<HTMLElement>("fieldset")?.focus({ preventScroll: true });
  }, [question.id]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const keepKeysHere = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (PLAIN_KEYS.has(event.key)) event.stopPropagation();
    };
    root.addEventListener("keydown", keepKeysHere);
    return () => root.removeEventListener("keydown", keepKeysHere);
  }, []);

  return (
    <div className={checkStyles.runner} ref={rootRef} data-placement-question={question.id}>
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
      <div className={checkStyles.actions}>
        <button type="button" className={checkStyles.primary} disabled={!canAnswer} onClick={onNext}>
          Next
        </button>
        <button type="button" className={checkStyles.secondary} data-not-sure="" onClick={onNotSure}>
          Not sure yet
        </button>
      </div>
    </div>
  );
}
