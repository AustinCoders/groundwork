"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/lib/errorTracking";
import { clearSavedData } from "@/lib/storage";
import { PageFrame } from "@/components/frame/PageFrame";
import { LostScene } from "@/components/frame/LostScene";
import { Button, Underlined, topicKit } from "@/components/topic/TopicKit";
import styles from "@/components/frame/lost.module.css";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [confirming, setConfirming] = useState(false);

  function resetSavedData() {
    clearSavedData();
    window.location.reload();
  }

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
            {confirming ? (
              <div
                role="alertdialog"
                aria-labelledby="reset-title"
                aria-describedby="reset-note"
                className={styles.reset}
              >
                <p id="reset-title">
                  <strong>Reset saved data on this device?</strong>
                </p>
                <p id="reset-note">
                  This clears your progress, review schedule, settings and saved code in this browser. Whiteboards are
                  kept. Use it if the page keeps failing after Try again. It cannot be undone.
                </p>
                <div className={styles.resetActions}>
                  <button type="button" className={topicKit.btn} onClick={resetSavedData}>
                    Yes, reset and reload
                  </button>
                  <button type="button" className={topicKit.btnGhost} onClick={() => setConfirming(false)}>
                    Keep my data
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={topicKit.btnGhost} onClick={() => setConfirming(true)}>
                Reset saved data on this device
              </button>
            )}
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
        <p>If Try again keeps failing, bad saved data can be the cause. You can reset it from the buttons above.</p>
        {error.digest && (
          <p className={styles.digest}>
            Reference code: <code>{error.digest}</code>
          </p>
        )}
      </LostScene>
    </PageFrame>
  );
}
