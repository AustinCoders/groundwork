"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AvatarArt } from "@/components/account/AvatarArt";
import { avatarStyle } from "@/lib/account/avatar";
import { requestConnection, type NetResult, type NetworkFace } from "@/lib/account/network";
import { isAvatarArt } from "@/lib/account/profileExtras";
import {
  FEED_KINDS,
  loadFeed,
  loadInviteCode,
  loadMentors,
  loadSocialPrefs,
  updateSocialPrefs,
  type FeedItem,
  type FeedKind,
} from "@/lib/account/social";
import { SITE_URL } from "@/lib/site";
import styles from "./people.module.css";

type Act = (key: string, task: () => Promise<NetResult<string | null>>, text?: string) => Promise<void>;

const FEED_MARK: Record<FeedKind, string> = { topic: "📘", streak: "🔥", level: "⬆", challenge: "🏁", badge: "🏅" };

function ago(iso: string, now: number): string {
  if (!now) return "";
  const hours = Math.round((now - Date.parse(iso)) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export function FeedPanel({ now, reloadKey }: { now: number; reloadKey: number }) {
  const [items, setItems] = useState<FeedItem[] | null>(null);
  useEffect(() => {
    let live = true;
    void loadFeed().then((r) => {
      if (live) setItems(r.ok ? r.value : []);
    });
    return () => {
      live = false;
    };
  }, [reloadKey]);
  if (items === null) return null;
  return (
    <section className={styles.card} aria-labelledby="people-feed">
      <h2 id="people-feed" className={styles.title}>
        Friends&apos; news
      </h2>
      {items.length === 0 ? (
        <p className={styles.empty}>
          Nothing in the last two weeks. Finished topics, streaks, level-ups and challenges show up here.
        </p>
      ) : (
        <ul className={styles.feed}>
          {items.slice(0, 15).map((item) => (
            <li key={item.id} className={styles.feedItem}>
              <span
                className={styles.feedFace}
                style={avatarStyle(item.who.color) as CSSProperties | undefined}
                aria-hidden="true"
              >
                {isAvatarArt(item.who.art) ? <AvatarArt art={item.who.art} /> : item.who.name[0]?.toUpperCase()}
              </span>
              <span>
                <strong>{item.me ? "You" : item.who.name}</strong> {item.text}{" "}
                <span aria-hidden="true">{FEED_MARK[item.kind]}</span>
              </span>
              <span className={styles.when}>{ago(item.at, now)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MentorsPanel({ busy, act }: { busy: boolean; act: Act }) {
  const [mentors, setMentors] = useState<(NetworkFace & { relation: NetworkFace["relation"] })[] | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    void loadMentors().then((r) => {
      if (live) setMentors(r.ok ? r.value : []);
    });
    return () => {
      live = false;
    };
  }, [tick]);
  if (!mentors || mentors.length === 0) return null;
  return (
    <section className={styles.card} aria-labelledby="people-mentors">
      <h2 id="people-mentors" className={styles.title}>
        Mentors <span className={styles.count}>{mentors.length}</span>
      </h2>
      <p className={styles.hint}>Experienced developers happy to run a mock interview. Connect first, then book one.</p>
      <ul className={styles.list}>
        {mentors.slice(0, 6).map((m) => (
          <li key={m.username} className={styles.person}>
            <span
              className={styles.avatar}
              style={avatarStyle(m.color) as CSSProperties | undefined}
              aria-hidden="true"
            >
              {isAvatarArt(m.art) ? <AvatarArt art={m.art} /> : m.name[0]?.toUpperCase()}
            </span>
            <div className={styles.who}>
              <p className={styles.name}>
                {m.name} <span className={styles.mentorTag}>Mentor</span>
              </p>
              {m.mentorNote && <p className={styles.headline}>{m.mentorNote}</p>}
              <p className={styles.stats}>
                <span>Level {m.level}</span>
                <span>@{m.username}</span>
              </p>
            </div>
            <div className={styles.actions}>
              {m.relation === "connected" ? (
                <a className={styles.btn} href={`/mock/peer?with=${m.username}`}>
                  Book a mock
                </a>
              ) : m.relation === "sent" ? (
                <span className={styles.tag}>Requested</span>
              ) : (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy}
                  onClick={() =>
                    void act(
                      `request:${m.username}`,
                      () => requestConnection(m.username),
                      `Request sent to ${m.name}.`
                    ).then(() => setTick((t) => t + 1))
                  }
                >
                  Connect
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MoreSettings({ busy, act }: { busy: boolean; act: Act }) {
  const [prefs, setPrefs] = useState<{ feedOff: FeedKind[]; mentor: boolean; mentorNote: string } | null>(null);
  const [note, setNote] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    void Promise.all([loadSocialPrefs(), loadInviteCode(false)]).then(([p, c]) => {
      if (!live) return;
      if (p.ok && p.value) {
        setPrefs(p.value);
        setNote(p.value.mentorNote);
      }
      if (c.ok) setCode(c.value);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!prefs) return null;
  const link = code ? `${SITE_URL}/join/${code}` : null;

  async function save(
    row: { feed_off?: string[]; mentor?: boolean; mentor_note?: string },
    next: typeof prefs,
    text: string
  ) {
    const before = prefs;
    setPrefs(next);
    await act(
      "prefs",
      async () => {
        const r = await updateSocialPrefs(row);
        if (!r.ok) setPrefs(before);
        return r;
      },
      text
    );
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {link && (
        <section className={styles.card} aria-labelledby="people-invite">
          <h2 id="people-invite" className={styles.title}>
            Your invite link
          </h2>
          <p className={styles.hint}>Anyone who joins with it becomes your connection straight away.</p>
          <code className={styles.inviteLink}>{link.replace(/^https?:\/\//, "")}</code>
          <div className={styles.row}>
            <button type="button" className={styles.btn} onClick={() => void copy()}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              className={styles.btnQuiet}
              disabled={busy}
              onClick={() =>
                void act(
                  "invite-new",
                  async () => {
                    const r = await loadInviteCode(true);
                    if (r.ok) setCode(r.value);
                    return r.ok ? { ok: true as const, value: null } : r;
                  },
                  "New link made. The old one stopped working."
                )
              }
            >
              New link
            </button>
          </div>
        </section>
      )}

      <section className={styles.card} aria-labelledby="people-share">
        <h2 id="people-share" className={styles.title}>
          What goes in friends&apos; news
        </h2>
        <ul className={styles.switches}>
          {FEED_KINDS.map((kind) => {
            const on = !prefs.feedOff.includes(kind.id);
            return (
              <li key={kind.id}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={busy}
                    onChange={() => {
                      const off = on ? [...prefs.feedOff, kind.id] : prefs.feedOff.filter((k) => k !== kind.id);
                      void save(
                        { feed_off: off },
                        { ...prefs, feedOff: off },
                        on ? "Hidden from friends' news." : "Shared again."
                      );
                    }}
                  />
                  <span>{kind.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.card} aria-labelledby="people-mentor">
        <h2 id="people-mentor" className={styles.title}>
          Mentor
        </h2>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={prefs.mentor}
            disabled={busy}
            onChange={() =>
              void save(
                { mentor: !prefs.mentor, mentor_note: note.trim().slice(0, 120) },
                { ...prefs, mentor: !prefs.mentor },
                prefs.mentor ? "You are no longer listed as a mentor." : "You are listed as a mentor."
              )
            }
          />
          <span>List me as a mentor so juniors can ask me for mock interviews</span>
        </label>
        {prefs.mentor && (
          <form
            className={styles.mentorForm}
            onSubmit={(e) => {
              e.preventDefault();
              void save({ mentor_note: note.trim().slice(0, 120) }, { ...prefs, mentorNote: note.trim() }, "Saved.");
            }}
          >
            <label className={styles.searchLabel} htmlFor="mentor-note">
              One line about what you can help with
            </label>
            <input
              id="mentor-note"
              className={styles.input}
              value={note}
              maxLength={120}
              placeholder="Senior frontend, happy to run React mocks"
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit" className={styles.btn} disabled={busy || note.trim() === prefs.mentorNote}>
              Save
            </button>
          </form>
        )}
      </section>
    </>
  );
}
