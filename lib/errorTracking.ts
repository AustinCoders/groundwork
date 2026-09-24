export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || "";

export const errorTrackingEnabled = Boolean(SENTRY_DSN);

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
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
};

const ENDPOINT = "/api/client-error";

export async function reportError(error: unknown, context?: Record<string, string>): Promise<void> {
  const message = error instanceof Error ? error.message : String(error).slice(0, 200);
  const stack = error instanceof Error ? error.stack || "" : "";

  if (errorTrackingEnabled) {
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error, context ? { extra: context } : undefined);
      return;
    } catch {}
  }

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ message, stack, url: typeof location === "undefined" ? "" : location.href, ...context }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {}
}
