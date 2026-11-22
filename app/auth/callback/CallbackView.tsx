"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { openAuth, safeNext } from "@/lib/account/config";
import { passwordChecks, passwordProblem } from "@/lib/account/errors";
import { connectAccount, updatePassword, useAccount } from "@/lib/account/session";
import styles from "@/app/account/account.module.css";

const WAIT_MS = 10_000;

type CallbackParams = { next: string; recovery: boolean; error: string | null };

let cachedParams: { href: string; value: CallbackParams } | null = null;

function paramsSnapshot(): CallbackParams {
  const href = window.location.href;
  if (!cachedParams || cachedParams.href !== href) cachedParams = { href, value: readParams() };
  return cachedParams.value;
}

function noSubscription(): () => void {
  return () => {};
}

function readParams(): { next: string; recovery: boolean; error: string | null } {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const error = query.get("error_description") ?? hash.get("error_description");
  return {
    next: safeNext(query.get("next"), "/"),
    recovery: query.get("flow") === "recovery" || hash.get("type") === "recovery",
    error: error ? error.replace(/\+/g, " ").slice(0, 200) : null,
  };
}

function NewPassword({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const problem = tried ? passwordProblem(password) : null;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (passwordProblem(password)) return;
    setBusy(true);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.ok) router.replace(next);
    else setError(result.error);
  }

  return (
    <form className={styles.status} onSubmit={save} noValidate>
      <h1>Choose a new password</h1>
      <p>Use at least 8 characters, with a letter and a number.</p>
      <label className={styles.field}>
        <span className={styles.label}>New password</span>
        <input
          className={styles.input}
          type="password"
          value={password}
          autoComplete="new-password"
          autoFocus
          maxLength={72}
          aria-invalid={problem ? true : undefined}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className={problem ? styles.error : styles.hint}>
          {problem ??
            passwordChecks(password)
              .map((c) => `${c.met ? "●" : "○"} ${c.label}`)
              .join("   ")}
        </span>
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={`${styles.btn} ${styles.primary}`} disabled={busy}>
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}

export function CallbackView() {
  const router = useRouter();
  const account = useAccount();
  const params = useSyncExternalStore(noSubscription, paramsSnapshot, () => null);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    void connectAccount();
    const timer = setTimeout(() => setWaited(true), WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  const recovery = Boolean(params?.recovery || account.recovery);

  useEffect(() => {
    if (!params || params.error || recovery) return;
    if (account.status === "in") router.replace(params.next);
  }, [account.status, params, recovery, router]);

  if (params?.error) {
    return (
      <section className={styles.status}>
        <h1>That link did not work</h1>
        <p>{params.error}. Links expire after a while and work once. Ask for a new one, or sign in.</p>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={() => openAuth("sign-in", params.next)}
        >
          Sign in
        </button>
      </section>
    );
  }

  if (account.status === "in" && recovery && params)
    return <NewPassword next={params.next === "/" ? "/account" : params.next} />;

  if (account.status !== "in" && (account.status === "out" || account.status === "off" || waited)) {
    return (
      <section className={styles.status}>
        <h1>Almost there</h1>
        <p>
          If you just confirmed your email, it is confirmed. The link may have opened in a different browser from the
          one you started in, or it has already been used, so sign in here to continue.
        </p>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={() => openAuth("sign-in", params?.next ?? "/")}
        >
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className={styles.status} aria-busy="true">
      <h1>Signing you in…</h1>
      <p>One moment while we finish and bring your progress across.</p>
    </section>
  );
}
