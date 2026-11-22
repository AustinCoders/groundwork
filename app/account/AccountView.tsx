"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { ConfirmDialog } from "@/components/Modal";
import { SignInGate } from "@/components/account/SignInGate";
import { initials } from "@/components/account/AccountChip";
import { AppearancePicker } from "@/components/AppearancePicker";
import { useCountUp } from "@/components/account/useCountUp";
import { authProviders, type OAuthProviderId } from "@/lib/account/config";
import { codeProblem, emailProblem, nameProblem, passwordChecks, passwordProblem } from "@/lib/account/errors";
import {
  changeEmail,
  confirmTotp,
  deleteAccount,
  linkedIdentities,
  linkProvider,
  removeTotp,
  startTotp,
  totpFactors,
  unlinkProvider,
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
  type LinkedIdentity,
  type TargetRole,
  type TotpEnrollment,
  type TotpFactor,
} from "@/lib/account/session";
import { computeStats, type Stats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
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

function PasswordForm({ setting }: { setting: boolean }) {
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
    setMessage(
      result.ok
        ? { ok: true, text: setting ? "Password set. You can now sign in with your email too." : "Password changed." }
        : { ok: false, text: result.error }
    );
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
          {busy ? "Saving…" : setting ? "Set password" : "Change password"}
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

function EmailForm({ current }: { current: string }) {
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const same = email.trim().toLowerCase() === current.toLowerCase();
  const error = tried ? (emailProblem(email) ?? (same ? "That is already your email." : null)) : null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (emailProblem(email) || same) return;
    setBusy(true);
    const result = await changeEmail(email);
    setBusy(false);
    setMessage(
      result.ok
        ? {
            ok: true,
            text: `We sent a link to ${current} and to ${email.trim()}. Open both and the change is done.`,
          }
        : { ok: false, text: result.error }
    );
  }

  return (
    <form className={styles.card} onSubmit={save} noValidate>
      <p className={styles.meta}>
        Your email now: <strong>{current}</strong>
      </p>
      <label className={styles.field}>
        <span className={styles.label}>New email</span>
        <input
          className={styles.input}
          type="email"
          value={email}
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            setMessage(null);
          }}
        />
        {error && <span className={styles.error}>{error}</span>}
      </label>
      <div className={styles.row}>
        <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={busy}>
          {busy ? "Sending…" : "Change email"}
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

function Methods() {
  const providers = authProviders();
  const [identities, setIdentities] = useState<LinkedIdentity[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    void linkedIdentities().then((result) => {
      if (!live) return;
      if (result.ok) setIdentities(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [reload]);

  async function connect(provider: OAuthProviderId) {
    setBusy(provider);
    setError(null);
    const result = await linkProvider(provider);
    if (!result.ok) {
      setBusy(null);
      setError(result.error);
    }
  }

  async function remove(provider: string) {
    setBusy(provider);
    setError(null);
    const result = await unlinkProvider(provider);
    setBusy(null);
    if (result.ok) setReload((n) => n + 1);
    else setError(result.error);
  }

  const linked = identities ?? [];
  const rows: { id: string; name: string }[] = [
    { id: "email", name: "Email and password" },
    ...providers.map((id) => ({ id, name: PROVIDER_NAME[id] ?? id })),
  ];

  return (
    <div className={styles.card}>
      <ul className={styles.methods}>
        {rows.map((row) => {
          const found = linked.find((item) => item.provider === row.id);
          const canRemove = found && row.id !== "email" && linked.length > 1;
          return (
            <li key={row.id} className={styles.method}>
              <span>
                <strong>{row.name}</strong>
                <span className={styles.meta}>
                  {identities === null
                    ? "Checking…"
                    : found
                      ? `Connected${found.email ? ` as ${found.email}` : ""}`
                      : row.id === "email"
                        ? "No password yet. Set one below to sign in with your email."
                        : "Not connected"}
                </span>
              </span>
              {identities !== null && row.id !== "email" && !found && (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy !== null}
                  onClick={() => void connect(row.id as OAuthProviderId)}
                >
                  {busy === row.id ? "Opening…" : "Connect"}
                </button>
              )}
              {canRemove && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.ghostDanger}`}
                  disabled={busy !== null}
                  onClick={() => void remove(row.id)}
                >
                  {busy === row.id ? "Removing…" : "Remove"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function groups(secret: string): string {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

function TwoStep() {
  const [factors, setFactors] = useState<TotpFactor[] | null>(null);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let live = true;
    void totpFactors().then((result) => {
      if (!live) return;
      if (result.ok) setFactors(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [reload]);

  async function begin() {
    setBusy(true);
    setError(null);
    const result = await startTotp();
    setBusy(false);
    if (result.ok) {
      setEnrollment(result.value);
      setCode("");
    } else setError(result.error);
  }

  async function confirm(value: string) {
    if (!enrollment) return;
    const problem = codeProblem(value);
    if (problem) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await confirmTotp(enrollment.factorId, value);
    setBusy(false);
    if (result.ok) {
      setEnrollment(null);
      setReload((n) => n + 1);
    } else setError(result.error);
  }

  async function turnOff() {
    const factor = factors?.[0];
    if (!factor) return;
    setBusy(true);
    setError(null);
    const result = await removeTotp(factor.id);
    setBusy(false);
    setAsking(false);
    if (result.ok) setReload((n) => n + 1);
    else setError(result.error);
  }

  const on = (factors?.length ?? 0) > 0;

  return (
    <div className={styles.card}>
      {factors === null ? (
        <p className={styles.meta}>Checking…</p>
      ) : on ? (
        <>
          <p className={styles.meta}>
            <span className={styles.dot} data-state="idle" aria-hidden="true" /> On since{" "}
            {new Date(factors[0].createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}. Each time you sign
            in, you also type a code from your authenticator app.
          </p>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.btn} ${styles.ghostDanger}`}
              disabled={busy}
              onClick={() => setAsking(true)}
            >
              Turn off
            </button>
          </div>
        </>
      ) : enrollment ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void confirm(code);
          }}
        >
          <ol className={styles.steps}>
            <li>
              Open an authenticator app such as Google Authenticator, Microsoft Authenticator, 1Password or Authy.
            </li>
            <li>Scan this code, or type the key under it.</li>
          </ol>
          <div className={styles.qrRow}>
            <span
              className={styles.qr}
              role="img"
              aria-label="QR code to add Groundwork to your authenticator app"
              style={{ backgroundImage: `url("${enrollment.qr}")` }}
            />
            <div>
              <span className={styles.label}>Key</span>
              <code className={styles.secret}>{groups(enrollment.secret)}</code>
            </div>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Code the app shows</span>
            <input
              className={styles.input}
              value={code}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(digits);
                setError(null);
                if (digits.length === 6 && !busy) void confirm(digits);
              }}
            />
          </label>
          <div className={styles.row}>
            <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={busy}>
              {busy ? "Checking…" : "Turn on"}
            </button>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => setEnrollment(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className={styles.meta}>
            Off. Turn it on and signing in also needs a code from an app on your phone, so a stolen password alone is
            not enough.
          </p>
          <div className={styles.row}>
            <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={busy} onClick={begin}>
              {busy ? "Preparing…" : "Set up an authenticator app"}
            </button>
          </div>
        </>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {asking && (
        <ConfirmDialog
          title="Turn off two-step sign-in?"
          body={<p>Signing in will need only your password or email code again.</p>}
          confirmLabel="Turn off"
          danger
          onConfirm={() => void turnOff()}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  );
}

type Pending = "erase" | "delete" | "sign-out-clear" | "everywhere" | null;

const SECTIONS = [
  { id: "account-profile", label: "Profile", icon: "◉" },
  { id: "account-look", label: "Look and feel", icon: "✎" },
  { id: "account-sign-in", label: "Ways to sign in", icon: "⇄" },
  { id: "account-two-step", label: "Two-step sign-in", icon: "⛨" },
  { id: "account-sync", label: "Sync and data", icon: "↻" },
  { id: "account-session", label: "Sign out", icon: "⏻" },
  { id: "account-delete", label: "Delete account", icon: "✕" },
] as const;

function useActiveSection(): string {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const seen = new Map<string, number>();
    const watcher = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        let best: string | null = null;
        let ratio = 0;
        for (const section of SECTIONS) {
          const r = seen.get(section.id) ?? 0;
          if (r > ratio) {
            ratio = r;
            best = section.id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-20% 0px -45% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) watcher.observe(el);
    }
    return () => watcher.disconnect();
  }, []);
  return active;
}

function sinceLabel(at: number | null): string {
  if (!at) return "not synced yet";
  const minutes = Math.round((Date.now() - at) / 60000);
  if (minutes < 1) return "synced just now";
  if (minutes < 60) return `synced ${minutes} min ago`;
  return `synced ${when(at)}`;
}

function StatTile({ label, value, sub, i }: { label: string; value: number; sub?: string; i: number }) {
  const shown = useCountUp(value);
  return (
    <div className={styles.stat} style={{ "--i": i } as CSSProperties}>
      <span className={styles.statLabel}>{label}</span>
      <strong className={styles.statValue}>{shown.toLocaleString()}</strong>
      {sub && <span className={styles.statSub}>{sub}</span>}
    </div>
  );
}

function Panel({
  id,
  title,
  sub,
  tone,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.panel} data-tone={tone} aria-labelledby={`${id}-title`}>
      <header className={styles.panelHead}>
        <h2 id={`${id}-title`} className={styles.panelTitle}>
          {title}
        </h2>
        {sub && <p className={styles.panelSub}>{sub}</p>}
      </header>
      {children}
    </section>
  );
}

function Signed() {
  const account = useAccount();
  const sync = useSyncStatus();
  const active = useActiveSection();
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const [pending, setPending] = useState<Pending>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = account.user;
  if (!user) return null;
  const name = account.profile?.displayName || user.name;
  const first = name.split(/\s+/)[0] || name;
  const usesPassword = user.providers.includes("email");
  const stats: Stats | null = statsKey ? (JSON.parse(statsKey) as Stats) : null;
  const levelPct = stats && stats.xpForNextLevel ? Math.round((stats.xpIntoLevel / stats.xpForNextLevel) * 100) : 0;

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
    <div className={styles.dash}>
      <header className={styles.banner}>
        <div className={styles.bannerWho}>
          <span className={styles.ring} aria-hidden="true">
            <span className={styles.hugeAvatar}>{initials(name)}</span>
          </span>
          <div className={styles.bannerText}>
            <p className={styles.bannerKicker}>Your account</p>
            <h1 className={styles.bannerTitle}>Hello, {first}</h1>
            <p className={styles.bannerEmail}>{user.email}</p>
            <ul className={styles.pills}>
              <li className={styles.pill} data-tone={account.profile?.plan === "pro" ? "pro" : undefined}>
                {account.profile?.plan === "pro" ? "★ Pro" : "Free plan"}
              </li>
              <li className={styles.pill}>
                Member since{" "}
                {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </li>
              <li className={styles.pill}>
                <span className={styles.dot} data-state={sync.state} aria-hidden="true" />{" "}
                {sinceLabel(sync.lastSyncedAt)}
              </li>
              <li className={styles.pill}>{user.providers.map((p) => PROVIDER_NAME[p] ?? p).join(" · ") || "Email"}</li>
            </ul>
          </div>
        </div>
        <div className={styles.stats}>
          <div className={`${styles.stat} ${styles.statLevel}`} style={{ "--i": 0 } as CSSProperties}>
            <span className={styles.statLabel}>Level</span>
            <strong className={styles.statValue}>{stats?.level ?? 1}</strong>
            <span className={styles.levelBar} aria-hidden="true">
              <span style={{ width: `${levelPct}%` }} />
            </span>
            <span className={styles.statSub}>
              {stats
                ? `${stats.xpForNextLevel - stats.xpIntoLevel} XP to level ${stats.level + 1}`
                : "Read a chapter to start"}
            </span>
          </div>
          <StatTile label="XP" value={stats?.xp ?? 0} sub="from chapters, exercises and reviews" i={1} />
          <StatTile label="Day streak" value={stats?.streak ?? 0} sub={`best ${stats?.bestStreak ?? 0}`} i={2} />
          <StatTile
            label="Chapters read"
            value={stats?.chaptersRead ?? 0}
            sub={`${stats?.exercisesSolved ?? 0} exercises solved`}
            i={3}
          />
        </div>
        <div className={styles.quick}>
          <Link href="/progress" className={styles.quickLink} prefetch={false}>
            <span aria-hidden="true">▤</span> Your progress
          </Link>
          <Link href="/review" className={styles.quickLink} prefetch={false}>
            <span aria-hidden="true">↻</span> Review queue
          </Link>
          <button type="button" className={styles.quickLink} onClick={download}>
            <span aria-hidden="true">⤓</span> Download my data
          </button>
          <button type="button" className={styles.quickLink} onClick={() => void syncAccountNow()}>
            <span aria-hidden="true">⟳</span> Sync now
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <nav className={styles.side} aria-label="Account sections">
          <ol>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={styles.sideLink}
                  aria-current={active === section.id ? "true" : undefined}
                  data-tone={section.id === "account-delete" ? "danger" : undefined}
                >
                  <span className={styles.sideIcon} aria-hidden="true">
                    {section.icon}
                  </span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.sections}>
          <Panel id="account-profile" title="About you" sub="Used to suggest where to start. Optional.">
            <ProfileForm
              key={account.profile ? "loaded" : "empty"}
              profile={account.profile}
              fallbackName={user.name}
            />
          </Panel>

          <Panel
            id="account-look"
            title="Look and feel"
            sub="The theme and handwriting on this device. Changes apply as you click."
          >
            <div className={`${styles.card} ${styles.lookCard}`}>
              <AppearancePicker idPrefix="account-look" headingClass={styles.lookHeading} />
            </div>
          </Panel>

          <Panel
            id="account-sign-in"
            title="Ways to sign in"
            sub="Connect Google or GitHub to the same account, change your email, or set a password."
          >
            <div className={styles.split}>
              <Methods />
              <div className={styles.stack}>
                <EmailForm current={user.email} />
                <PasswordForm setting={!usesPassword} />
              </div>
            </div>
          </Panel>

          <Panel
            id="account-two-step"
            title="Two-step sign-in"
            sub="A second check from an app on your phone. Optional."
          >
            <TwoStep />
          </Panel>

          <Panel
            id="account-sync"
            title="Sync and your data"
            sub="Progress, review marks, quiz results, mock history, boards and code drafts are saved to your account and merged across devices."
          >
            <div className={styles.split}>
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
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.primary}`}
                    onClick={() => void syncAccountNow()}
                  >
                    Sync now
                  </button>
                </div>
              </div>
              <div className={styles.card}>
                <p className={styles.cardTitle}>Your data</p>
                <p className={styles.meta}>
                  Download everything as one JSON file, or erase what is saved to your account and this device.
                </p>
                <div className={styles.row}>
                  <button type="button" className={styles.btn} onClick={download}>
                    Download my data
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.ghostDanger}`}
                    onClick={() => setPending("erase")}
                  >
                    Erase saved progress
                  </button>
                </div>
              </div>
            </div>
          </Panel>

          <Panel id="account-session" title="Sign out">
            <div className={styles.card}>
              <p className={styles.meta}>
                On a shared computer, remove this device&rsquo;s copy when you sign out. Your account keeps everything.
              </p>
              <div className={styles.row}>
                <button type="button" className={styles.btn} disabled={busy} onClick={() => void act(() => signOut())}>
                  Sign out
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy}
                  onClick={() => setPending("sign-out-clear")}
                >
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
          </Panel>

          <Panel id="account-delete" title="Delete account" tone="danger">
            <div className={`${styles.card} ${styles.dangerCard}`}>
              <p className={styles.meta}>
                Deletes your account, your profile and everything saved to it, right away. This cannot be undone. The
                copy on this device stays until you clear it.
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
          </Panel>
        </div>
      </div>

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
    </div>
  );
}

export function AccountView() {
  return (
    <SignInGate feature="account">
      <Signed />
    </SignInGate>
  );
}
