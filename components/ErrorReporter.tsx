"use client";

import { useEffect } from "react";
import { errorTrackingEnabled } from "@/lib/errorTracking";

const ENDPOINT = "/api/client-error";
const MAX_REPORTS_PER_SESSION = 5;

export function ErrorReporter() {
  useEffect(() => {
    if (errorTrackingEnabled) return;
    let sent = 0;

    const report = (message: string, stack: string) => {
      if (sent >= MAX_REPORTS_PER_SESSION) return;
      sent += 1;
      const body = JSON.stringify({ message, stack, url: location.href });
      fetch(ENDPOINT, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
        () => {}
      );
    };

    const onError = (event: ErrorEvent) => report(event.message, event.error?.stack || "");
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      report(
        reason instanceof Error ? reason.message : String(reason).slice(0, 200),
        reason instanceof Error ? reason.stack || "" : ""
      );
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
