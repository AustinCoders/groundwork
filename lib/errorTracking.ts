/**
 * Error tracking, off unless it is configured.
 *
 * Client errors used to be POSTed to /api/client-error and console.error'd into
 * the Vercel function log: no grouping, no alerting, no way to tell one broken
 * widget from a thousand. Sentry does all three, but it needs an account, so
 * everything here is behind NEXT_PUBLIC_SENTRY_DSN. Without it the import never
 * happens — the SDK sits in its own chunk that is never requested — and the log
 * endpoint stays the fallback.
 */
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";

export const errorTrackingEnabled = Boolean(SENTRY_DSN);

/** Where the SDK sends events, for the Content-Security-Policy. */
export function sentryOrigin(dsn = SENTRY_DSN): string | null {
  if (!dsn) return null;
  try {
    return new URL(dsn).origin;
  } catch {
    return null;
  }
}

export const SENTRY_OPTIONS = {
  dsn: SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV || "development",
  // A reading site, not a transaction-heavy app: a tenth of traffic is plenty
  // to spot a slow route and keeps the free quota for actual errors.
  tracesSampleRate: 0.1,
  // Nothing here is worth a session replay, and it is the expensive part.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
};

const ENDPOINT = "/api/client-error";

/**
 * Report one error from the browser. Goes to Sentry when it is configured, and
 * to the server log when it is not, so a deployment without a DSN still leaves
 * a trail.
 */
export async function reportError(error: unknown, context?: Record<string, string>): Promise<void> {
  const message = error instanceof Error ? error.message : String(error).slice(0, 200);
  const stack = error instanceof Error ? error.stack || "" : "";

  if (errorTrackingEnabled) {
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, context ? { extra: context } : undefined);
      return;
    } catch {
      // fall through to the log endpoint
    }
  }

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ message, stack, url: typeof location === "undefined" ? "" : location.href, ...context }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    // Reporting an error must never cause one.
  }
}
