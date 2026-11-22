"use client";

import { useId, useState } from "react";
import { passwordChecks } from "@/lib/account/errors";
import { passwordStrength } from "@/lib/account/strength";
import styles from "./account.module.css";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={styles.eye}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M4 20 20 4" />}
    </svg>
  );
}

function CheckIcon({ met }: { met: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className={styles.checkIcon}>
      {met ? <path d="M3 8.5 6.5 12 13 4.5" /> : <circle cx="8" cy="8" r="5" />}
    </svg>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
  aside,
  strengthHints,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  autoComplete: "current-password" | "new-password";
  autoFocus?: boolean;
  aside?: React.ReactNode;
  strengthHints?: readonly string[];
}) {
  const id = useId();
  const noteId = useId();
  const capsId = useId();
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const creating = autoComplete === "new-password";
  const strength = passwordStrength(value, strengthHints ?? []);
  const checks = passwordChecks(value);

  function readCaps(event: React.KeyboardEvent<HTMLInputElement>) {
    setCaps(event.getModifierState?.("CapsLock") ?? false);
  }

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {aside}
      </div>
      <div className={styles.inputWrap}>
        <input
          id={id}
          className={styles.input}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={72}
          spellCheck={false}
          autoCapitalize="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={caps ? `${capsId} ${noteId}` : noteId}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={readCaps}
          onKeyUp={readCaps}
          onBlur={() => setCaps(false)}
        />
        <button
          type="button"
          className={styles.reveal}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          aria-controls={id}
          onClick={() => setShown((s) => !s)}
        >
          <EyeIcon open={!shown} />
        </button>
      </div>
      {caps && (
        <p id={capsId} className={styles.caps} role="status">
          Caps Lock is on
        </p>
      )}
      {creating && value.length > 0 && (
        <div className={styles.strength}>
          <div
            className={styles.meter}
            role="meter"
            aria-label="Password strength"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={strength.score}
            aria-valuetext={strength.label}
            data-score={strength.score}
          >
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={n <= Math.max(1, strength.score) ? styles.barOn : styles.bar} />
            ))}
          </div>
          <span className={styles.strengthLabel} data-score={strength.score}>
            {strength.label}
          </span>
        </div>
      )}
      <div id={noteId} className={error ? styles.fieldError : styles.fieldHint} aria-live="polite">
        {error ??
          (creating ? (
            <>
              <ul className={styles.checks} aria-label="Password rules">
                {checks.map((c) => (
                  <li key={c.label} className={c.met ? styles.met : undefined}>
                    <CheckIcon met={c.met} />
                    {c.label}
                    <span className="visually-hidden">{c.met ? " (done)" : " (not yet)"}</span>
                  </li>
                ))}
              </ul>
              {value.length > 0 && strength.tip && <span className={styles.tip}>{strength.tip}</span>}
            </>
          ) : (
            ""
          ))}
      </div>
    </div>
  );
}
