"use client";

import { useId } from "react";
import styles from "./account.module.css";

export function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className={styles.choice}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.choiceRow}>
        {options.map((o) => (
          <label key={o.value} className={styles.choicePill} data-checked={value === o.value || undefined}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
