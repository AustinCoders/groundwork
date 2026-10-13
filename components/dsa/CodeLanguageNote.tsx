"use client";

import { codeLanguageLabel, useCodeLanguage } from "@/lib/codeLanguage";
import styles from "@/components/topic/reader.module.css";

export function CodeLanguageNote() {
  const [language] = useCodeLanguage();
  if (language === "javascript") return null;
  return (
    <p className={styles.codeSwitchNote} role="note">
      Code here is JavaScript only. This chapter has no {codeLanguageLabel(language)} version yet.
    </p>
  );
}
