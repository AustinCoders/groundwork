import { errorTrackingEnabled, SENTRY_OPTIONS } from "@/lib/errorTracking";

if (errorTrackingEnabled) {
  import("@sentry/nextjs").then((Sentry) => Sentry.init(SENTRY_OPTIONS)).catch(() => {});
}

export function onRouterTransitionStart(url: string, navigationType: "push" | "replace" | "traverse") {
  if (!errorTrackingEnabled) return;
  import("@sentry/nextjs").then((Sentry) => Sentry.captureRouterTransitionStart(url, navigationType)).catch(() => {});
}
