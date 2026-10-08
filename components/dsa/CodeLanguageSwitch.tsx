"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { applyCodeLanguage } from "@/components/reader/codeLanguages";
import { CODE_LANGUAGES, codeLanguageLabel, useCodeLanguage, type CodeLanguage } from "@/lib/codeLanguage";
import styles from "@/components/topic/reader.module.css";

export function CodeLanguageSwitch({
  chapterId,
  bodyRef,
}: {
  chapterId: string;
  bodyRef: RefObject<HTMLDivElement | null>;
}) {
  const [language, setLanguage] = useCodeLanguage();
  const [announcement, setAnnouncement] = useState("");
  const chosen = useRef<CodeLanguage | null>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let current = true;
    applyCodeLanguage(body, chapterId, language, () => current).then((ok) => {
      if (!current || chosen.current !== language) return;
      chosen.current = null;
      const label = codeLanguageLabel(language);
      setAnnouncement(ok ? `Code shown in ${label}` : `Could not load ${label} code, showing JavaScript`);
    });
    return () => {
      current = false;
    };
  }, [bodyRef, chapterId, language]);

  const choose = (next: CodeLanguage) => {
    if (next === language) return;
    chosen.current = next;
    setLanguage(next);
  };

  return (
    <div className={styles.codeSwitch}>
      <div role="group" aria-label="Code language" className={styles.codeSwitchGroup}>
        <span className={styles.codeSwitchLabel}>Code: {codeLanguageLabel(language)}</span>
        {CODE_LANGUAGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={styles.codeSwitchButton}
            aria-pressed={language === entry.id}
            onClick={() => choose(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <span role="status" className="visually-hidden">
        {announcement}
      </span>
    </div>
  );
}
