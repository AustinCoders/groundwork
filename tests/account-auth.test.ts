import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captchaSiteKey } from "@/lib/account/config";
import { friendlyAuthError } from "@/lib/account/errors";
import { lastSignInMethod, rememberSignInMethod } from "@/lib/account/lastMethod";
import { markOnboardingDone, needsOnboarding, onboardingDone } from "@/lib/account/onboarding";
import type { Profile } from "@/lib/account/session";
import { isCommonPassword, passwordStrength } from "@/lib/account/strength";

const blank: Profile = {
  displayName: "Ada",
  goal: null,
  experience: null,
  targetRole: null,
  plan: "free",
  planExpiresAt: null,
  username: null,
  isPublic: false,
  publicAt: null,
  emails: null,
};

describe("passwordStrength", () => {
  it("gives no label for an empty password", () => {
    expect(passwordStrength("")).toEqual({ score: 0, label: "", tip: null });
  });

  it("calls anything under 8 characters too weak", () => {
    expect(passwordStrength("a1b2c3").score).toBe(0);
    expect(passwordStrength("a1b2c3").tip).toMatch(/8 characters/);
  });

  it("scores common passwords zero, even with digits added", () => {
    for (const pw of ["password", "Password123", "qwerty2024", "12345678", "11111111", "groundwork1"]) {
      expect(isCommonPassword(pw), pw).toBe(true);
      expect(passwordStrength(pw).score, pw).toBe(0);
    }
  });

  it("rewards length and variety", () => {
    expect(passwordStrength("river42boat").score).toBe(1);
    expect(passwordStrength("river42boatlamp").score).toBe(2);
    expect(passwordStrength("river42boatlamps").score).toBe(3);
    expect(passwordStrength("River42!boat-lamp").score).toBe(4);
    expect(passwordStrength("River42!boat-lamp").label).toBe("Strong");
  });

  it("marks down passwords built from the email or name", () => {
    const plain = passwordStrength("Lovelace!2024x");
    const personal = passwordStrength("Lovelace!2024x", ["ada.lovelace@example.com", "Ada"]);
    expect(personal.score).toBe(plain.score - 1);
    expect(personal.tip).toMatch(/name and email/);
  });

  it("marks down runs and repeats", () => {
    expect(passwordStrength("zebra1234moon").tip).toMatch(/1234/);
    expect(passwordStrength("zebraaaaamoon9").score).toBeLessThan(passwordStrength("zebrafarmmoon9").score);
  });

  it("never leaves the 0 to 4 range", () => {
    for (const pw of ["a", "abcdefgh1", "Aa1!".repeat(10), "aaaaaaaa1"]) {
      const { score } = passwordStrength(pw, ["aaaa@x.io"]);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(4);
    }
  });
});

describe("onboarding", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("asks only when the profile has loaded and all three answers are empty", () => {
    expect(needsOnboarding(null)).toBe(false);
    expect(needsOnboarding(blank)).toBe(true);
    expect(needsOnboarding({ ...blank, goal: "interview" })).toBe(false);
    expect(needsOnboarding({ ...blank, targetRole: "frontend" })).toBe(false);
  });

  it("remembers per user that the step was answered or skipped", () => {
    expect(onboardingDone("u1")).toBe(false);
    markOnboardingDone("u1");
    expect(onboardingDone("u1")).toBe(true);
    expect(onboardingDone("u2")).toBe(false);
  });
});

describe("the last sign-in method", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("is empty until one is used, then remembers it", () => {
    expect(lastSignInMethod()).toBeNull();
    rememberSignInMethod("github");
    expect(lastSignInMethod()).toBe("github");
    rememberSignInMethod("code");
    expect(lastSignInMethod()).toBe("code");
  });

  it("ignores a value it does not know", () => {
    localStorage.setItem("gw-last-sign-in", "facebook");
    expect(lastSignInMethod()).toBeNull();
  });
});

describe("the bot check and the second step", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("turns the bot check on only with a well-formed site key", () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    expect(captchaSiteKey()).toBe("");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "0x4AAAAAAA_site_key");
    expect(captchaSiteKey()).toBe("0x4AAAAAAA_site_key");
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "bad key <script>");
    expect(captchaSiteKey()).toBe("");
  });

  it("explains a failed bot check, a wrong authenticator code and a missing second step", () => {
    expect(friendlyAuthError({ code: "captcha_failed" })).toMatch(/person/);
    expect(friendlyAuthError({ code: "mfa_verification_failed" })).toMatch(/authenticator app/);
    expect(friendlyAuthError({ code: "insufficient_aal" })).toMatch(/authenticator app/);
    expect(friendlyAuthError({ message: "Token has expired or is invalid" })).toMatch(/wrong or has expired/);
  });
});
