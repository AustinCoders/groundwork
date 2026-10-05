"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportError } from "@/lib/errorTracking";
import { PageFrame } from "@/components/frame/PageFrame";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Reader crashed:", error);
    reportError(error, { boundary: "reader", digest: error.digest || "" });
  }, [error]);

  return (
    <PageFrame title="Something broke" skipLabel="Skip to the content">
      <section className="sheet hero">
        <div className="soon-stamp" aria-hidden="true">
          error
        </div>
        <span className="hero__kicker">that didn&apos;t load</span>
        <h1>This page hit an error</h1>
        <p className="hero__lead">
          Nothing you did caused it, and nothing you&apos;ve read is lost — your progress is saved in this browser. Try
          loading the page again, or head back to the shelf.
        </p>
        <div className="hero__actions">
          <button className="btn btn--primary btn--big" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn--big" href="/">
            Back to all topics
          </Link>
        </div>
        {error.digest && (
          <p className="sub" style={{ marginTop: 18 }}>
            Reference code: <code>{error.digest}</code>
          </p>
        )}
      </section>
    </PageFrame>
  );
}
