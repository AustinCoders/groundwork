"use client";

import { useId } from "react";
import type { Choice } from "@/content/quiz-types";
import { RichHtml } from "./RichHtml";
import styles from "./check.module.css";

export type ChoiceKind = "single" | "multi" | "predict";

function tagsFor(picked: boolean, right: boolean, multi: boolean): string[] {
  const tags: string[] = [];
  if (right) tags.push(multi ? "Right choice" : "Right answer");
  if (picked) tags.push(right ? "Your pick" : "Your pick, not quite");
  return tags;
}

export function ChoiceList({
  questionId,
  legend,
  prompt,
  kind,
  choices,
  selected,
  onChange,
  checked = false,
  correct = [],
}: {
  questionId: string;
  legend: string;
  prompt: string;
  kind: ChoiceKind;
  choices: Choice[];
  selected: string[];
  onChange: (selected: string[]) => void;
  checked?: boolean;
  correct?: string[];
}) {
  const uid = useId();
  const multi = kind === "multi";
  const promptId = `${uid}-prompt`;

  function toggle(id: string) {
    if (checked) return;
    if (!multi) return onChange([id]);
    onChange(selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id]);
  }

  return (
    <fieldset className={styles.fieldset} data-question={questionId} aria-describedby={promptId} tabIndex={-1}>
      <legend className={styles.legend}>{legend}</legend>
      <RichHtml id={promptId} html={prompt} label={`Code in ${legend.toLowerCase()}`} className={styles.prompt} />
      <p className={styles.hint}>{multi ? "Select every answer that applies." : "Select one answer."}</p>
      <ul className={styles.choices}>
        {choices.map((choice) => {
          const picked = selected.includes(choice.id);
          const right = correct.includes(choice.id);
          const state = checked ? (right ? "right" : picked ? "wrong" : "plain") : picked ? "picked" : "plain";
          const tags = checked ? tagsFor(picked, right, multi) : [];
          const whyId = `${uid}-${choice.id}-why`;
          return (
            <li key={choice.id} className={styles.choice} data-state={state} data-choice={choice.id}>
              <label className={styles.choiceLabel}>
                <input
                  className={styles.choiceInput}
                  type={multi ? "checkbox" : "radio"}
                  name={`${uid}-choice`}
                  value={choice.id}
                  checked={picked}
                  disabled={checked}
                  aria-describedby={checked ? whyId : undefined}
                  onChange={() => toggle(choice.id)}
                />
                <span className={styles.choiceText} dangerouslySetInnerHTML={{ __html: choice.text }} />
              </label>
              {checked && (
                <div className={styles.why} id={whyId}>
                  {tags.length > 0 && <p className={styles.tags}>{tags.join(" · ")}</p>}
                  <span dangerouslySetInnerHTML={{ __html: choice.why }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
