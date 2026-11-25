"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/Modal";
import { describeDevice } from "@/lib/account/device";
import { saveEmailPrefs } from "@/lib/account/publicProfile";
import {
  endSession,
  loadSecurityActivity,
  type ActiveSession,
  type SecurityActivity,
  type SecurityKind,
} from "@/lib/account/security";
import { useAccount, type EmailPrefs } from "@/lib/account/session";
import styles from "./account.module.css";
import own from "./safety.module.css";

const EMAIL_ROWS: { key: keyof EmailPrefs; title: string; body: string }[] = [
  {
    key: "weekly",
    title: "Weekly review",
    body: "Once a week: what is due for review, your streak, and the next chapter on your path.",
  },
  {
    key: "plan",
    title: "Interview plan reminders",
    body: "A short note a week before and the day before the interview date you set.",
  },
  {
    key: "news",
    title: "New on Groundwork",
    body: "When a new topic or a big feature lands. A few times a year at most.",
  },
];

export function EmailPanel() {
  const { profile } = useAccount();
  const [saving, setSaving] = useState<keyof EmailPrefs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prefs = profile?.emails ?? null;

  async function toggle(key: keyof EmailPrefs) {
    if (!prefs) return;
    setSaving(key);
    setError(null);
    const result = await saveEmailPrefs({ ...prefs, [key]: !prefs[key] });
    setSaving(null);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className={styles.card}>
      {prefs === null ? (
        <p className={own.soon}>Email choices are being switched on. Check back in a little while.</p>
      ) : (
        <ul className={own.toggles}>
          {EMAIL_ROWS.map((row) => (
            <li key={row.key} className={own.toggle}>
              <span className={own.toggleText}>
                <strong id={`email-${row.key}`}>{row.title}</strong>
                <span>{row.body}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[row.key]}
                aria-labelledby={`email-${row.key}`}
                className={own.switch}
                disabled={saving !== null}
                onClick={() => void toggle(row.key)}
              >
                <span className={own.knob} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.meta}>
        Groundwork does not send these emails yet. Your choice is saved now, and when they start they follow it. Every
        email will have a one-click unsubscribe. Sign-in and security emails are not affected.
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const EVENT_TEXT: Record<SecurityKind, (detail: string | null) => string> = {
  sign_in: () => "Signed in",
  second_step: () => "Passed two-step sign-in",
  two_step_on: () => "Turned on two-step sign-in",
  two_step_off: () => "Turned off two-step sign-in",
  email_changed: () => "Changed the email address",
  password_changed: () => "Changed the password",
  provider_linked: (d) => `Connected ${providerName(d)}`,
  provider_unlinked: (d) => `Disconnected ${providerName(d)}`,
};

const EVENT_ICON: Record<SecurityKind, string> = {
  sign_in: "→",
  second_step: "⛨",
  two_step_on: "⛨",
  two_step_off: "⚠",
  email_changed: "✉",
  password_changed: "⚿",
  provider_linked: "⇄",
  provider_unlinked: "⇄",
};

function providerName(value: string | null): string {
  if (value === "google") return "Google";
  if (value === "github") return "GitHub";
  if (value === "email") return "email and password";
  return "a sign-in method";
}

function when(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  return at.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function deviceText(agent: string | null): string {
  const d = describeDevice(agent);
  return d.os === "unknown device" ? d.browser : `${d.browser} on ${d.os}`;
}

function deviceIcon(agent: string | null): string {
  const kind = describeDevice(agent).kind;
  return kind === "phone" ? "📱" : kind === "tablet" ? "▭" : kind === "computer" ? "💻" : "•";
}

export function SecurityPanel() {
  const [data, setData] = useState<SecurityActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState<ActiveSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await loadSecurityActivity();
    if (result.ok) {
      setData(result.value);
      setError(null);
    } else setError(result.error);
  }, []);

  useEffect(() => {
    let live = true;
    void loadSecurityActivity().then((result) => {
      if (!live) return;
      if (result.ok) setData(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, []);

  async function confirmEnd() {
    if (!ending) return;
    setBusy(true);
    const result = await endSession(ending.id);
    setBusy(false);
    setEnding(null);
    if (result.ok) {
      setNotice(
        `Signed out ${deviceText(ending.agent)}. It may stay open for up to an hour, then it has to sign in again.`
      );
      void load();
    } else setError(result.error);
  }

  return (
    <div className={own.securityGrid}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Signed in now</h3>
        {error && !data ? (
          <p className={own.soon}>{error}</p>
        ) : !data ? (
          <p className={styles.meta}>Loading…</p>
        ) : data.sessions.length === 0 ? (
          <p className={styles.meta}>No active sign-ins found.</p>
        ) : (
          <ul className={own.list}>
            {data.sessions.map((s) => (
              <li key={s.id} className={own.item} data-current={s.current || undefined}>
                <span className={own.icon} aria-hidden="true">
                  {deviceIcon(s.agent)}
                </span>
                <span className={own.itemText}>
                  <strong>
                    {deviceText(s.agent)}
                    {s.current && <span className={own.tag}>This device</span>}
                  </strong>
                  <span>
                    {s.ip ? `${s.ip} · ` : ""}last active {when(s.seenAt)}
                    {s.twoStep ? " · two-step passed" : ""}
                  </span>
                </span>
                {!s.current && (
                  <button type="button" className={own.end} disabled={busy} onClick={() => setEnding(s)}>
                    Sign out
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {notice && (
          <p className={styles.ok} role="status">
            {notice}
          </p>
        )}
        {error && data && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Recent activity</h3>
        {!data ? (
          <p className={styles.meta}>{error ? "Not available yet." : "Loading…"}</p>
        ) : data.events.length === 0 ? (
          <p className={styles.meta}>Nothing recorded yet. New sign-ins and account changes show up here.</p>
        ) : (
          <ol className={own.list}>
            {data.events.slice(0, 20).map((e, k) => (
              <li key={`${e.at}-${k}`} className={own.item} data-warn={e.kind === "two_step_off" || undefined}>
                <span className={own.icon} aria-hidden="true">
                  {EVENT_ICON[e.kind]}
                </span>
                <span className={own.itemText}>
                  <strong>{EVENT_TEXT[e.kind](e.detail)}</strong>
                  <span>
                    {when(e.at)}
                    {e.agent ? ` · ${deviceText(e.agent)}` : ""}
                    {e.ip ? ` · ${e.ip}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className={styles.meta}>
          Kept for 90 days. Something here you do not recognise? Change your password, then use Sign out everywhere
          below.
        </p>
      </div>
      {ending && (
        <ConfirmDialog
          title="Sign out this device?"
          body={
            <p>
              {deviceText(ending.agent)}
              {ending.ip ? ` (${ending.ip})` : ""} will have to sign in again. It may stay open for up to an hour.
            </p>
          }
          confirmLabel="Sign it out"
          danger
          onConfirm={() => void confirmEnd()}
          onClose={() => setEnding(null)}
        />
      )}
    </div>
  );
}
