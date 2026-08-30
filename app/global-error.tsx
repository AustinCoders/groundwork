"use client";

import { useEffect } from "react";

/**
 * Replaces the root layout entirely, so it can't use Shell or rely on the
 * theme system having booted. Styles are inline and self-contained on
 * purpose — this is the screen that has to render when nothing else did.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Fatal error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#faf8f2",
          color: "#1b1b1b",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <main style={{ maxWidth: 460, textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8a8377",
            }}
          >
            something went badly wrong
          </p>
          <h1 style={{ margin: "0 0 14px", fontSize: 30, lineHeight: 1.15 }}>The app failed to start</h1>
          <p style={{ margin: "0 0 24px", fontSize: 17, lineHeight: 1.6, color: "#4a463f" }}>
            Your saved progress is untouched. Reloading usually fixes this.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              font: "inherit",
              fontSize: 16,
              padding: "11px 22px",
              color: "#faf8f2",
              background: "#1b1b1b",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Reload the app
          </button>
          {error.digest && (
            <p style={{ marginTop: 22, fontSize: 13, color: "#8a8377" }}>Reference code: {error.digest}</p>
          )}
        </main>
      </body>
    </html>
  );
}
