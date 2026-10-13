"use client";

import { Toggle, ToggleGroup } from "@/components/topic/TopicKit";
import styles from "./shell.module.css";

export function BudgetChips({
  steps,
  budget,
  outcome,
  onPick,
}: {
  steps: readonly number[];
  budget: number;
  outcome: string;
  onPick: (minutes: number) => void;
}) {
  return (
    <div className={styles.budget}>
      <ToggleGroup label="Reading time budget" lead="I've got">
        {steps.map((step) => (
          <Toggle key={step} pressed={budget === step} onClick={() => onPick(step)}>
            {step}m
          </Toggle>
        ))}
      </ToggleGroup>
      <p className={styles.budgetOut}>{outcome}</p>
    </div>
  );
}
