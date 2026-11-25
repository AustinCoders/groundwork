"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SignInGate } from "@/components/account/SignInGate";
import { ConfirmDialog } from "@/components/Modal";
import { loadOverview, type NetResult, type NetworkFace } from "@/lib/account/network";
import { useAccount } from "@/lib/account/session";
import {
  answerPeer,
  callLinkProblem,
  cancelPeer,
  invitePeer,
  loadPeers,
  PEER_TOPICS,
  type PeerMock,
  type PeerTopic,
} from "@/lib/account/social";
import { useClientValue } from "@/lib/hooks";
import { downloadIcs, nextWeekAt } from "@/lib/peerCalendar";
import { SITE_URL } from "@/lib/site";
import { PeerHistory } from "./PeerHistory";
import people from "@/app/people/people.module.css";
import styles from "./peer.module.css";

type Note = { ok: boolean; text: string } | null;

const STATUS: Record<string, { ok: boolean; text: string }> = {
  sent: { ok: true, text: "Invite sent. They get a notification." },
  accepted: { ok: true, text: "Accepted. It is on your list below." },
  declined: { ok: true, text: "Declined." },
  cancelled: { ok: true, text: "Cancelled. They get a notification." },
  not_connected: { ok: false, text: "You can only invite people you are connected with." },
  bad_time: { ok: false, text: "Pick a time at least 10 minutes from now and within the next 60 days." },
  bad_link: { ok: false, text: "Use a Google Meet, Zoom, Teams, Jitsi, Whereby or Discord link." },
  too_many: { ok: false, text: "You already have 20 mocks booked. Finish or cancel some first." },
  too_late: { ok: false, text: "That time has passed or you are no longer connected." },
  limit: { ok: false, text: "That is a lot of invites for one day. Try tomorrow." },
  not_found: { ok: false, text: "That mock is not there any more." },
};

export function calendarFor(m: PeerMock) {
  return {
    id: m.id,
    at: m.at,
    minutes: m.minutes,
    title: `Mock interview: ${TOPIC_LABEL[m.topic]} with ${m.other?.name ?? "a friend"}`,
    link: m.link,
    note: m.note,
    pageUrl: `${SITE_URL}/mock/peer/${m.id}`,
  };
}

export const TOPIC_LABEL = Object.fromEntries(PEER_TOPICS.map((t) => [t.id, t.label])) as Record<PeerTopic, string>;

export function whenText(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function nowMinute(): number {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function localInput(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PeerView() {
  return (
    <SignInGate feature="people">
      <Peers />
    </SignInGate>
  );
}

function Peers() {
  const account = useAccount();
  const userId = account.user?.id ?? "";
  const now = useClientValue(nowMinute, 0);
  const [mocks, setMocks] = useState<PeerMock[] | null>(null);
  const [connections, setConnections] = useState<NetworkFace[]>([]);
  const [member, setMember] = useState<boolean | null>(null);
  const [problem, setProblem] = useState<{ text: string; code?: string } | null>(null);
  const [note, setNote] = useState<Note>(null);
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState<PeerMock | null>(null);

  const reload = useCallback(async () => {
    const result = await loadPeers();
    if (result.ok) setMocks(result.value);
    else setProblem({ text: result.error, code: result.code });
  }, []);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void Promise.all([loadPeers(), loadOverview()]).then(([p, o]) => {
      if (!live) return;
      if (p.ok) setMocks(p.value);
      else setProblem({ text: p.error, code: p.code });
      if (o.ok) {
        setConnections(o.value.connections);
        setMember(o.value.me.on);
      } else setMember(false);
    });
    return () => {
      live = false;
    };
  }, [userId]);

  async function act(task: () => Promise<NetResult<string>>) {
    setBusy(true);
    setNote(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) {
      setNote({ ok: false, text: result.error });
      return false;
    }
    const known = STATUS[result.value] ?? { ok: true, text: "Done." };
    setNote(known);
    if (known.ok) await reload();
    return known.ok;
  }

  if (problem && !mocks) {
    return (
      <div className={people.page}>
        <section className={people.card}>
          <h1 className={people.title}>Mock interview with a friend</h1>
          <p className={problem.code === "not_ready" ? people.soon : people.error}>{problem.text}</p>
        </section>
      </div>
    );
  }
  if (!mocks || member === null) return <div className={people.wait} aria-busy="true" aria-label="Loading mocks" />;

  const ended = (m: PeerMock) => now > 0 && Date.parse(m.at) + m.minutes * 60_000 < now;
  const invites = mocks.filter((m) => m.status === "invited" && !m.mine && !ended(m));
  const upcoming = mocks
    .filter((m) => (m.status === "accepted" || (m.status === "invited" && m.mine)) && !ended(m))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const past = mocks.filter((m) => m.status === "accepted" && ended(m));

  return (
    <div className={people.page}>
      <header className={people.head}>
        <h1 className={people.h1}>Mock with a friend</h1>
        <p className={people.headMeta}>
          Book a time with a connection, meet on your own call link, and the interviewer fills in a scorecard. Then
          swap.
        </p>
      </header>
      {note && (
        <div className={people.toast}>
          <p className={note.ok ? people.ok : people.error} role={note.ok ? "status" : "alert"}>
            {note.text}
          </p>
        </div>
      )}
      <div className={people.columns}>
        <div className={people.main}>
          {invites.length > 0 && (
            <section className={`${people.card} ${people.attention}`} aria-labelledby="peer-invites">
              <h2 id="peer-invites" className={people.title}>
                Invites for you <span className={people.count}>{invites.length}</span>
              </h2>
              <ul className={styles.list}>
                {invites.map((m) => (
                  <li key={m.id} className={styles.mock}>
                    <MockLine mock={m} />
                    <div className={people.row}>
                      <button
                        type="button"
                        className={people.btnPrimary}
                        disabled={busy}
                        onClick={() => void act(() => answerPeer(m.id, true))}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className={people.btnQuiet}
                        disabled={busy}
                        onClick={() => void act(() => answerPeer(m.id, false))}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={people.card} aria-labelledby="peer-upcoming">
            <h2 id="peer-upcoming" className={people.title}>
              Coming up
            </h2>
            {upcoming.length === 0 ? (
              <p className={people.empty}>Nothing booked. Invite a friend on the right.</p>
            ) : (
              <ul className={styles.list}>
                {upcoming.map((m) => (
                  <li key={m.id} className={styles.mock}>
                    <MockLine mock={m} />
                    <div className={people.row}>
                      {m.status === "invited" ? (
                        <span className={people.tag}>Waiting for them</span>
                      ) : (
                        <>
                          <Link href={`/mock/peer/${m.id}`} className={people.btnPrimary}>
                            Open
                          </Link>
                          <button type="button" className={people.btn} onClick={() => downloadIcs(calendarFor(m))}>
                            Add to calendar
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className={people.btnQuiet}
                        disabled={busy}
                        onClick={() => setCancelling(m)}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className={people.card} aria-labelledby="peer-past">
              <h2 id="peer-past" className={people.title}>
                Done
              </h2>
              <ul className={styles.list}>
                {past.map((m) => (
                  <li key={m.id} className={styles.mock}>
                    <MockLine mock={m} />
                    <div className={people.row}>
                      <Link href={`/mock/peer/${m.id}`} className={people.btn}>
                        {m.interviewer
                          ? m.scored
                            ? "See your scorecard"
                            : "Fill in the scorecard"
                          : m.scored
                            ? "Read your feedback"
                            : "Waiting for feedback"}
                      </Link>
                      {m.other && (
                        <Link
                          className={people.btnQuiet}
                          href={`/mock/peer?with=${m.other.username}&topic=${m.topic}&role=${m.interviewer ? "ask" : "answer"}&at=${encodeURIComponent(nextWeekAt(m.at, now))}&minutes=${m.minutes}`}
                        >
                          Same time next week
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className={people.side}>
          <PeerHistory mocks={mocks} />
          {member ? (
            <InviteForm
              connections={connections}
              busy={busy}
              now={now}
              onSend={(input) =>
                act(() => invitePeer(input).then((r) => (r.ok ? { ok: true as const, value: r.value.status } : r)))
              }
            />
          ) : (
            <section className={people.card}>
              <div className={people.callout}>
                <p>Join connections first. You can only invite people you are connected with.</p>
                <Link href="/people" className={people.btnPrimary}>
                  Go to People
                </Link>
              </div>
            </section>
          )}
        </aside>
      </div>
      {cancelling && (
        <ConfirmDialog
          title="Cancel this mock interview?"
          body={<p>{cancelling.other?.name ?? "They"} will get a notification.</p>}
          confirmLabel="Cancel it"
          danger
          onConfirm={() => void act(() => cancelPeer(cancelling.id))}
          onClose={() => setCancelling(null)}
        />
      )}
    </div>
  );
}

function MockLine({ mock }: { mock: PeerMock }) {
  return (
    <div className={styles.line}>
      <p className={styles.lineTitle}>
        {TOPIC_LABEL[mock.topic]} with {mock.other?.name ?? "a friend"}
      </p>
      <p className={people.hint}>
        {whenText(mock.at)} · {mock.minutes} min ·{" "}
        {mock.interviewer ? "you ask the questions" : "you answer the questions"}
      </p>
      {mock.note && <p className={styles.noteText}>“{mock.note}”</p>}
    </div>
  );
}

function startFromUrl(): { name: string; topic: PeerTopic; ask: boolean; at: string; minutes: number } {
  if (typeof window === "undefined") return { name: "", topic: "javascript", ask: false, at: "", minutes: 45 };
  const params = new URLSearchParams(window.location.search);
  const withName = params.get("with") ?? "";
  const withTopic = PEER_TOPICS.find((t) => t.id === params.get("topic"))?.id ?? "javascript";
  const at = Date.parse(params.get("at") ?? "");
  const minutes = Number(params.get("minutes"));
  return {
    name: /^[a-z0-9-]{3,30}$/.test(withName) ? withName : "",
    topic: withTopic,
    ask: params.get("role") === "ask",
    at: Number.isFinite(at) && at > Date.now() ? localInput(at) : "",
    minutes: minutes === 30 || minutes === 60 ? minutes : 45,
  };
}

interface InviteInput {
  name: string;
  at: string;
  minutes: number;
  topic: PeerTopic;
  link: string;
  interviewThem: boolean;
  note: string;
}

function InviteForm({
  connections,
  busy,
  now,
  onSend,
}: {
  connections: NetworkFace[];
  busy: boolean;
  now: number;
  onSend: (input: InviteInput) => Promise<boolean>;
}) {
  const [start] = useState(startFromUrl);
  const [name, setName] = useState(start.name);
  const [at, setAt] = useState(start.at);
  const [minutes, setMinutes] = useState(start.minutes);
  const [topic, setTopic] = useState<PeerTopic>(start.topic);
  const [interviewThem, setInterviewThem] = useState(start.ask);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);

  const linkError = tried || link ? callLinkProblem(link) : null;
  const atMs = at ? new Date(at).getTime() : NaN;
  const timeError =
    tried && (!at || Number.isNaN(atMs))
      ? "Pick a day and time."
      : at && now && (atMs < now + 10 * 60_000 || atMs > now + 60 * 86_400_000)
        ? "Pick a time at least 10 minutes from now and within 60 days."
        : null;
  const nameError = tried && !name ? "Choose who to invite." : null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    if (!name || !at || Number.isNaN(atMs) || callLinkProblem(link) || timeError) return;
    const ok = await onSend({ name, at: new Date(atMs).toISOString(), minutes, topic, link, interviewThem, note });
    if (ok) {
      setAt("");
      setNote("");
      setTried(false);
    }
  }

  if (connections.length === 0) {
    return (
      <section className={people.card}>
        <h2 className={people.title}>Invite a friend</h2>
        <p className={people.hint}>Connect with someone on the People page first, then book a mock with them here.</p>
        <Link href="/people" className={people.btn}>
          Find people
        </Link>
      </section>
    );
  }

  return (
    <section className={people.card} aria-labelledby="peer-new">
      <h2 id="peer-new" className={people.title}>
        Invite a friend
      </h2>
      <form className={styles.form} noValidate onSubmit={(e) => void submit(e)}>
        <label className={styles.label} htmlFor="peer-who">
          Who
        </label>
        <select
          id="peer-who"
          className={styles.input}
          value={name}
          aria-invalid={nameError ? true : undefined}
          onChange={(e) => setName(e.target.value)}
        >
          <option value="">Choose a connection</option>
          {connections.map((c) => (
            <option key={c.username} value={c.username}>
              {c.name} (@{c.username})
            </option>
          ))}
        </select>
        {nameError && <p className={people.error}>{nameError}</p>}

        <label className={styles.label} htmlFor="peer-when">
          When
        </label>
        <input
          id="peer-when"
          type="datetime-local"
          className={styles.input}
          value={at}
          min={now ? localInput(now + 15 * 60_000) : undefined}
          aria-invalid={timeError ? true : undefined}
          onChange={(e) => setAt(e.target.value)}
        />
        {timeError && <p className={people.error}>{timeError}</p>}

        <fieldset className={styles.choices}>
          <legend className={styles.label}>How long</legend>
          {[30, 45, 60].map((m) => (
            <label key={m} className={styles.pill} data-on={minutes === m || undefined}>
              <input type="radio" name="peer-length" checked={minutes === m} onChange={() => setMinutes(m)} />
              {m} min
            </label>
          ))}
        </fieldset>

        <label className={styles.label} htmlFor="peer-topic">
          Topic
        </label>
        <select
          id="peer-topic"
          className={styles.input}
          value={topic}
          onChange={(e) => setTopic(e.target.value as PeerTopic)}
        >
          {PEER_TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <fieldset className={styles.choices}>
          <legend className={styles.label}>Who asks the questions</legend>
          <label className={styles.pill} data-on={!interviewThem || undefined}>
            <input type="radio" name="peer-role" checked={!interviewThem} onChange={() => setInterviewThem(false)} />
            They interview me
          </label>
          <label className={styles.pill} data-on={interviewThem || undefined}>
            <input type="radio" name="peer-role" checked={interviewThem} onChange={() => setInterviewThem(true)} />I
            interview them
          </label>
        </fieldset>

        <label className={styles.label} htmlFor="peer-link">
          Call link
        </label>
        <input
          id="peer-link"
          type="url"
          className={styles.input}
          value={link}
          placeholder="https://meet.google.com/abc-defg-hij"
          aria-invalid={linkError ? true : undefined}
          aria-describedby="peer-link-hint"
          onChange={(e) => setLink(e.target.value)}
        />
        <p id="peer-link-hint" className={linkError ? people.error : people.hint}>
          {linkError ?? "Make a Google Meet, Zoom, Teams, Jitsi, Whereby or Discord link and paste it here."}
        </p>

        <label className={styles.label} htmlFor="peer-note">
          Note <span className={people.hint}>(optional)</span>
        </label>
        <textarea
          id="peer-note"
          className={`${styles.input} ${styles.area}`}
          value={note}
          maxLength={300}
          rows={2}
          placeholder="Focus on async and the event loop, please"
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className={people.btnPrimary} disabled={busy}>
          {busy ? "Sending…" : "Send invite"}
        </button>
      </form>
    </section>
  );
}
