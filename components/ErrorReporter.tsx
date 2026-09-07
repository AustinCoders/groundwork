"use client";

import { useEffect } from "react";

const ENDPOINT = "/api/client-error";
const MAX_REPORTS_PER_SESSION = 5;

/**
 * A page that throws in the browser used to fail silently — the reader saw a
 * broken widget and we saw nothing. This sends the first few errors of a
 * session to the server log, and stops, so a render loop cannot flood it.
 */
export function ErrorReporter() {
  useEffect(() => {
    let sent = 0;

    const report = (message: string, stack: string) => {
      if (sent >= MAX_REPORTS_PER_SESSION) return;
      sent += 1;
      const body = JSON.stringify({ message, stack, url: location.href });
      // keepalive so a navigation away does not cancel the report
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
