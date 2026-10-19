"use client";

import { practised, usePractised } from "@/lib/companyQuestionsProgress";
import styles from "./company-questions.module.css";

export function PractisedButton({ id }: { id: string }) {
  const done = usePractised()[id] === true;
  return (
    <button
      type="button"
      className={done ? styles.doneBtn : styles.primaryBtn}
      aria-pressed={done}
      onClick={() => practised.set(id, !done)}
    >
      {done ? "Practised ✓ (tap to undo)" : "Mark as practised"}
    </button>
  );
}
