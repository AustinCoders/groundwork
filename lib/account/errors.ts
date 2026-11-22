import { isPlainObject } from "@/lib/storage";

const BY_CODE: Record<string, string> = {
  invalid_credentials:
    "That password is not right for this account. Try again, or use Forgot password to set a new one.",
  email_not_confirmed: "Confirm your email first: open the link we sent you, then sign in.",
  user_already_exists: "An account with this email already exists. Sign in instead, or reset your password.",
  email_exists: "An account with this email already exists. Sign in instead, or reset your password.",
  weak_password: "Choose a stronger password: at least 8 characters, with letters and numbers.",
  same_password: "The new password must be different from the old one.",
  over_email_send_rate_limit: "Too many emails were sent just now. Wait a minute, then try again.",
  over_request_rate_limit: "Too many attempts in a short time. Wait a minute, then try again.",
  email_address_invalid: "That email address does not look right. Check it and try again.",
  signup_disabled: "New accounts are paused for now. Try again later.",
  email_address_not_authorized:
    "We cannot send email to that address yet. Sign in with Google or GitHub, or try again later.",
  otp_expired: "That code is wrong or has expired. Check the newest email, or send a new code.",
  otp_disabled: "Email sign-in links are turned off right now. Use your password instead.",
  provider_disabled: "This sign-in option is not turned on yet. Use your email instead.",
  session_not_found: "Your session ended. Sign in again.",
  refresh_token_not_found: "Your session ended. Sign in again.",
  flow_state_expired: "The sign-in took too long. Start again.",
  flow_state_not_found: "This link was opened in a different browser. Sign in here instead.",
  bad_code_verifier: "This link was opened in a different browser. Sign in here instead.",
  reauthentication_needed: "Sign in again before changing your password.",
  captcha_failed: "We could not check that you are a person. Reload the page and try again.",
  mfa_verification_failed: "That code did not match. Use the newest code from your authenticator app.",
  mfa_challenge_expired: "That code took too long. Use the newest code from your authenticator app.",
  mfa_factor_not_found: "That authenticator is no longer set up. Reload the page and try again.",
  insufficient_aal: "Enter the code from your authenticator app first.",
  too_many_enrolled_mfa_factors: "This account already has the most authenticators it can hold. Remove one first.",
  identity_already_exists: "That account is already linked to a different Groundwork account.",
  manual_linking_disabled: "Linking another sign-in is not turned on yet. Try again later.",
  single_identity_not_deletable: "Keep at least one way to sign in.",
  email_changed_recently: "You changed your email a moment ago. Wait a minute, then try again.",
};

export function friendlyAuthError(error: unknown): string {
  if (isPlainObject(error)) {
    const code = typeof error.code === "string" ? error.code : "";
    if (code && BY_CODE[code]) return BY_CODE[code];
    const status = typeof error.status === "number" ? error.status : 0;
    if (status === 429) return BY_CODE.over_request_rate_limit;
    const message = typeof error.message === "string" ? error.message : "";
    if (/token has expired or is invalid/i.test(message)) return BY_CODE.otp_expired;
    if (/failed to fetch|network|load failed/i.test(message)) {
      return "Could not reach the server. Check your connection and try again.";
    }
    if (message && message.length < 160) return message.endsWith(".") ? message : `${message}.`;
  }
  return "Something went wrong on our side. Try again in a moment.";
}

const LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

export function emailProblem(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (/\s/.test(email)) return "Email addresses cannot have spaces in them.";
  const at = email.split("@");
  if (at.length === 1) return "Add the @ and the part after it, like name@example.com.";
  if (at.length > 2) return "Use only one @ in the address.";
  const [local, domain] = at;
  if (!local) return "Add your name before the @, like name@example.com.";
  if (!domain) return "Add the part after the @, like name@example.com.";
  if (email.length > 254 || local.length > 64) return "That email address is too long.";
  if (!LOCAL.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return "The part before the @ has a character that cannot be there.";
  }
  const labels = domain.split(".");
  const tld = labels[labels.length - 1] ?? "";
  if (labels.length < 2 || !labels.every((label) => LABEL.test(label)) || !/^[A-Za-z]{2,}$/.test(tld)) {
    return "The part after the @ does not look right. It should be like example.com.";
  }
  return null;
}

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "aol.com",
  "zoho.com",
  "mail.com",
  "ymail.com",
  "gmx.com",
  "live.in",
  "outlook.in",
  "hotmail.co.uk",
  "yahoo.co.in",
  "yahoo.co.uk",
];

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

export function emailSuggestion(value: string): string | null {
  const email = value.trim();
  if (emailProblem(email)) return null;
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  let best: string | null = null;
  let bestScore = 3;
  for (const known of COMMON_DOMAINS) {
    const score = distance(domain, known);
    if (score > 0 && score < bestScore) {
      best = known;
      bestScore = score;
    }
  }
  if (!best || (bestScore === 2 && domain.length < 8)) return null;
  return `${email.slice(0, at)}@${best}`;
}

export function nameProblem(value: string): string | null {
  const name = value.trim();
  if (name.length < 2) return "Enter at least 2 characters.";
  if (name.length > 60) return "Keep it under 60 characters.";
  if (!/\p{L}/u.test(name)) return "Your name needs at least one letter.";
  if (/@|:\/\/|www\.|\.(?:com|net|org|in|io|xyz|ru)\b/i.test(name)) {
    return "Enter just your name, without links or email addresses.";
  }
  if (/[<>{}[\]\\]/.test(name)) return "Leave out symbols like < > { } [ ].";
  return null;
}

export interface PasswordCheck {
  label: string;
  met: boolean;
}

export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", met: value.length >= 8 },
    { label: "A letter", met: /[A-Za-z]/.test(value) },
    { label: "A number", met: /\d/.test(value) },
  ];
}

export function passwordProblem(value: string, personal: readonly string[] = []): string | null {
  if (!value) return "Choose a password.";
  if (value.length > 72) return "Keep it under 72 characters.";
  if (value !== value.trim()) return "Remove the space at the start or end of the password.";
  if (!passwordChecks(value).every((c) => c.met)) return "Use at least 8 characters, with a letter and a number.";
  const lower = value.toLowerCase();
  const own = personal
    .flatMap((part) => (part.trim().toLowerCase().split("@")[0] ?? "").split(/[^\p{L}\p{N}]+/u))
    .filter((part) => part.length >= 4);
  if (own.some((part) => lower.includes(part))) return "Leave your name and email out of your password.";
  return null;
}

export function codeProblem(value: string): string | null {
  return /^\d{6}$/.test(value.trim()) ? null : "Enter the 6-digit code from the email.";
}
