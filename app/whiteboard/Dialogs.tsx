"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./whiteboard.module.css";

function useModal() {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return ref;
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
  const ref = useModal();
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <h2 id={titleId} className={styles.modalTitle}>
        {title}
      </h2>
      <div className={styles.modalBody}>{body}</div>
      <div className={styles.modalActions}>
        <button type="button" className={styles.modalBtn} onClick={onClose} autoFocus>
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.modalBtn} ${danger ? styles.modalDanger : styles.modalPrimary}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}

export function NameDialog({
  title,
  label,
  initial,
  confirmLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  initial: string;
  confirmLabel: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const ref = useModal();
  const titleId = useId();
  const inputId = useId();
  const [name, setName] = useState(initial);
  const clean = name.trim().slice(0, 60);
  return (
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (!clean) return;
          onSubmit(clean);
          onClose();
        }}
      >
        <h2 id={titleId} className={styles.modalTitle}>
          {title}
        </h2>
        <label htmlFor={inputId} className={styles.modalLabel}>
          {label}
        </label>
        <input
          id={inputId}
          className={styles.modalInput}
          value={name}
          maxLength={60}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => setName(e.target.value)}
        />
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`${styles.modalBtn} ${styles.modalPrimary}`} disabled={!clean}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
