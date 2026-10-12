"use client";

import { useEffect } from "react";
import { GLOBAL_ERROR_CSS } from "@/components/frame/globalErrorCss";
import { reportError } from "@/lib/errorTracking";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Fatal error:", error);
    reportError(error, { boundary: "global", digest: error.digest || "" });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>The app failed to start</title>
        <style>{GLOBAL_ERROR_CSS}</style>
      </head>
      <body>
        <main className="card">
          <span className="tape" aria-hidden="true" />
          <p className="kicker">something went badly wrong</p>
          <h1>The app failed to start</h1>
          <p className="lead">Your saved progress is untouched. Reloading usually fixes this.</p>
          <div className="actions">
            <button type="button" className="pill primary" onClick={reset}>
              Reload the app
            </button>
            <button type="button" className="pill" onClick={() => window.location.replace("/")}>
              Back to the start
            </button>
          </div>
          {error.digest && <p className="code">Reference code: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
