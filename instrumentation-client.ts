import { errorTrackingEnabled, SENTRY_OPTIONS } from "@/lib/errorTracking";

// Dynamic so the SDK lands in a chunk of its own. With no DSN configured the
// chunk is never requested and the browser downloads nothing extra.
if (errorTrackingEnabled) {
  import("@sentry/nextjs")
    .then((Sentry) => Sentry.init(SENTRY_OPTIONS))
    .catch(() => {
      // Monitoring that fails to load must not take the page with it.
    });
}

export function onRouterTransitionStart(url: string, navigationType: "push" | "replace" | "traverse") {
  if (!errorTrackingEnabled) return;
  import("@sentry/nextjs").then((Sentry) => Sentry.captureRouterTransitionStart(url, navigationType)).catch(() => {});
}
