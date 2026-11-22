"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/Modal";
import { SignInGate } from "@/components/account/SignInGate";
import { initials } from "@/components/account/AccountChip";
import { Band } from "@/components/topic/TopicKit";
import { nameProblem, passwordChecks, passwordProblem } from "@/lib/account/errors";
import {
  deleteAccount,
  eraseSavedProgress,
  exportMyData,
  signOut,
  syncAccountNow,
  updatePassword,
  updateProfile,
  useAccount,
  useSyncStatus,
  type Experience,
  type Goal,
  type Profile,
  type TargetRole,
} from "@/lib/account/session";
import styles from "./account.module.css";

const GOALS: { value: Goal; label: string }[] = [
  { value: "learn", label: "Learn the foundations" },
  { value: "interview", label: "Prepare for interviews" },
  { value: "switch", label: "Switch jobs or roles" },
  { value: "upskill", label: "Level up at work" },
];

const LEVELS: { value: Experience; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const ROLES: { value: TargetRole; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "fullstack", label: "Full stack" },
  { value: "other", label: "Something else" },
];

const PROVIDER_NAME: Record<string, string> = { email: "Email and password", google: "Google", github: "GitHub" };

const SYNC_TEXT: Record<string, string> = {
  idle: "Up to date",
  syncing: "Syncing…",
  error: "Last sync failed",
  offline: "Offline: changes are kept and sent when you are back online",
  off: "Not syncing",
};

function when(at: number | null): string {
  if (!at) return "not yet";
  return new Date(at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T | null) => void;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <select
        className={styles.input}
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
      >
        <option value="">Not set</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProfileForm({ profile, fallbackName }: { profile: Profile | null; fallbackName: string }) {
  const [name, setName] = useState(profile?.displayName ?? fallbackName);
  const [goal, setGoal] = useState<Goal | null>(profile?.goal ?? null);
  const [experience, setExperience] = useState<Experience | null>(profile?.experience ?? null);
  const [role, setRole] = useState<TargetRole | null>(profile?.targetRole ?? null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const nameError = tried ? nameProblem(name) : null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (nameProblem(name)) return;
    setBusy(true);
    const result = await updateProfile({ displayName: name, goal, experience, targetRole: role });
    setBusy(false);
    setMessage(result.ok ? { ok: true, text: "Saved." } : { ok: false, text: result.error });
  }

  return (
    <form className={styles.card} onSubmit={save} noValidate>
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
            setMessage(null);
          }}
        />
        {nameError && <span className={styles.error}>{nameError}</span>}
      </label>
      <div className={styles.grid}>
        <Select label="Your goal" value={goal} options={GOALS} onChange={setGoal} />
        <Select label="Your level" value={experience} options={LEVELS} onChange={setExperience} />
        <Select label="Role you are aiming for" value={role} options={ROLES} onChange={setRole} />
      </div>
      <div className={styles.row}>
        <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
        {message && (
          <span className={message.ok ? styles.ok : styles.error} role="status">
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

function PasswordForm() {
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const error = tried ? passwordProblem(password) : null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (passwordProblem(password)) return;
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.ok) {
      setPassword("");
      setTried(false);
    }
    setMessage(result.ok ? { ok: true, text: "Password changed." } : { ok: false, text: result.error });
  }

  return (
    <form className={styles.card} onSubmit={save} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input
          className={styles.input}
          type="password"
          value={password}
          maxLength={72}
          autoComplete="new-password"
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setPassword(e.target.value);
            setMessage(null);
          }}
        />
        <span className={error ? styles.error : styles.hint}>
          {error ??
            passwordChecks(password)
              .map((c) => `${c.met ? "●" : "○"} ${c.label}`)
              .join("   ")}
        </span>
      </label>
      <div className={styles.row}>
        <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </button>
        {message && (
          <span className={message.ok ? styles.ok : styles.error} role="status">
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}

type Pending = "erase" | "delete" | "sign-out-clear" | "everywhere" | null;

function Signed() {
  const account = useAccount();
  const sync = useSyncStatus();
  const [pending, setPending] = useState<Pending>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = account.user;
  if (!user) return null;
  const name = account.profile?.displayName || user.name;
  const usesPassword = user.providers.includes("email");

  function download() {
    const blob = new Blob([exportMyData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `groundwork-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function act(task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) setError(result.error ?? "Something went wrong. Try again.");
  }

  return (
    <>
      <Band no="01" id="account-who" label="Account" title={`Hello, ${name}`}>
        <div className={styles.card}>
          <div className={styles.who}>
            <span className={styles.bigAvatar} aria-hidden="true">
              {initials(name)}
            </span>
            <div>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.meta}>
                Signed in with {user.providers.map((p) => PROVIDER_NAME[p] ?? p).join(", ") || "email"} · member since{" "}
                {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                {account.profile?.plan === "pro" ? " · Pro" : " · Free plan"}
              </p>
            </div>
          </div>
        </div>
      </Band>

      <Band
        no="02"
        id="account-profile"
        label="Profile"
        title="About you"
        sub="Used to suggest where to start. Optional."
      >
        <ProfileForm key={account.profile ? "loaded" : "empty"} profile={account.profile} fallbackName={user.name} />
      </Band>

      <Band
        no="03"
        id="account-sync"
        label="Sync"
        title="Your saved progress"
        sub="Progress, review marks, quiz results, mock history, boards and code drafts are saved to your account and merged across devices."
      >
        <div className={styles.card}>
          <dl className={styles.facts}>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={styles.dot} data-state={sync.state} aria-hidden="true" /> {SYNC_TEXT[sync.state]}
              </dd>
            </div>
            <div>
              <dt>Last synced</dt>
              <dd>{when(sync.lastSyncedAt)}</dd>
            </div>
            <div>
              <dt>Items saved</dt>
              <dd>{sync.keys}</dd>
            </div>
          </dl>
          {sync.error && sync.state === "error" && <p className={styles.error}>{sync.error}</p>}
          <div className={styles.row}>
            <button type="button" className={styles.btn} onClick={() => void syncAccountNow()}>
              Sync now
            </button>
            <button type="button" className={styles.btn} onClick={download}>
              Download my data
            </button>
            <button type="button" className={`${styles.btn} ${styles.ghostDanger}`} onClick={() => setPending("erase")}>
              Erase saved progress
            </button>
          </div>
        </div>
      </Band>

      {usesPassword && (
        <Band no="04" id="account-password" label="Security" title="Password">
          <PasswordForm />
        </Band>
      )}

      <Band no={usesPassword ? "05" : "04"} id="account-session" label="Session" title="Sign out">
        <div className={styles.card}>
          <p className={styles.meta}>
            On a shared computer, remove this device&rsquo;s copy when you sign out. Your account keeps everything.
          </p>
          <div className={styles.row}>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => void act(() => signOut())}>
              Sign out
            </button>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => setPending("sign-out-clear")}>
              Sign out and remove this device&rsquo;s copy
            </button>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => setPending("everywhere")}>
              Sign out on every device
            </button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </Band>

      <Band no={usesPassword ? "06" : "05"} id="account-delete" label="Danger zone" title="Delete account">
        <div className={`${styles.card} ${styles.dangerCard}`}>
          <p className={styles.meta}>
            Deletes your account, your profile and everything saved to it, right away. This cannot be undone. The copy
            on this device stays until you clear it.
          </p>
          <label className={styles.field}>
            <span className={styles.label}>Type DELETE to confirm</span>
            <input
              className={styles.input}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setTyped(e.target.value)}
            />
          </label>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.btn} ${styles.danger}`}
              disabled={typed !== "DELETE" || busy}
              onClick={() => setPending("delete")}
            >
              Delete my account
            </button>
          </div>
        </div>
      </Band>

      {pending === "erase" && (
        <ConfirmDialog
          title="Erase saved progress?"
          body={
            <p>
              This removes your progress, review marks, quiz results, mock history, boards and code drafts from your
              account and from this device. Other devices keep their copy until they sync. It cannot be undone.
            </p>
          }
          confirmLabel="Erase progress"
          danger
          onConfirm={() => void act(eraseSavedProgress)}
          onClose={() => setPending(null)}
        />
      )}
      {pending === "sign-out-clear" && (
        <ConfirmDialog
          title="Sign out and clear this device?"
          body={<p>Your account keeps everything. This browser forgets your progress, boards and code drafts.</p>}
          confirmLabel="Sign out and clear"
          onConfirm={() => void act(() => signOut({ clearDevice: true }))}
          onClose={() => setPending(null)}
        />
      )}
      {pending === "everywhere" && (
        <ConfirmDialog
          title="Sign out on every device?"
          body={<p>Every browser where you are signed in will need to sign in again.</p>}
          confirmLabel="Sign out everywhere"
          onConfirm={() => void act(() => signOut({ everywhere: true }))}
          onClose={() => setPending(null)}
        />
      )}
      {pending === "delete" && (
        <ConfirmDialog
          title="Delete your account for good?"
          body={<p>Your account and everything saved to it are deleted now. This cannot be undone.</p>}
          confirmLabel="Delete account"
          danger
          onConfirm={() => void act(deleteAccount)}
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}

export function AccountView() {
  return (
    <SignInGate feature="account">
      <Signed />
    </SignInGate>
  );
}
