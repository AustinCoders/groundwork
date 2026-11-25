"use client";

import { useState } from "react";
import type { TopicTrack } from "@/app/progress/progressModel";
import { hidePublicCard, publishPublicCard, saveUsername } from "@/lib/account/publicProfile";
import { useAccount } from "@/lib/account/session";
import { currentCard } from "@/lib/profile/cardNow";
import { usernameProblem } from "@/lib/profile/publicCard";
import { SITE_URL } from "@/lib/site";
import base from "./profile.module.css";
import styles from "./publicSection.module.css";

type Note = { ok: boolean; text: string } | null;

export function PublicSection({ tracks }: { tracks: TopicTrack[] }) {
  const account = useAccount();
  const profile = account.profile;
  const [draft, setDraft] = useState(profile?.username ?? "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [copied, setCopied] = useState(false);
  if (!account.user || !profile) return null;
  const user = account.user;
  const ready = profile.emails !== null;
  const saved = profile.username;
  const url = saved ? `${SITE_URL}/u/${saved}` : null;
  const typed = draft.trim().toLowerCase();
  const problem = typed && typed !== saved ? usernameProblem(typed) : null;

  async function run(task: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setBusy(true);
    setNote(null);
    const result = await task();
    setBusy(false);
    setNote(result.ok ? { ok: true, text: success } : { ok: false, text: result.error ?? "Something went wrong." });
  }

  function claim() {
    if (!typed || problem || typed === saved) return;
    void run(() => saveUsername(typed), `Your username is now ${typed}.`);
  }

  function publish() {
    void run(
      () => publishPublicCard(currentCard(user, profile, tracks)),
      profile?.isPublic ? "Updated your public page." : "Your public page is live."
    );
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const shareText = "My learning progress on Groundwork";

  return (
    <section className={base.card} aria-labelledby="profile-public">
      <h2 id="profile-public" className={base.cardTitle}>
        Public profile
      </h2>
      <p className={base.hint}>
        Off unless you turn it on. When it is on, anyone with the link sees your name, headline, location, links, level,
        streak, topics, badges and a six-month calendar. Never your email, photo, resume, plan or scores.
      </p>
      {!ready ? (
        <p className={styles.soon}>Public profiles are being switched on. Check back in a little while.</p>
      ) : (
        <>
          <div className={base.field}>
            <label className={base.label} htmlFor="public-username">
              Username
            </label>
            <div className={styles.claim}>
              <span className={styles.prefix} aria-hidden="true">
                /u/
              </span>
              <input
                id="public-username"
                className={`${base.input} ${styles.username}`}
                value={draft}
                maxLength={30}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={problem ? true : undefined}
                aria-describedby="public-username-hint"
                onChange={(e) => {
                  setDraft(e.target.value.toLowerCase().replace(/\s/g, ""));
                  setNote(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    claim();
                  }
                }}
              />
              <button
                type="button"
                className={styles.btn}
                disabled={busy || !typed || Boolean(problem) || typed === saved}
                onClick={claim}
              >
                {saved ? "Change" : "Save"}
              </button>
            </div>
            <p id="public-username-hint" className={problem ? styles.bad : base.hint}>
              {problem ?? "3 to 30 lowercase letters, numbers and hyphens. It becomes your link."}
            </p>
          </div>

          <div className={styles.state} data-on={profile.isPublic || undefined}>
            <div>
              <p className={styles.stateTitle}>
                {profile.isPublic ? "Your public page is on" : "Your public page is off"}
              </p>
              <p className={base.hint}>
                {profile.isPublic
                  ? "It refreshes on its own when you open your progress page. Update it now after a big day."
                  : saved
                    ? "Turn it on to get a link you can put on LinkedIn or your resume."
                    : "Save a username first."}
              </p>
            </div>
            <div className={styles.actions}>
              {profile.isPublic && (
                <button type="button" className={styles.btn} disabled={busy} onClick={publish}>
                  Update now
                </button>
              )}
              <button
                type="button"
                className={profile.isPublic ? styles.btnDanger : styles.btnPrimary}
                disabled={busy || !saved}
                onClick={() =>
                  profile.isPublic
                    ? void run(() => hidePublicCard(), "Your public page is off. The link no longer works.")
                    : publish()
                }
              >
                {profile.isPublic ? "Turn off" : "Turn on"}
              </button>
            </div>
          </div>

          {profile.isPublic && url && (
            <div className={styles.share}>
              <a className={styles.link} href={`/u/${saved}`} target="_blank" rel="noopener">
                {url.replace(/^https?:\/\//, "")}
              </a>
              <div className={styles.actions}>
                <button type="button" className={styles.btn} onClick={() => void copy()}>
                  {copied ? "Copied" : "Copy link"}
                </button>
                <a
                  className={styles.btn}
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on LinkedIn
                </a>
                <a
                  className={styles.btn}
                  href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on X
                </a>
              </div>
            </div>
          )}
        </>
      )}
      {note && (
        <p className={note.ok ? base.ok : base.error} role={note.ok ? "status" : "alert"}>
          {note.text}
        </p>
      )}
    </section>
  );
}
