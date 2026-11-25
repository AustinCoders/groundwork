"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { TopicTrack } from "@/app/progress/progressModel";
import { AvatarArt } from "@/components/account/AvatarArt";
import { SignInGate } from "@/components/account/SignInGate";
import { ConfirmDialog, ReportDialog } from "@/components/Modal";
import { avatarStyle } from "@/lib/account/avatar";
import {
  blockPerson,
  cheer,
  findPeople,
  joinNetwork,
  leaderboard,
  leaveNetwork,
  loadOverview,
  markCheersSeen,
  publishNetworkCard,
  removeConnection,
  reportPerson,
  requestConnection,
  respondConnection,
  setDiscoverable,
  suggestPeople,
  unblockPerson,
  weekCount,
  type CheerKind,
  type NetResult,
  type NetworkFace,
  type NetworkOverview,
} from "@/lib/account/network";
import { isAvatarArt } from "@/lib/account/profileExtras";
import { useAccount } from "@/lib/account/session";
import { useClientValue } from "@/lib/hooks";
import { currentCard } from "@/lib/profile/cardNow";
import { ROLE_TITLE } from "@/lib/profile/roles";
import type { RoleId } from "@/lib/profile/roleTracks";
import { dayKey, store } from "@/lib/storage";
import { INVITE_CODE, INVITE_KEY, loadBuddy, redeemInvite, type BuddyView } from "@/lib/account/social";
import { FeedPanel, MentorsPanel, MoreSettings } from "./SocialPanels";
import { BuddyPanel, ChallengePanel, DailyPanel } from "./StudyPanels";
import styles from "./people.module.css";

type Note = { ok: boolean; text: string } | null;
type Pending = { kind: "remove" | "block" | "leave" | "cancel"; username: string; name: string } | null;

const CHEERS: { kind: CheerKind; mark: string; label: string; done: string }[] = [
  { kind: "clap", mark: "👏", label: "Clap", done: "clapped for" },
  { kind: "fire", mark: "🔥", label: "Keep it up", done: "cheered on" },
  { kind: "nudge", mark: "⏰", label: "Nudge", done: "nudged" },
];

const RECEIVED: Record<CheerKind, string> = {
  clap: "clapped for you",
  fire: "says keep the streak going",
  nudge: "nudged you to study today",
};

const REASONS = [
  { id: "spam", label: "Spam or advertising" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "fake", label: "Fake account or pretending to be someone" },
  { id: "inappropriate", label: "Rude or inappropriate profile" },
  { id: "other", label: "Something else" },
] as const;

const STATUS: Record<string, { ok: boolean; text: string }> = {
  sent: { ok: true, text: "Request sent." },
  connected: { ok: true, text: "You are connected." },
  declined: { ok: true, text: "Request declined." },
  removed: { ok: true, text: "Removed." },
  blocked: { ok: true, text: "Blocked. They can't find you, see you or send you requests." },
  unblocked: { ok: true, text: "Unblocked." },
  reported: { ok: true, text: "Thanks for telling us. We'll look into it." },
  not_found: { ok: false, text: "We couldn't find that person. They may have left connections." },
  self: { ok: false, text: "That's you." },
  full: { ok: false, text: "You have reached 500 connections. Remove someone to add more." },
  limit: { ok: false, text: "That is a lot for one day. Try again tomorrow." },
  already: { ok: false, text: "You already sent that one today. Try again tomorrow." },
  not_connected: { ok: false, text: "You can only cheer people you are connected with." },
  buddy_sent: { ok: true, text: "Asked. They will see it in their notifications." },
  buddy_active: { ok: true, text: "You are study buddies now." },
};

function nowMinute(): number {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function ago(iso: string | null, now: number): string {
  if (!iso || !now) return "";
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "")).toUpperCase() || "?";
}

function closeMenu(target: EventTarget) {
  if (target instanceof Element) target.closest("details")?.removeAttribute("open");
}

function Face({ face }: { face: Pick<NetworkFace, "name" | "color" | "art"> }) {
  return (
    <span className={styles.avatar} style={avatarStyle(face.color) as CSSProperties | undefined} aria-hidden="true">
      {isAvatarArt(face.art) ? <AvatarArt art={face.art} /> : initials(face.name)}
    </span>
  );
}

function Who({ face, today }: { face: NetworkFace; today: string }) {
  const week = today ? weekCount(face, today) : 0;
  return (
    <div className={styles.who}>
      <p className={styles.name}>
        {face.name} <span className={styles.handle}>@{face.username}</span>
        {face.mentor && <span className={styles.mentorTag}>Mentor</span>}
      </p>
      {(face.headline || face.role) && (
        <p className={styles.headline}>{face.headline || ROLE_TITLE[face.role as RoleId]}</p>
      )}
      <p className={styles.stats}>
        <span>Level {face.level}</span>
        <span>{face.streak > 0 ? `🔥 ${face.streak}-day streak` : "No streak yet"}</span>
        <span>{week} this week</span>
      </p>
    </div>
  );
}

export function PeopleView({ tracks }: { tracks: TopicTrack[] }) {
  return (
    <SignInGate feature="people">
      <People tracks={tracks} />
    </SignInGate>
  );
}

function People({ tracks }: { tracks: TopicTrack[] }) {
  const account = useAccount();
  const user = account.user;
  const profile = account.profile;
  const userId = user?.id ?? "";
  const today = useClientValue(dayKey, "");
  const now = useClientValue(nowMinute, 0);

  const [data, setData] = useState<NetworkOverview | null>(null);
  const [problem, setProblem] = useState<{ text: string; code?: string } | null>(null);
  const [suggested, setSuggested] = useState<NetworkFace[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NetworkFace[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Note>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [reporting, setReporting] = useState<{ username: string; name: string } | null>(null);
  const [findable, setFindable] = useState(true);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [searchTick, setSearchTick] = useState(0);
  const [buddy, setBuddy] = useState<BuddyView | null>(null);

  const apply = useCallback((result: NetResult<NetworkOverview>) => {
    if (result.ok) {
      setData(result.value);
      setProblem(null);
      return result.value;
    }
    setProblem({ text: result.error, code: result.code });
    return null;
  }, []);

  const reload = useCallback(async () => {
    const view = apply(await loadOverview());
    if (view?.me.on) {
      const [more, pair] = await Promise.all([suggestPeople(), loadBuddy()]);
      if (more.ok) setSuggested(more.value);
      setBuddy(pair.ok ? pair.value : null);
    }
  }, [apply]);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void loadOverview().then(async (result) => {
      if (!live) return;
      const view = apply(result);
      if (!view) return;
      const unseen = view.cheers.filter((c) => !c.seen).map((c) => `${c.username}:${c.kind}:${c.at}`);
      if (unseen.length) {
        setFresh(new Set(unseen));
        void markCheersSeen();
      }
      if (view.me.on) {
        const [more, pair] = await Promise.all([suggestPeople(), loadBuddy()]);
        if (!live) return;
        if (more.ok) setSuggested(more.value);
        if (pair.ok) setBuddy(pair.value);
      }
    });
    return () => {
      live = false;
    };
  }, [userId, apply]);

  const typed = query.trim().toLowerCase();
  useEffect(() => {
    if (!data?.me.on || !/^[a-z0-9-]{2,30}$/.test(typed)) return;
    let live = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      void findPeople(typed).then((r) => {
        if (!live) return;
        setSearching(false);
        if (r.ok) setResults(r.value);
        else setNote({ ok: false, text: r.error });
      });
    }, 350);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [typed, data?.me.on, searchTick]);

  const mine = useMemo(
    () => (user && today ? currentCard(user, profile, tracks) : null),
    [user, profile, tracks, today]
  );

  const board = useMemo(() => {
    if (!data || !mine || !today) return [];
    return leaderboard(
      {
        username: data.me.username ?? "",
        name: "You",
        week: weekCount(mine, today),
        streak: mine.streak,
        level: mine.level,
        me: true,
      },
      data.connections,
      today
    );
  }, [data, mine, today]);

  if (!user) return null;

  async function act(key: string, task: () => Promise<NetResult<string | null>>, text?: string) {
    setBusy(key);
    setNote(null);
    const result = await task();
    setBusy(null);
    if (!result.ok) {
      setNote({ ok: false, text: result.error });
      return;
    }
    const known = result.value ? STATUS[result.value] : undefined;
    setNote(known && !known.ok ? known : { ok: true, text: text ?? known?.text ?? "Done." });
    await reload();
    setSearchTick((t) => t + 1);
  }

  async function join() {
    if (!user || !mine) return;
    await act("join", () => joinNetwork(mine, findable), "You're in. Find a friend by their username below.");
    const saved = store.get<unknown>(INVITE_KEY, null);
    const code = saved && typeof saved === "object" && "code" in saved ? String((saved as { code: unknown }).code) : "";
    if (INVITE_CODE.test(code)) {
      const result = await redeemInvite(code);
      store.remove(INVITE_KEY);
      if (result.ok && result.value.status === "connected") {
        setNote({ ok: true, text: "You're in, and connected with the friend who invited you." });
        await reload();
      }
    }
  }

  async function confirmPending() {
    const p = pending;
    setPending(null);
    if (!p) return;
    if (p.kind === "leave") {
      await act("leave", () => leaveNetwork(), "You left connections. Nobody can see you until you join again.");
    } else if (p.kind === "block") {
      await act(`block:${p.username}`, () => blockPerson(p.username), `${p.name} is blocked.`);
    } else if (p.kind === "cancel") {
      await act(`remove:${p.username}`, () => removeConnection(p.username), "Request cancelled.");
    } else {
      await act(`remove:${p.username}`, () => removeConnection(p.username), `${p.name} is no longer a connection.`);
    }
  }

  const notReady = problem?.code === "not_ready";

  if (problem && !data) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <h2 className={styles.title}>Connections</h2>
          <p className={notReady ? styles.soon : styles.error} role={notReady ? undefined : "alert"}>
            {problem.text}
          </p>
          {!notReady && (
            <div className={styles.row}>
              <button type="button" className={styles.btn} onClick={() => void reload()}>
                Try again
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (!data) return <div className={styles.wait} aria-busy="true" aria-label="Loading connections" />;

  const username = profile?.username ?? data.me.username;
  const status = note && (
    <p className={note.ok ? styles.ok : styles.error} role={note.ok ? "status" : "alert"}>
      {note.text}
    </p>
  );

  if (!data.me.on) {
    return (
      <div className={styles.page}>
        <section className={styles.joinHero} aria-labelledby="people-join">
          <div className={styles.joinText}>
            <p className={styles.kicker}>People</p>
            <h1 id="people-join" className={styles.joinTitle}>
              Study with friends
            </h1>
            <p className={styles.joinLead}>
              Connect with other developers, keep each other&apos;s streaks alive, send a clap after a hard chapter and
              see who studied most this week.
            </p>
            {!username ? (
              <div className={styles.callout}>
                <p>Pick a username first. It is how friends find you.</p>
                <Link className={styles.btnPrimary} href="/account/profile#profile-public">
                  Choose a username
                </Link>
              </div>
            ) : (
              <div className={styles.joinAction}>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.btnLarge}`}
                  disabled={busy !== null || !mine}
                  onClick={() => void join()}
                >
                  {busy === "join" ? "Joining…" : "Join connections"}
                </button>
                <label className={styles.check}>
                  <input type="checkbox" checked={findable} onChange={(e) => setFindable(e.target.checked)} />
                  <span>
                    Let people find me as <span className={styles.mono}>@{username}</span>
                  </span>
                </label>
              </div>
            )}
            {status}
          </div>
          <div className={styles.joinArt} aria-hidden="true">
            <div className={styles.artCard}>
              <p className={styles.artTitle}>This week</p>
              {[
                { name: "Ravi", n: 27, mark: "🏆", color: "green" },
                { name: "You", n: 18, mark: "2", color: "purple", me: true },
                { name: "Meera", n: 11, mark: "3", color: "orange" },
              ].map((row) => (
                <div key={row.name} className={styles.artRow} data-me={row.me || undefined}>
                  <span className={styles.artRank}>{row.mark}</span>
                  <span className={styles.artDot} style={{ "--avatar": `var(--c-${row.color})` } as CSSProperties}>
                    {row.name[0]}
                  </span>
                  <span className={styles.artName}>{row.name}</span>
                  <span className={styles.artCount}>{row.n}</span>
                </div>
              ))}
            </div>
            <div className={styles.artCheer}>
              <span>👏</span> Ravi clapped for you
            </div>
          </div>
        </section>

        <ul className={styles.features}>
          {[
            { mark: "🤝", title: "Requests need a yes", text: "Nobody joins your list unless you accept them." },
            { mark: "🏆", title: "A weekly board", text: "Chapters and problems done in the last seven days." },
            { mark: "👏", title: "Cheers, not chat", text: "Clap, keep-it-up and nudge. No messages to manage." },
            { mark: "🛡", title: "You stay in control", text: "Remove, block or report anyone. Leave any time." },
          ].map((f) => (
            <li key={f.title} className={styles.feature}>
              <span className={styles.featureMark} aria-hidden="true">
                {f.mark}
              </span>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureText}>{f.text}</p>
            </li>
          ))}
        </ul>

        <section className={styles.privacy} aria-labelledby="people-privacy">
          <h2 id="people-privacy" className={styles.privacyTitle}>
            What your connections see
          </h2>
          <div className={styles.privacyCols}>
            <div>
              <p className={styles.privacyHead} data-kind="yes">
                Shared with connections
              </p>
              <p className={styles.privacyText}>
                Name, username, headline, role, avatar, level, XP, streak, chapter and problem counts, your daily goal,
                this week&apos;s challenge and the last four weeks of activity.
              </p>
            </div>
            <div>
              <p className={styles.privacyHead} data-kind="no">
                Never shared
              </p>
              <p className={styles.privacyText}>
                Your email, photo, resume, interview plan and date, company list and scores.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const shown = typed.length >= 2 ? results : null;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.h1}>People</h1>
        <p className={styles.headMeta}>
          {data.connections.length === 1 ? "1 connection" : `${data.connections.length} connections`}
          {data.incoming.length > 0 &&
            ` · ${data.incoming.length === 1 ? "1 request" : `${data.incoming.length} requests`} waiting`}
          {` · you are @${data.me.username}`}
        </p>
      </header>

      {status && <div className={styles.toast}>{status}</div>}

      <div className={styles.columns}>
        <div className={styles.main}>
          {data.incoming.length > 0 && (
            <section className={`${styles.card} ${styles.attention}`} aria-labelledby="people-requests">
              <h2 id="people-requests" className={styles.title}>
                Requests <span className={styles.count}>{data.incoming.length}</span>
              </h2>
              <ul className={styles.list}>
                {data.incoming.map((face) => (
                  <li key={face.username} className={styles.person}>
                    <Face face={face} />
                    <Who face={face} today={today} />
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        disabled={busy !== null}
                        onClick={() =>
                          void act(
                            `accept:${face.username}`,
                            () => respondConnection(face.username, true),
                            `You and ${face.name} are connected.`
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={busy !== null}
                        onClick={() =>
                          void act(`decline:${face.username}`, () => respondConnection(face.username, false))
                        }
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className={styles.btnQuiet}
                        disabled={busy !== null}
                        onClick={() => setReporting({ username: face.username, name: face.name })}
                      >
                        Report
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.card} aria-labelledby="people-board">
            <h2 id="people-board" className={styles.title}>
              This week
            </h2>
            <p className={styles.hint}>Chapters read and exercises solved in the last seven days.</p>
            {data.connections.length === 0 ? (
              <p className={styles.empty}>Connect with a friend and your weekly board starts here.</p>
            ) : (
              <ol className={styles.board}>
                {board.map((row, i) => (
                  <li key={row.me ? "me" : row.username} className={styles.boardRow} data-me={row.me || undefined}>
                    <span className={styles.rank}>{i === 0 && row.week > 0 ? "🏆" : i + 1}</span>
                    <span className={styles.boardName}>{row.name}</span>
                    <span className={styles.boardStreak} title="Day streak">
                      🔥 {row.streak}
                    </span>
                    <span className={styles.boardWeek}>
                      <strong>{row.week}</strong> done
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <FeedPanel now={now} reloadKey={searchTick} />

          <section className={styles.card} aria-labelledby="people-list">
            <h2 id="people-list" className={styles.title}>
              Your connections <span className={styles.count}>{data.connections.length}</span>
            </h2>
            {data.connections.length === 0 ? (
              <p className={styles.empty}>No connections yet. Search for a friend&apos;s username below.</p>
            ) : (
              <ul className={styles.list}>
                {data.connections.map((face) => (
                  <li key={face.username} className={styles.person}>
                    <Face face={face} />
                    <Who face={face} today={today} />
                    <div className={styles.actions}>
                      {CHEERS.map((c) => (
                        <button
                          key={c.kind}
                          type="button"
                          className={styles.cheer}
                          disabled={busy !== null}
                          aria-label={`${c.label}: send ${face.name} a cheer`}
                          title={c.label}
                          onClick={() =>
                            void act(
                              `cheer:${face.username}:${c.kind}`,
                              () => cheer(face.username, c.kind),
                              `You ${c.done} ${face.name}.`
                            )
                          }
                        >
                          <span aria-hidden="true">{c.mark}</span>
                        </button>
                      ))}
                      <details className={styles.more}>
                        <summary className={styles.moreBtn} aria-label={`More for ${face.name}`}>
                          ⋯
                        </summary>
                        <div className={styles.menu}>
                          <button
                            type="button"
                            onClick={(e) => {
                              closeMenu(e.currentTarget);
                              setPending({ kind: "remove", username: face.username, name: face.name });
                            }}
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              closeMenu(e.currentTarget);
                              setPending({ kind: "block", username: face.username, name: face.name });
                            }}
                          >
                            Block
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              closeMenu(e.currentTarget);
                              setReporting({ username: face.username, name: face.name });
                            }}
                          >
                            Report
                          </button>
                        </div>
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <MentorsPanel busy={busy !== null} act={act} />

          <section className={styles.card} aria-labelledby="people-find">
            <h2 id="people-find" className={styles.title}>
              Find people
            </h2>
            <label className={styles.searchLabel} htmlFor="people-search">
              Search by username
            </label>
            <div className={styles.search}>
              <span className={styles.at} aria-hidden="true">
                @
              </span>
              <input
                id="people-search"
                className={styles.input}
                type="search"
                value={query}
                maxLength={30}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="username"
                onChange={(e) => {
                  setQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  setResults(null);
                }}
              />
            </div>
            {shown === null ? (
              typed.length >= 2 ? (
                <p className={styles.hint} aria-live="polite">
                  {searching ? "Searching…" : " "}
                </p>
              ) : (
                suggested.length > 0 && (
                  <>
                    <h3 className={styles.sub}>People you may know</h3>
                    <ul className={styles.list}>
                      {suggested.map((face) => (
                        <li key={face.username} className={styles.person}>
                          <Face face={face} />
                          <Who face={face} today={today} />
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.btn}
                              disabled={busy !== null}
                              onClick={() =>
                                void act(
                                  `request:${face.username}`,
                                  () => requestConnection(face.username),
                                  `Request sent to ${face.name}.`
                                )
                              }
                            >
                              Connect
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )
              )
            ) : shown.length === 0 ? (
              <p className={styles.empty} aria-live="polite">
                Nobody found for @{typed}. Usernames are exact from the start, like @{typed.slice(0, 3)}…
              </p>
            ) : (
              <ul className={styles.list} aria-live="polite">
                {shown.map((face) => (
                  <li key={face.username} className={styles.person}>
                    <Face face={face} />
                    <Who face={face} today={today} />
                    <div className={styles.actions}>
                      {face.relation === "connected" ? (
                        <span className={styles.tag}>Connected</span>
                      ) : face.relation === "sent" ? (
                        <span className={styles.tag}>Requested</span>
                      ) : (
                        <button
                          type="button"
                          className={face.relation === "received" ? styles.btnPrimary : styles.btn}
                          disabled={busy !== null}
                          onClick={() =>
                            void act(
                              `request:${face.username}`,
                              () => requestConnection(face.username),
                              face.relation === "received"
                                ? `You and ${face.name} are connected.`
                                : `Request sent to ${face.name}.`
                            )
                          }
                        >
                          {face.relation === "received" ? "Accept" : "Connect"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className={styles.side}>
          {buddy && (
            <BuddyPanel buddy={buddy} connections={data.connections} today={today} busy={busy !== null} act={act} />
          )}
          <ChallengePanel connections={data.connections} />
          <DailyPanel connections={data.connections} />
          <nav className={styles.card} aria-label="More ways to study together">
            <Link href="/groups" className={styles.navRow} prefetch={false}>
              <span aria-hidden="true">👥</span>
              <span>
                <strong>Study groups</strong>
                <span className={styles.hint}>Up to 20 people with their own weekly board</span>
              </span>
            </Link>
            <Link href="/mock/peer" className={styles.navRow} prefetch={false}>
              <span aria-hidden="true">🎙</span>
              <span>
                <strong>Mock interview with a friend</strong>
                <span className={styles.hint}>Book a time, take turns, get a scorecard</span>
              </span>
            </Link>
          </nav>
          {data.cheers.length > 0 && (
            <section className={styles.card} aria-labelledby="people-cheers">
              <h2 id="people-cheers" className={styles.title}>
                Cheers for you
              </h2>
              <ul className={styles.feed}>
                {data.cheers.slice(0, 10).map((c) => {
                  const mark = CHEERS.find((x) => x.kind === c.kind)?.mark ?? "👏";
                  const isNew = fresh.has(`${c.username}:${c.kind}:${c.at}`);
                  return (
                    <li
                      key={`${c.username}:${c.kind}:${c.at}`}
                      className={styles.feedItem}
                      data-new={isNew || undefined}
                    >
                      <span className={styles.feedMark} aria-hidden="true">
                        {mark}
                      </span>
                      <span>
                        <strong>{c.name}</strong> {RECEIVED[c.kind]}
                      </span>
                      <span className={styles.when}>{isNew ? "new" : ago(c.at, now)}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {data.outgoing.length > 0 && (
            <section className={styles.card} aria-labelledby="people-sent">
              <h2 id="people-sent" className={styles.title}>
                Sent requests <span className={styles.count}>{data.outgoing.length}</span>
              </h2>
              <ul className={styles.plain}>
                {data.outgoing.map((o) => (
                  <li key={o.username} className={styles.plainRow}>
                    <span>
                      {o.name} <span className={styles.handle}>@{o.username}</span>
                    </span>
                    <span className={styles.when}>{ago(o.since, now)}</span>
                    <button
                      type="button"
                      className={styles.btnQuiet}
                      disabled={busy !== null}
                      onClick={() => setPending({ kind: "cancel", username: o.username, name: o.name })}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.card} aria-labelledby="people-settings">
            <h2 id="people-settings" className={styles.title}>
              Your settings
            </h2>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={data.me.discoverable}
                disabled={busy !== null}
                onChange={(e) => {
                  const on = e.target.checked;
                  void act(
                    "findable",
                    () => setDiscoverable(on),
                    on ? "People can find you again." : "You are hidden from search and suggestions."
                  );
                }}
              />
              <span>
                Let people find me by searching <span className={styles.mono}>@{data.me.username}</span> and in
                suggestions
              </span>
            </label>
            <p className={styles.hint}>
              Your card updates on its own when you open your progress page.
              {data.me.at ? ` Last updated ${ago(data.me.at, now)}.` : ""}
            </p>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.btn}
                disabled={busy !== null || !mine}
                onClick={() => mine && void act("card", () => publishNetworkCard(mine), "Your card is up to date.")}
              >
                Update my card now
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                disabled={busy !== null}
                onClick={() => setPending({ kind: "leave", username: "", name: "" })}
              >
                Leave connections
              </button>
            </div>
            {data.blocked.length > 0 && (
              <details className={styles.blocked}>
                <summary>Blocked people ({data.blocked.length})</summary>
                <ul className={styles.plain}>
                  {data.blocked.map((b) => (
                    <li key={b.username} className={styles.plainRow}>
                      <span>
                        {b.name} <span className={styles.handle}>@{b.username}</span>
                      </span>
                      <button
                        type="button"
                        className={styles.btnQuiet}
                        disabled={busy !== null}
                        onClick={() =>
                          void act(`unblock:${b.username}`, () => unblockPerson(b.username), `${b.name} is unblocked.`)
                        }
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </section>
          <MoreSettings busy={busy !== null} act={act} />
        </aside>
      </div>

      {pending && (
        <ConfirmDialog
          title={
            pending.kind === "leave"
              ? "Leave connections?"
              : pending.kind === "block"
                ? `Block ${pending.name}?`
                : pending.kind === "cancel"
                  ? `Cancel your request to ${pending.name}?`
                  : `Remove ${pending.name}?`
          }
          body={
            <p>
              {pending.kind === "leave"
                ? "Nobody will see your card or be able to send you requests. Your connections are kept, so they come back if you join again."
                : pending.kind === "block"
                  ? "They are removed from your connections and can't find you, see you or send you requests. They are not told."
                  : pending.kind === "cancel"
                    ? "You can send a new request later."
                    : "You can send them a new request later. They are not told."}
            </p>
          }
          confirmLabel={
            pending.kind === "leave"
              ? "Leave"
              : pending.kind === "block"
                ? "Block"
                : pending.kind === "cancel"
                  ? "Cancel request"
                  : "Remove"
          }
          danger={pending.kind !== "cancel"}
          onConfirm={() => void confirmPending()}
          onClose={() => setPending(null)}
        />
      )}

      {reporting && (
        <ReportDialog
          title={`Report ${reporting.name}`}
          reasons={REASONS}
          onSubmit={(reason, text) =>
            void act(`report:${reporting.username}`, () => reportPerson(reporting.username, reason, text))
          }
          onClose={() => setReporting(null)}
        />
      )}
    </div>
  );
}
