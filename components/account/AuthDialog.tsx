"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { authProviders, type AuthMode } from "@/lib/account/config";
import { codeProblem, emailProblem, nameProblem, passwordProblem } from "@/lib/account/errors";
import { markOnboardingDone } from "@/lib/account/onboarding";
import {
  resendSignupEmail,
  sendMagicLink,
  sendPasswordReset,
  signInWithPassword,
  signInWithProvider,
  signUpWithPassword,
  updateProfile,
  useAccount,
  verifyEmailCode,
  verifySignupCode,
  verifyTotpSignIn,
  type Experience,
  type Goal,
  type OAuthProvider,
  type TargetRole,
} from "@/lib/account/session";
import { lastSignInMethod, rememberSignInMethod, type SignInMethod } from "@/lib/account/lastMethod";
import { isCommonPassword } from "@/lib/account/strength";
import { Captcha, type CaptchaHandle } from "./Captcha";
import { PasswordField } from "./PasswordField";
import styles from "./account.module.css";

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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  code?: boolean;
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
  inputMode,
  maxLength,
  code,
}: FieldProps) {
  const id = useId();
  const noteId = useId();
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      <input
        id={id}
        className={code ? `${styles.input} ${styles.codeInput}` : styles.input}
        type={type}
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
      <div id={noteId} className={error ? styles.fieldError : styles.fieldHint} aria-live="polite">
        {error ?? hint ?? ""}
      </div>
    </div>
  );
}

type Step = "email" | "password" | "create" | "code" | "forgot" | "confirm" | "reset" | "welcome" | "mfa";
type Intent = "sign-in" | "sign-up" | "code";
type Side = "left" | "right";

const ASIDE_COPY: Record<Side, { kicker: string; title: string }> = {
  left: { kicker: "Welcome back", title: "Your notebook is where you left it" },
  right: { kicker: "Optional, and free", title: "Your notebook, on every device" },
};

const TILT_LIMIT = 0.5;
const SLIDE_MS = 650;

const RESEND_SECONDS = 60;

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

const BENEFITS = [
  { title: "Progress that follows you", body: "Chapters read and exercises solved, on every device you sign in on." },
  { title: "A review queue that remembers", body: "Notes you marked for later come back when they are due." },
  { title: "Mock interview history", body: "Every run, with the scores, kept in one place." },
  { title: "Saved whiteboards", body: "Your system design boards, ready to reopen." },
];

function startFor(mode: AuthMode): { step: Step; intent: Intent } {
  if (mode === "sign-up") return { step: "email", intent: "sign-up" };
  if (mode === "magic") return { step: "email", intent: "code" };
  if (mode === "forgot") return { step: "forgot", intent: "sign-in" };
  if (mode === "welcome") return { step: "welcome", intent: "sign-in" };
  if (mode === "mfa") return { step: "mfa", intent: "sign-in" };
  return { step: "email", intent: "sign-in" };
}

function titleFor(step: Step, intent: Intent): string {
  switch (step) {
    case "email":
      return intent === "sign-up"
        ? "Create your free account"
        : intent === "code"
          ? "Sign in with a code"
          : "Sign in to Groundwork";
    case "password":
      return "Welcome back";
    case "create":
      return "Set up your account";
    case "code":
      return "Check your email";
    case "forgot":
      return "Reset your password";
    case "confirm":
      return "Confirm your email";
    case "reset":
      return "Check your email";
    case "welcome":
      return "Make it yours";
    case "mfa":
      return "One more step";
  }
}

function leadFor(step: Step, intent: Intent): string | null {
  switch (step) {
    case "email":
      return intent === "sign-up"
        ? "Start with your email. You can use a password or a one-time code."
        : intent === "code"
          ? "We email you a 6-digit code. No password needed, and it works for new accounts too."
          : "Use the email you signed up with.";
    case "password":
      return null;
    case "create":
      return "Two more details and you are in.";
    case "forgot":
      return "Enter the email you signed up with and we will send a link to choose a new password.";
    case "mfa":
      return "Open your authenticator app and type the 6-digit code it shows for Groundwork.";
    case "welcome":
      return "Three quick choices so Groundwork can point you at the right chapters. You can change them later on your account page.";
    default:
      return null;
  }
}

function SyncDoodle() {
  return (
    <svg viewBox="0 0 220 110" className={styles.doodle} aria-hidden="true">
      <rect x="10" y="18" width="92" height="60" rx="6" />
      <path d="M2 86h108" />
      <path d="M22 34h50M22 46h66M22 58h40" />
      <rect x="160" y="22" width="44" height="72" rx="8" />
      <path d="M172 40h20M172 52h16M172 64h20" />
      <path className={styles.doodleArrow} d="M112 38c14-12 30-12 42-2" />
      <path className={styles.doodleArrow} d="M148 30l7 6-8 4" />
      <path className={styles.doodleArrow} d="M154 72c-14 12-30 12-42 2" />
      <path className={styles.doodleArrow} d="M118 80l-7-6 8-4" />
    </svg>
  );
}

function Aside({ side }: { side: Side }) {
  const copy = ASIDE_COPY[side];
  return (
    <aside className={styles.aside} aria-label="What an account adds">
      <div className={styles.asideContent}>
        <div key={side} className={styles.asideHead}>
          <p className={styles.asideKicker}>{copy.kicker}</p>
          <p className={styles.asideTitle}>{copy.title}</p>
        </div>
        <SyncDoodle />
        <ul className={styles.benefits}>
          {BENEFITS.map((b) => (
            <li key={b.title}>
              <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" className={styles.benefitTick}>
                <path d="M3 8.5 6.5 12 13 4.5" />
              </svg>
              <span>
                <strong>{b.title}</strong>
                <span className={styles.benefitBody}>{b.body}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={styles.asideNote}>Every chapter and exercise still works without an account.</p>
      </div>
    </aside>
  );
}

function EmailChip({ email, onChange }: { email: string; onChange: () => void }) {
  return (
    <div className={styles.emailChip}>
      <span className={styles.emailChipText}>{email.trim()}</span>
      <button type="button" className={styles.textLink} onClick={onChange}>
        Change
      </button>
    </div>
  );
}

function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className={styles.choice}>
      <legend className={styles.label}>{legend}</legend>
      <div className={styles.choiceRow}>
        {options.map((o) => (
          <label key={o.value} className={styles.choicePill} data-checked={value === o.value || undefined}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Welcome({ onDone }: { onDone: () => void }) {
  const { user, profile } = useAccount();
  const [goal, setGoal] = useState<Goal | null>(profile?.goal ?? null);
  const [experience, setExperience] = useState<Experience | null>(profile?.experience ?? null);
  const [role, setRole] = useState<TargetRole | null>(profile?.targetRole ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function finish() {
    if (user) markOnboardingDone(user.id);
    onDone();
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!goal && !experience && !role) {
      finish();
      return;
    }
    setBusy(true);
    setError(null);
    const result = await updateProfile({ goal, experience, targetRole: role });
    setBusy(false);
    if (result.ok) finish();
    else setError(result.error);
  }

  return (
    <form noValidate onSubmit={save}>
      {user && (
        <p className={styles.welcomeHello}>
          Signed in as <strong>{profile?.displayName || user.email}</strong>.
        </p>
      )}
      <Choice legend="What brings you here?" options={GOALS} value={goal} onChange={setGoal} />
      <Choice legend="How much have you built so far?" options={LEVELS} value={experience} onChange={setExperience} />
      <Choice legend="Which role are you aiming for?" options={ROLES} value={role} onChange={setRole} />
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.submit} disabled={busy}>
        {busy ? "Saving…" : "Save and continue"}
      </button>
      <p className={styles.switch}>
        <button type="button" className={styles.textLink} onClick={finish}>
          Skip for now
        </button>
      </p>
    </form>
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
  const start = startFor(initialMode);
  const [step, setStep] = useState<Step>(start.step);
  const [intent, setIntent] = useState<Intent>(start.intent);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const frozenUntil = useRef(0);
  const [slid, setSlid] = useState(false);
  const captcha = useRef<CaptchaHandle>(null);
  const [lastUsed] = useState<SignInMethod | null>(() => lastSignInMethod());

  function human(): Promise<string | undefined> {
    return captcha.current?.token() ?? Promise.resolve(undefined);
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input[type=email], input[type=text], input[type=password]")?.focus();
  }, []);

  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  function go(nextStep: Step, nextIntent?: Intent) {
    const slides = ((nextIntent ?? intent) === "sign-up") !== (intent === "sign-up");
    if (slides) frozenUntil.current = performance.now() + SLIDE_MS;
    setSlid(slides);
    setStep(nextStep);
    if (nextIntent) setIntent(nextIntent);
    setTried(false);
    setFormError(null);
    if (nextStep !== "code") setCode("");
  }

  async function run(label: string, task: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(label);
    setFormError(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) setFormError(result.error ?? "Something went wrong. Try again.");
    return result.ok;
  }

  async function sendCode() {
    if (await run("code", async () => sendMagicLink(email, next, await human()))) {
      setCooldown(RESEND_SECONDS);
      go("code");
    }
  }

  async function verify(value: string) {
    if (codeProblem(value)) {
      setFormError(codeProblem(value));
      return;
    }
    if (step === "mfa") {
      await run("submit", () => verifyTotpSignIn(value));
      return;
    }
    const check = step === "confirm" ? verifySignupCode : verifyEmailCode;
    if (await run("submit", () => check(email, value))) {
      rememberSignInMethod("code");
      onClose();
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (busy) return;
    if (step === "email") {
      if (emailProblem(email)) return;
      if (intent === "code") await sendCode();
      else go(intent === "sign-up" ? "create" : "password");
      return;
    }
    if (step === "password") {
      if (!password) return;
      if (await run("submit", async () => signInWithPassword(email, password, await human()))) {
        rememberSignInMethod("password");
        onClose();
      }
      return;
    }
    if (step === "create") {
      if (nameProblem(name) || passwordProblem(password) || isCommonPassword(password)) return;
      setBusy("submit");
      setFormError(null);
      const result = await signUpWithPassword(name, email, password, next, await human());
      setBusy(null);
      if (!result.ok) setFormError(result.error);
      else if (result.value.confirm) {
        setCooldown(RESEND_SECONDS);
        go("confirm");
      } else {
        rememberSignInMethod("password");
        onClose();
      }
      return;
    }
    if (step === "code" || step === "mfa") {
      await verify(code);
      return;
    }
    if (step === "forgot") {
      if (emailProblem(email)) return;
      if (await run("submit", async () => sendPasswordReset(email, await human()))) go("reset");
    }
  }

  async function onProvider(provider: OAuthProvider) {
    rememberSignInMethod(provider);
    await run(provider, () => signInWithProvider(provider, next));
  }

  const emailError = tried ? emailProblem(email) : null;
  const nameError = tried && step === "create" ? nameProblem(name) : null;
  const passwordError =
    tried && step === "create"
      ? (passwordProblem(password) ??
        (isCommonPassword(password) ? "That password is too common. Choose another." : null))
      : tried && step === "password" && !password
        ? "Enter your password."
        : null;

  const providers = authProviders();
  const showProviders = step === "email" && intent !== "code" && providers.length > 0;
  const showAside = step !== "welcome";
  const side: Side = intent === "sign-up" ? "right" : "left";

  function tilt(e: PointerEvent<HTMLDialogElement>) {
    const dialog = ref.current;
    if (!dialog || !showAside || e.pointerType !== "mouse" || performance.now() < frozenUntil.current) return;
    const x = (e.clientX - dialog.offsetLeft) / dialog.offsetWidth - 0.5;
    const y = (e.clientY - dialog.offsetTop) / dialog.offsetHeight - 0.5;
    const outside = Math.abs(x) > TILT_LIMIT || Math.abs(y) > TILT_LIMIT;
    pointer.current = outside ? null : { x, y };
    if (frame.current) return;
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      const at = pointer.current;
      if (at) {
        dialog.dataset.tilt = "";
        dialog.style.setProperty("--px", at.x.toFixed(3));
        dialog.style.setProperty("--py", at.y.toFixed(3));
      } else {
        resetTilt();
      }
    });
  }

  function resetTilt() {
    pointer.current = null;
    if (ref.current) delete ref.current.dataset.tilt;
    ref.current?.style.removeProperty("--px");
    ref.current?.style.removeProperty("--py");
  }

  const lead = leadFor(step, intent);
  const submitLabel: Record<Step, string> = {
    email: intent === "code" ? "Email me a code" : "Continue",
    password: "Sign in",
    create: "Create account",
    code: "Verify and sign in",
    forgot: "Send reset link",
    confirm: "",
    reset: "",
    welcome: "",
    mfa: "Verify and sign in",
  };

  return (
    <dialog
      ref={ref}
      className={showAside ? `${styles.dialog} ${styles.dialogWide}` : styles.dialog}
      aria-labelledby={titleId}
      data-side={showAside ? side : undefined}
      onPointerMove={tilt}
      onPointerLeave={resetTilt}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        ×
      </button>
      <div className={showAside ? styles.shell : undefined} data-side={showAside ? side : undefined}>
        {showAside && <Aside side={side} />}
        <div className={styles.inner}>
          <div key={step + intent} className={`${styles.body} ${slid ? styles.sideIn : styles.stepIn}`}>
            <h2 id={titleId} className={styles.title}>
              {titleFor(step, intent)}
            </h2>
            {lead && <p className={styles.lead}>{lead}</p>}

            {step === "welcome" ? (
              <Welcome onDone={onClose} />
            ) : step === "mfa" ? (
              <>
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    void verify(code);
                  }}
                >
                  <Field
                    label="Authenticator code"
                    type="text"
                    value={code}
                    onChange={(v) => {
                      const digits = v.replace(/\D/g, "").slice(0, 6);
                      setCode(digits);
                      setFormError(null);
                      if (digits.length === 6 && busy === null) void verify(digits);
                    }}
                    error={null}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    code
                  />
                  {formError && (
                    <p className={styles.formError} role="alert">
                      {formError}
                    </p>
                  )}
                  <button type="submit" className={styles.submit} disabled={busy !== null}>
                    {busy === "submit" ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />
                        Checking…
                      </>
                    ) : (
                      submitLabel.mfa
                    )}
                  </button>
                </form>
                <p className={styles.switch}>
                  Lost your phone?{" "}
                  <button type="button" className={styles.textLink} disabled={busy !== null} onClick={onClose}>
                    Sign out
                  </button>
                </p>
                <p className={styles.fine}>
                  Without the app you cannot finish signing in. Write to help@austincoders.com from this email address
                  and we will help.
                </p>
              </>
            ) : step === "confirm" ? (
              <>
                <p className={styles.notice} role="status">
                  We sent a 6-digit code to <strong>{email.trim()}</strong>. Type it here, or open the link in the same
                  email on this device.
                </p>
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    void verify(code);
                  }}
                >
                  <Field
                    label="6-digit code"
                    type="text"
                    value={code}
                    onChange={(v) => {
                      const digits = v.replace(/\D/g, "").slice(0, 6);
                      setCode(digits);
                      setFormError(null);
                      if (digits.length === 6 && busy === null) void verify(digits);
                    }}
                    error={null}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    code
                  />
                  {formError && (
                    <p className={styles.formError} role="alert">
                      {formError}
                    </p>
                  )}
                  <button type="submit" className={styles.submit} disabled={busy !== null}>
                    {busy === "submit" ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />
                        Checking…
                      </>
                    ) : (
                      "Verify and continue"
                    )}
                  </button>
                </form>
                <p className={styles.switch}>
                  Nothing arrived?{" "}
                  <button
                    type="button"
                    className={styles.textLink}
                    disabled={busy !== null || cooldown > 0}
                    onClick={async () => {
                      if (await run("resend", async () => resendSignupEmail(email, next, await human())))
                        setCooldown(RESEND_SECONDS);
                    }}
                  >
                    {busy === "resend"
                      ? "Sending…"
                      : cooldown > 0
                        ? `Send a new code in ${cooldown}s`
                        : "Send a new code"}
                  </button>
                </p>
                <p className={styles.switch}>
                  Already confirmed?{" "}
                  <button type="button" className={styles.textLink} onClick={() => go("password", "sign-in")}>
                    Sign in
                  </button>
                </p>
              </>
            ) : step === "reset" ? (
              <>
                <p className={styles.notice} role="status">
                  If an account uses <strong>{email.trim()}</strong>, a reset link is on its way. Open it on this device
                  to choose a new password.
                </p>
                <p className={styles.switch}>
                  <button
                    type="button"
                    className={styles.textLink}
                    onClick={() => go(email ? "password" : "email", "sign-in")}
                  >
                    Back to sign in
                  </button>
                </p>
              </>
            ) : (
              <>
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
                          {lastUsed === "google" && <span className={styles.lastUsed}>Last used</span>}
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
                          {lastUsed === "github" && <span className={styles.lastUsed}>Last used</span>}
                        </button>
                      )}
                    </div>
                    <p className={styles.or}>
                      or continue with email
                      {(lastUsed === "password" || lastUsed === "code") && (
                        <span className={styles.lastUsed}>Last used</span>
                      )}
                    </p>
                  </>
                )}

                <form key={step} noValidate onSubmit={onSubmit}>
                  {(step === "email" || step === "forgot") && (
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      error={emailError}
                      autoComplete="email"
                      autoFocus
                      inputMode="email"
                      maxLength={254}
                    />
                  )}

                  {(step === "password" || step === "create" || step === "code") && (
                    <EmailChip email={email} onChange={() => go("email")} />
                  )}

                  {step === "password" && (
                    <PasswordField
                      label="Password"
                      value={password}
                      onChange={setPassword}
                      error={passwordError}
                      autoComplete="current-password"
                      autoFocus
                      aside={
                        <button type="button" className={styles.textLink} onClick={() => go("forgot")}>
                          Forgot password?
                        </button>
                      }
                    />
                  )}

                  {step === "create" && (
                    <>
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
                      <PasswordField
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        error={passwordError}
                        autoComplete="new-password"
                        strengthHints={[email, name]}
                      />
                    </>
                  )}

                  {step === "code" && (
                    <>
                      <p className={styles.notice} role="status">
                        We sent a 6-digit code to <strong>{email.trim()}</strong>. The same email has a link you can
                        open on this device instead.
                      </p>
                      <Field
                        label="6-digit code"
                        type="text"
                        value={code}
                        onChange={(v) => {
                          const digits = v.replace(/\D/g, "").slice(0, 6);
                          setCode(digits);
                          setFormError(null);
                          if (digits.length === 6 && busy === null) void verify(digits);
                        }}
                        error={null}
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        autoFocus
                        maxLength={6}
                        code
                      />
                    </>
                  )}

                  {formError && (
                    <p className={styles.formError} role="alert">
                      {formError}
                    </p>
                  )}

                  <button type="submit" className={styles.submit} disabled={busy !== null}>
                    {busy === "submit" || (busy === "code" && step === "email") ? (
                      <>
                        <span className={styles.spinner} aria-hidden="true" />
                        Please wait…
                      </>
                    ) : (
                      submitLabel[step]
                    )}
                  </button>
                </form>

                {step === "email" && intent === "sign-in" && (
                  <>
                    <p className={styles.switch}>
                      New here?{" "}
                      <button type="button" className={styles.textLink} onClick={() => go("email", "sign-up")}>
                        Create a free account
                      </button>
                    </p>
                    <p className={styles.switch}>
                      <button type="button" className={styles.textLink} onClick={() => go("email", "code")}>
                        Sign in with a one-time code instead
                      </button>
                    </p>
                  </>
                )}
                {step === "email" && intent === "sign-up" && (
                  <p className={styles.switch}>
                    Already have an account?{" "}
                    <button type="button" className={styles.textLink} onClick={() => go("email", "sign-in")}>
                      Sign in
                    </button>
                  </p>
                )}
                {step === "email" && intent === "code" && (
                  <p className={styles.switch}>
                    <button type="button" className={styles.textLink} onClick={() => go("email", "sign-in")}>
                      Use a password instead
                    </button>
                  </p>
                )}
                {step === "password" && (
                  <>
                    <p className={styles.switch}>
                      <button type="button" className={styles.textLink} disabled={busy !== null} onClick={sendCode}>
                        {busy === "code" ? "Sending a code…" : "Email me a code instead"}
                      </button>
                    </p>
                    <p className={styles.switch}>
                      New here?{" "}
                      <button type="button" className={styles.textLink} onClick={() => go("create", "sign-up")}>
                        Create an account with this email
                      </button>
                    </p>
                  </>
                )}
                {step === "create" && (
                  <>
                    <p className={styles.switch}>
                      <button type="button" className={styles.textLink} disabled={busy !== null} onClick={sendCode}>
                        {busy === "code" ? "Sending a code…" : "Rather not have a password? Email me a code"}
                      </button>
                    </p>
                    <p className={styles.switch}>
                      Already have an account?{" "}
                      <button type="button" className={styles.textLink} onClick={() => go("password", "sign-in")}>
                        Sign in
                      </button>
                    </p>
                  </>
                )}
                {step === "code" && (
                  <p className={styles.switch}>
                    Nothing arrived?{" "}
                    <button
                      type="button"
                      className={styles.textLink}
                      disabled={busy !== null || cooldown > 0}
                      onClick={sendCode}
                    >
                      {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
                    </button>
                  </p>
                )}
                {step === "forgot" && (
                  <p className={styles.switch}>
                    <button
                      type="button"
                      className={styles.textLink}
                      onClick={() => go(email ? "password" : "email", "sign-in")}
                    >
                      Back to sign in
                    </button>
                  </p>
                )}
                {((step === "email" && intent === "sign-up") || step === "create") && (
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
          {step !== "welcome" && step !== "mfa" && <Captcha ref={captcha} />}
        </div>
      </div>
    </dialog>
  );
}
