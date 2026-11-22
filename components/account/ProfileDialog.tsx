"use client";

import { useEffect, useId, useRef, useState } from "react";
import { nameProblem } from "@/lib/account/errors";
import { updateProfile, useAccount, type Experience, type Goal, type TargetRole } from "@/lib/account/session";
import { initials } from "./AccountChip";
import { Choice } from "./Choice";
import { GOALS, LEVELS, ROLES } from "./profileOptions";
import styles from "./account.module.css";

export function ProfileDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { user, profile } = useAccount();
  const [name, setName] = useState(profile?.displayName || user?.name || "");
  const [goal, setGoal] = useState<Goal | null>(profile?.goal ?? null);
  const [experience, setExperience] = useState<Experience | null>(profile?.experience ?? null);
  const [role, setRole] = useState<TargetRole | null>(profile?.targetRole ?? null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameError = tried ? nameProblem(name) : null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input")?.focus();
  }, []);

  useEffect(() => {
    if (!saved) return;
    const id = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(id);
  }, [saved, onClose]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (nameProblem(name)) return;
    setBusy(true);
    setError(null);
    const result = await updateProfile({ displayName: name, goal, experience, targetRole: role });
    setBusy(false);
    if (result.ok) setSaved(true);
    else setError(result.error);
  }

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles.profileDialog}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        ×
      </button>
      <form className={styles.inner} onSubmit={save} noValidate>
        <div className={styles.profileTop}>
          <span className={styles.profileAvatar} aria-hidden="true">
            {initials(name || "?")}
          </span>
          <div>
            <h2 id={titleId} className={styles.profileTitle}>
              Edit your profile
            </h2>
            <p className={styles.welcomeHello}>{user?.email}</p>
          </div>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            value={name}
            maxLength={60}
            autoComplete="name"
            aria-invalid={nameError ? true : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
          {nameError && <span className={styles.fieldError}>{nameError}</span>}
        </label>

        <Choice legend="What brings you here?" options={GOALS} value={goal} onChange={setGoal} />
        <Choice legend="How much have you built so far?" options={LEVELS} value={experience} onChange={setExperience} />
        <Choice legend="Which role are you aiming for?" options={ROLES} value={role} onChange={setRole} />

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <div className={styles.profileActions}>
          <button type="button" className={styles.profileCancel} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submit} disabled={busy || saved} data-saved={saved || undefined}>
            {saved ? "✓ Saved" : busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
