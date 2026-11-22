"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { authProviders, type AuthMode } from "@/lib/account/config";
import { codeProblem, emailProblem, nameProblem, passwordChecks, passwordProblem } from "@/lib/account/errors";
import {
  sendMagicLink,
  sendPasswordReset,
  signInWithPassword,
  signInWithProvider,
  signUpWithPassword,
  verifyEmailCode,
  type OAuthProvider,
} from "@/lib/account/session";
import styles from "./account.module.css";

const TITLES: Record<AuthMode, string> = {
  "sign-in": "Sign in to Groundwork",
  "sign-up": "Create your free account",
  magic: "Sign in with an email link",
  forgot: "Reset your password",
};

const LEADS: Record<AuthMode, string> = {
  "sign-in": "Your progress, mock results and boards follow you to every device.",
  "sign-up": "An account is optional. It keeps your progress, mock results and boards in sync across devices.",
  magic: "We email you a link and a 6-digit code. No password needed.",
  forgot: "Enter the email you signed up with and we will send you a link to choose a new password.",
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  autoComplete: string;
  autoFocus?: boolean;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  reveal?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}

function Field({
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
  autoFocus,
  hint,
  aside,
  reveal,
  inputMode,
  maxLength,
}: FieldProps) {
  const id = useId();
  const noteId = useId();
  const [shown, setShown] = useState(false);
  const input = (
    <input
      id={id}
      className={styles.input}
      type={reveal && shown ? "text" : type}
      value={value}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      inputMode={inputMode}
      maxLength={maxLength}
      spellCheck={false}
      autoCapitalize="off"
      aria-invalid={error ? true : undefined}
      aria-describedby={noteId}
      onChange={(e) => onChange(e.target.value)}
    />
  );
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {aside}
      </div>
      {reveal ? (
        <div className={styles.inputWrap}>
          {input}
          <button
            type="button"
            className={styles.reveal}
            aria-pressed={shown}
            aria-controls={id}
            onClick={() => setShown((s) => !s)}
          >
            {shown ? "Hide" : "Show"}
          </button>
        </div>
      ) : (
        input
      )}
      <div id={noteId} className={error ? styles.fieldError : styles.fieldHint} aria-live="polite">
        {error ?? hint ?? ""}
      </div>
    </div>
  );
}

export function AuthDialog({
  initialMode,
  next,
  onClose,
}: {
  initialMode: AuthMode;
  next: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState<null | "confirm" | "magic" | "reset">(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  function go(nextMode: AuthMode) {
    setMode(nextMode);
    setTried(false);
    setFormError(null);
    setSent(null);
    setCode("");
  }

  const emailError = tried ? emailProblem(email) : null;
  const nameError = tried && mode === "sign-up" ? nameProblem(name) : null;
  const passwordError =
    tried && mode === "sign-up"
      ? passwordProblem(password)
      : tried && mode === "sign-in" && !password
        ? "Enter your password."
        : null;

  async function run(label: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(label);
    setFormError(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) setFormError(result.error ?? "Something went wrong. Try again.");
    return result.ok;
  }

  async function onProvider(provider: OAuthProvider) {
    await run(provider, () => signInWithProvider(provider, next));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (busy) return;
    if (mode === "sign-up") {
      if (nameProblem(name) || emailProblem(email) || passwordProblem(password)) return;
      setBusy("submit");
      setFormError(null);
      const result = await signUpWithPassword(name, email, password, next);
      setBusy(null);
      if (!result.ok) setFormError(result.error);
      else if (result.value.confirm) setSent("confirm");
      else onClose();
      return;
    }
    if (mode === "sign-in") {
      if (emailProblem(email) || !password) return;
      if (await run("submit", () => signInWithPassword(email, password))) onClose();
      return;
    }
    if (mode === "magic") {
      if (emailProblem(email)) return;
      if (sent === "magic") {
        if (codeProblem(code)) {
          setFormError(codeProblem(code));
          return;
        }
        if (await run("submit", () => verifyEmailCode(email, code))) onClose();
        return;
      }
      if (await run("submit", () => sendMagicLink(email, next))) setSent("magic");
      return;
    }
    if (emailProblem(email)) return;
    if (await run("submit", () => sendPasswordReset(email))) setSent("reset");
  }

  const submitLabel = {
    "sign-in": "Sign in",
    "sign-up": "Create account",
    magic: sent === "magic" ? "Verify code" : "Email me a link",
    forgot: "Send reset link",
  }[mode];

  const providers = authProviders();
  const showProviders = (mode === "sign-in" || mode === "sign-up") && sent === null && providers.length > 0;
  const checks = passwordChecks(password);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.inner}>
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id={titleId} className={styles.title}>
          {sent === "confirm" ? "Check your email" : TITLES[mode]}
        </h2>

        {sent === "confirm" ? (
          <>
            <p className={styles.notice} role="status">
              We sent a confirmation link to <strong>{email.trim()}</strong>. Open it on this device to finish creating
              your account. It can take a minute; check spam if it does not arrive.
            </p>
            <p className={styles.switch}>
              Already confirmed?{" "}
              <button type="button" className={styles.textLink} onClick={() => go("sign-in")}>
                Sign in
              </button>
            </p>
          </>
        ) : sent === "reset" ? (
          <>
            <p className={styles.notice} role="status">
              If an account uses <strong>{email.trim()}</strong>, a reset link is on its way. Open it on this device to
              choose a new password.
            </p>
            <p className={styles.switch}>
              <button type="button" className={styles.textLink} onClick={() => go("sign-in")}>
                Back to sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <p className={styles.lead}>{LEADS[mode]}</p>

            {showProviders && (
              <>
                <div className={styles.providers}>
                  {providers.includes("google") && (
                    <button
                      type="button"
                      className={styles.provider}
                      disabled={busy !== null}
                      onClick={() => onProvider("google")}
                    >
                      <GoogleMark />
                      {busy === "google" ? "Opening Google…" : "Continue with Google"}
                    </button>
                  )}
                  {providers.includes("github") && (
                    <button
                      type="button"
                      className={styles.provider}
                      disabled={busy !== null}
                      onClick={() => onProvider("github")}
                    >
                      <GitHubMark />
                      {busy === "github" ? "Opening GitHub…" : "Continue with GitHub"}
                    </button>
                  )}
                </div>
                <p className={styles.or}>or use your email</p>
              </>
            )}

            <form noValidate onSubmit={onSubmit}>
              {mode === "sign-up" && (
                <Field
                  label="Name"
                  type="text"
                  value={name}
                  onChange={setName}
                  error={nameError}
                  autoComplete="name"
                  autoFocus
                  maxLength={60}
                  hint="Shown on your progress page. You can change it later."
                />
              )}
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  if (sent === "magic") setSent(null);
                }}
                error={emailError}
                autoComplete="email"
                autoFocus={mode !== "sign-up"}
                inputMode="email"
                maxLength={254}
              />
              {(mode === "sign-in" || mode === "sign-up") && (
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  error={passwordError}
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  reveal
                  maxLength={72}
                  aside={
                    mode === "sign-in" ? (
                      <button type="button" className={styles.textLink} onClick={() => go("forgot")}>
                        Forgot password?
                      </button>
                    ) : undefined
                  }
                  hint={
                    mode === "sign-up" ? (
                      <ul className={styles.checks} aria-label="Password rules">
                        {checks.map((c) => (
                          <li key={c.label} className={c.met ? styles.met : undefined}>
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    ) : undefined
                  }
                />
              )}
              {mode === "magic" && sent === "magic" && (
                <>
                  <p className={styles.notice} role="status">
                    Check <strong>{email.trim()}</strong>. Open the link on this device, or type the 6-digit code here.
                  </p>
                  <Field
                    label="6-digit code"
                    type="text"
                    value={code}
                    onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                    error={null}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                  />
                </>
              )}

              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}

              <button type="submit" className={styles.submit} disabled={busy !== null}>
                {busy === "submit" ? "Please wait…" : submitLabel}
              </button>
            </form>

            {mode === "sign-in" && (
              <>
                <p className={styles.switch}>
                  <button type="button" className={styles.textLink} onClick={() => go("magic")}>
                    Email me a sign-in link instead
                  </button>
                </p>
                <p className={styles.switch}>
                  New here?{" "}
                  <button type="button" className={styles.textLink} onClick={() => go("sign-up")}>
                    Create a free account
                  </button>
                </p>
              </>
            )}
            {mode === "sign-up" && (
              <p className={styles.switch}>
                Already have an account?{" "}
                <button type="button" className={styles.textLink} onClick={() => go("sign-in")}>
                  Sign in
                </button>
              </p>
            )}
            {(mode === "magic" || mode === "forgot") && (
              <p className={styles.switch}>
                <button type="button" className={styles.textLink} onClick={() => go("sign-in")}>
                  Back to sign in
                </button>
              </p>
            )}
            {mode === "sign-up" && (
              <p className={styles.fine}>
                By creating an account you agree to how we handle your data in the{" "}
                <Link href="/privacy" onClick={onClose}>
                  privacy note
                </Link>
                .
              </p>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
