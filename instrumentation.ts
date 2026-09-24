import type { Instrumentation } from "next";
import { errorTrackingEnabled, SENTRY_OPTIONS } from "@/lib/errorTracking";

export async function register() {
  if (!errorTrackingEnabled) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init(SENTRY_OPTIONS);
}

export const onRequestError: Instrumentation.onRequestError = async (...args) => {
  if (!errorTrackingEnabled) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};
