"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/errorTracking";
import { PageFrame } from "@/components/frame/PageFrame";
import { LostScene } from "@/components/frame/LostScene";
import { Button, Underlined, topicKit } from "@/components/topic/TopicKit";
import styles from "@/components/frame/lost.module.css";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Reader crashed:", error);
    reportError(error, { boundary: "reader", digest: error.digest || "" });
  }, [error]);

  return (
    <PageFrame title="Something broke" skipLabel="Skip to the content" layout="reader">
      <LostScene
        accent="red"
        mark="!"
        kicker="that didn't load"
        heading={
          <>
            This page hit an <Underlined>error</Underlined>
          </>
        }
        lead="Nothing you did caused it. Try loading the page again, or head back to the shelf."
        actions={
          <>
            <button type="button" className={topicKit.btn} onClick={reset}>
              Try again
            </button>
            <Button ghost href="/">
              Back to all topics
            </Button>
          </>
        }
        stamp="error"
        stampNote="this page failed to load"
        stampTone="alert"
        sticker="✓ nothing lost"
        sideKicker="Your progress"
        remark="saved in this browser"
        moreKicker="Still stuck?"
        more={
          <p>
            Write to{" "}
            <a className={styles.mail} href="mailto:help@austincoders.com">
              help@austincoders.com
            </a>
            {error.digest ? " and include the reference code." : " and say what you were doing."}
          </p>
        }
      >
        <p>Everything you have read is saved in this browser, so none of it is lost.</p>
        {error.digest && (
          <p className={styles.digest}>
            Reference code: <code>{error.digest}</code>
          </p>
        )}
      </LostScene>
    </PageFrame>
  );
}
