"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./Modal.module.css";

function useModal() {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return ref;
}

function Shell({
  onClose,
  wide,
  children,
}: {
  onClose: () => void;
  wide?: boolean;
  children: (titleId: string) => React.ReactNode;
}) {
  const ref = useModal();
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      className={`${styles.modal}${wide ? ` ${styles.wide}` : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {children(titleId)}
    </dialog>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Shell onClose={onClose}>
      {(titleId) => (
        <>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <div className={styles.body}>{body}</div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose} autoFocus>
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.btn} ${danger ? styles.danger : styles.primary}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </>
      )}
    </Shell>
  );
}

export function NameDialog({
  title,
  label,
  initial,
  confirmLabel,
  hint,
  selectUntil,
  validate,
  wide,
  children,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  initial: string;
  confirmLabel: string;
  hint?: (name: string) => React.ReactNode;
  selectUntil?: (name: string) => number;
  validate?: (name: string) => string | null;
  wide?: boolean;
  children?: React.ReactNode;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const inputId = useId();
  const errorId = useId();
  const [name, setName] = useState(initial);
  const clean = name.trim().slice(0, 60);
  const error = clean ? (validate?.(clean) ?? null) : null;
  return (
    <Shell onClose={onClose} wide={wide}>
      {(titleId) => (
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            if (!clean || error) return;
            onSubmit(clean);
            onClose();
          }}
        >
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
          <input
            id={inputId}
            className={styles.input}
            value={name}
            maxLength={60}
            autoFocus
            spellCheck={false}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            onFocus={(e) => {
              const end = selectUntil?.(e.currentTarget.value);
              if (end && end > 0) e.currentTarget.setSelectionRange(0, end);
              else e.currentTarget.select();
            }}
            onChange={(e) => setName(e.target.value)}
          />
          <p id={errorId} className={error ? styles.error : styles.hint} aria-live="polite">
            {error ?? hint?.(clean) ?? " "}
          </p>
          {children}
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={!clean || Boolean(error)}>
              {confirmLabel}
            </button>
          </div>
        </form>
      )}
    </Shell>
  );
}

export interface ReportChoice {
  id: string;
  label: string;
}

export function ReportDialog({
  title,
  reasons,
  onSubmit,
  onClose,
}: {
  title: string;
  reasons: readonly ReportChoice[];
  onSubmit: (reason: string, note: string) => void;
  onClose: () => void;
}) {
  const noteId = useId();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  return (
    <Shell onClose={onClose}>
      {(titleId) => (
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason) return;
            onSubmit(reason, note.trim().slice(0, 500));
            onClose();
          }}
        >
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <fieldset className={styles.choices}>
            <legend className={styles.label}>What is wrong?</legend>
            {reasons.map((r) => (
              <label key={r.id} className={styles.choice}>
                <input
                  type="radio"
                  name="report-reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                />
                {r.label}
              </label>
            ))}
          </fieldset>
          <label htmlFor={noteId} className={styles.label}>
            Anything else? (optional)
          </label>
          <textarea
            id={noteId}
            className={`${styles.input} ${styles.area}`}
            value={note}
            maxLength={500}
            rows={3}
            onChange={(e) => setNote(e.target.value)}
          />
          <p className={styles.hint}>We read every report. They never see who sent it.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.danger}`} disabled={!reason}>
              Send report
            </button>
          </div>
        </form>
      )}
    </Shell>
  );
}
