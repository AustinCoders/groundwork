import { describe, expect, it } from "vitest";
import { errorTrackingEnabled, SENTRY_DSN, SENTRY_OPTIONS, sentryOrigin } from "@/lib/errorTracking";

/**
 * Error tracking has to be genuinely optional: the repo is public and builds
 * without any Sentry environment at all. These pin the two things that would
 * otherwise break quietly — a DSN that cannot be parsed into a CSP origin, and
 * sampling that turns the free quota into a bill.
 */
describe("error tracking", () => {
  it("is off unless a DSN is configured", () => {
    expect(errorTrackingEnabled).toBe(Boolean(SENTRY_DSN));
  });

  it("reads the host a DSN sends to, for the Content-Security-Policy", () => {
    expect(sentryOrigin("https://abc123@o987654.ingest.sentry.io/4507")).toBe("https://o987654.ingest.sentry.io");
  });

  it("returns nothing rather than a broken CSP entry for a malformed DSN", () => {
    expect(sentryOrigin("")).toBeNull();
    expect(sentryOrigin("not-a-url")).toBeNull();
  });

  it("keeps session replay off and traces sampled", () => {
    expect(SENTRY_OPTIONS.replaysSessionSampleRate).toBe(0);
    expect(SENTRY_OPTIONS.replaysOnErrorSampleRate).toBe(0);
    expect(SENTRY_OPTIONS.tracesSampleRate).toBeGreaterThan(0);
    expect(SENTRY_OPTIONS.tracesSampleRate).toBeLessThanOrEqual(0.2);
  });

  it("never sends personally identifying data by default", () => {
    expect(SENTRY_OPTIONS.sendDefaultPii).toBe(false);
  });
});
