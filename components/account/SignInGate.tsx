"use client";

import { openAuth } from "@/lib/account/config";
import { useAccount } from "@/lib/account/session";
import styles from "./account.module.css";

export type GatedFeature = "progress" | "review" | "mock-history" | "boards" | "account";

const COPY: Record<GatedFeature, { mark: string; title: string; body: string }> = {
  progress: {
    mark: "▤",
    title: "Sign in to see your progress",
    body: "Your streak, XP, badges and reading calendar live in your account, so they follow you to every device.",
  },
  review: {
    mark: "↻",
    title: "Sign in to open your review queue",
    body: "Spaced review needs to remember what you read and when. Sign in and the queue picks up from every device.",
  },
  "mock-history": {
    mark: "⏱",
    title: "Sign in to see how ready you are",
    body: "Past mock scorecards, trends and your readiness gauge are kept with your account. You can still run a mock without one.",
  },
  boards: {
    mark: "▱",
    title: "Sign in to see your saved boards",
    body: "Your saved boards are kept with your account. You can still draw on this board without one.",
  },
  account: {
    mark: "◉",
    title: "Sign in to manage your account",
    body: "Change your name and goals, check sync, download your data or delete the account.",
  },
};

export function SignInGate({
  feature,
  compact,
  children,
}: {
  feature: GatedFeature;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const account = useAccount();
  if (account.status === "off" || account.status === "in") return <>{children}</>;
  if (account.status === "loading") return <div className={styles.gateWait} aria-busy="true" />;
  const copy = COPY[feature];
  return (
    <section className={`${styles.gate}${compact ? ` ${styles.gateCompact}` : ""}`} aria-labelledby={`gate-${feature}`}>
      <span className={styles.gateMark} aria-hidden="true">
        {copy.mark}
      </span>
      <h2 id={`gate-${feature}`} className={styles.gateTitle}>
        {copy.title}
      </h2>
      <p className={styles.gateBody}>{copy.body}</p>
      <div className={styles.gateActions}>
        <button type="button" className={`${styles.gateBtn} ${styles.gatePrimary}`} onClick={() => openAuth("sign-up")}>
          Create a free account
        </button>
        <button type="button" className={styles.gateBtn} onClick={() => openAuth("sign-in")}>
          Sign in
        </button>
      </div>
      <p className={styles.gateNote}>
        Nothing is lost while you decide: what you read and solve is still saved on this device, and it moves into your
        account the moment you sign in.
      </p>
    </section>
  );
}
