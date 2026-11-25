"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SignInGate } from "@/components/account/SignInGate";
import { useAccount } from "@/lib/account/session";
import {
  answerPeer,
  loadPeer,
  readScore,
  SCORE_AREAS,
  scorePeer,
  VERDICTS,
  type PeerMock,
  type PeerScore,
  type ScoreArea,
  type Verdict,
} from "@/lib/account/social";
import { useClientValue } from "@/lib/hooks";
import { isPlainObject } from "@/lib/storage";
import people from "@/app/people/people.module.css";
import { TOPIC_LABEL, whenText } from "./PeerView";
import styles from "./peer.module.css";

interface Question {
  id: string;
  round: string;
  q: string;
  a: string | null;
  say: string | null;
  trap: string | null;
  fu: string[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function nowMinute(): number {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function until(at: string, minutes: number, now: number): { text: string; live: boolean; over: boolean } {
  const start = Date.parse(at);
  const end = start + minutes * 60_000;
  if (!now) return { text: "", live: false, over: false };
  if (now >= end) return { text: "Finished", live: false, over: true };
  if (now >= start) return { text: `Live now · ${Math.ceil((end - now) / 60_000)} min left`, live: true, over: false };
  const mins = Math.round((start - now) / 60_000);
  if (mins < 60) return { text: `Starts in ${mins} min`, live: false, over: false };
  const hours = Math.round(mins / 60);
  if (hours < 36) return { text: `Starts in ${hours} h`, live: false, over: false };
  return { text: `Starts in ${Math.round(hours / 24)} days`, live: false, over: false };
}

function readQuestions(value: unknown): Question[] {
  if (!isPlainObject(value) || !Array.isArray(value.questions)) return [];
  return value.questions
    .filter(isPlainObject)
    .map((q) => ({
      id: String(q.id ?? ""),
      round: String(q.round ?? ""),
      q: typeof q.q === "string" ? q.q : "",
      a: typeof q.a === "string" ? q.a : null,
      say: typeof q.say === "string" ? q.say : null,
      trap: typeof q.trap === "string" ? q.trap : null,
      fu: Array.isArray(q.fu) ? q.fu.filter((f): f is string => typeof f === "string").slice(0, 4) : [],
    }))
    .filter((q) => q.id && q.q)
    .slice(0, 60);
}

export function PeerRoom({ id }: { id: string }) {
  return (
    <SignInGate feature="people">
      <Room id={id} />
    </SignInGate>
  );
}

function Room({ id }: { id: string }) {
  const account = useAccount();
  const userId = account.user?.id ?? "";
  const now = useClientValue(nowMinute, 0);
  const [mock, setMock] = useState<PeerMock | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const valid = UUID.test(id);

  useEffect(() => {
    if (!userId || !valid) return;
    let live = true;
    void loadPeer(id).then((result) => {
      if (!live) return;
      if (result.ok) setMock(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [userId, id, valid, reload]);

  if (!valid || mock === null) {
    return (
      <div className={people.page}>
        <section className={people.card}>
          <h1 className={people.title}>This mock interview is not here</h1>
          <p className={people.hint}>It may have been cancelled, or the link is for someone else&apos;s mock.</p>
          <Link href="/mock/peer" className={people.btn}>
            All your mocks
          </Link>
        </section>
      </div>
    );
  }
  if (mock === undefined) {
    return error ? (
      <div className={people.page}>
        <p className={people.error} role="alert">
          {error}
        </p>
      </div>
    ) : (
      <div className={people.wait} aria-busy="true" aria-label="Loading the mock interview" />
    );
  }

  const time = until(mock.at, mock.minutes, now);
  const other = mock.other?.name ?? "your friend";
  const first = other.split(" ")[0];

  async function answer(accept: boolean) {
    setBusy(true);
    const result = await answerPeer(mock!.id, accept);
    setBusy(false);
    if (!result.ok) setError(result.error);
    else setReload((n) => n + 1);
  }

  return (
    <div className={people.page}>
      <section className={styles.hero} aria-labelledby="room-title">
        <p className={people.kicker}>{TOPIC_LABEL[mock.topic]}</p>
        <h1 id="room-title" className={styles.heroTitle}>
          {mock.interviewer ? `You interview ${first}` : `${first} interviews you`}
        </h1>
        <p className={styles.heroMeta}>
          {whenText(mock.at)} · {mock.minutes} min
          {time.text && (
            <span className={styles.clock} data-live={time.live || undefined}>
              {time.text}
            </span>
          )}
        </p>
        {mock.note && <p className={styles.noteText}>“{mock.note}”</p>}
        {mock.status === "cancelled" || mock.status === "declined" ? (
          <p className={people.soon}>This mock was {mock.status}.</p>
        ) : mock.status === "invited" ? (
          mock.mine ? (
            <p className={people.hint}>Waiting for {first} to accept.</p>
          ) : (
            <div className={people.row}>
              <button type="button" className={people.btnPrimary} disabled={busy} onClick={() => void answer(true)}>
                Accept
              </button>
              <button type="button" className={people.btnQuiet} disabled={busy} onClick={() => void answer(false)}>
                Decline
              </button>
            </div>
          )
        ) : (
          mock.link &&
          !time.over && (
            <a
              className={`${people.btnPrimary} ${people.btnLarge}`}
              href={mock.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the call ↗
            </a>
          )
        )}
        {error && (
          <p className={people.error} role="alert">
            {error}
          </p>
        )}
      </section>

      {mock.status === "accepted" &&
        (mock.interviewer ? (
          <InterviewerView mock={mock} first={first} now={now} onSaved={() => setReload((n) => n + 1)} />
        ) : (
          <CandidateView mock={mock} first={first} />
        ))}
    </div>
  );
}

function CandidateView({ mock, first }: { mock: PeerMock; first: string }) {
  if (mock.score) {
    return (
      <>
        <ScoreSummary score={mock.score} title={`${first}'s feedback for you`} />
        <section className={people.card}>
          <p className={people.hint}>Now swap: you ask the questions next time.</p>
          <Link
            className={people.btn}
            href={`/mock/peer?with=${mock.other?.username ?? ""}&topic=${mock.topic}&role=ask`}
          >
            Book the return match
          </Link>
        </section>
      </>
    );
  }
  return (
    <section className={people.card} aria-labelledby="candidate-tips">
      <h2 id="candidate-tips" className={people.title}>
        You answer the questions
      </h2>
      <ul className={styles.tips}>
        <li>Think out loud. The scorecard rates how you reason, not only the final answer.</li>
        <li>Ask one clarifying question before you start on anything open-ended.</li>
        <li>If you get stuck, say what you would try next and why.</li>
        <li>{first} sees model answers you do not. Feedback shows up here when they send it.</li>
      </ul>
    </section>
  );
}

function InterviewerView({
  mock,
  first,
  now,
  onSaved,
}: {
  mock: PeerMock;
  first: string;
  now: number;
  onSaved: () => void;
}) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [asked, setAsked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fetch(`/api/peer-questions?topic=${mock.topic}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        if (live) setQuestions(readQuestions(data));
      })
      .catch(() => {
        if (live) setQuestions([]);
      });
    return () => {
      live = false;
    };
  }, [mock.topic]);

  const canScore = now > 0 && Date.parse(mock.at) - 5 * 60_000 <= now;

  return (
    <div className={people.columns}>
      <div className={people.main}>
        <section className={people.card} aria-labelledby="room-questions">
          <div className={people.cardHead}>
            <h2 id="room-questions" className={people.title}>
              Questions to ask
            </h2>
            <span className={people.tag}>{asked.size} asked</span>
          </div>
          <p className={people.hint}>
            Pick 4 to 6. Open one to see what a good answer covers. {first} cannot see this list.
          </p>
          {questions === null ? (
            <p className={people.hint}>Loading questions…</p>
          ) : (
            <ol className={styles.questions}>
              {questions.map((q) => (
                <li key={q.id} className={styles.question} data-asked={asked.has(q.id) || undefined}>
                  <div className={styles.qHead}>
                    <input
                      type="checkbox"
                      aria-label="Asked"
                      checked={asked.has(q.id)}
                      onChange={() =>
                        setAsked((prev) => {
                          const next = new Set(prev);
                          if (next.has(q.id)) next.delete(q.id);
                          else next.add(q.id);
                          return next;
                        })
                      }
                    />
                    <button
                      type="button"
                      className={styles.qText}
                      aria-expanded={open === q.id}
                      onClick={() => setOpen(open === q.id ? null : q.id)}
                    >
                      <span dangerouslySetInnerHTML={{ __html: q.q }} />
                      <span className={styles.qRound}>{q.round}</span>
                    </button>
                  </div>
                  {open === q.id && (
                    <div className={styles.answer}>
                      {q.say && (
                        <>
                          <p className={people.sub}>Listen for</p>
                          <div dangerouslySetInnerHTML={{ __html: q.say }} />
                        </>
                      )}
                      {q.a && (
                        <>
                          <p className={people.sub}>A good answer</p>
                          <div dangerouslySetInnerHTML={{ __html: q.a }} />
                        </>
                      )}
                      {q.trap && (
                        <>
                          <p className={people.sub}>Common trap</p>
                          <div dangerouslySetInnerHTML={{ __html: q.trap }} />
                        </>
                      )}
                      {q.fu.length > 0 && (
                        <>
                          <p className={people.sub}>Follow-ups</p>
                          <ul>
                            {q.fu.map((f) => (
                              <li key={f} dangerouslySetInnerHTML={{ __html: f }} />
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
      <aside className={people.side}>
        {canScore ? (
          <ScoreForm mock={mock} first={first} onSaved={onSaved} />
        ) : (
          <section className={people.card}>
            <h2 className={people.title}>Scorecard</h2>
            <p className={people.hint}>It opens five minutes before the start time.</p>
          </section>
        )}
      </aside>
    </div>
  );
}

function ScoreForm({ mock, first, onSaved }: { mock: PeerMock; first: string; onSaved: () => void }) {
  const start = mock.score;
  const [ratings, setRatings] = useState<Partial<Record<ScoreArea, number>>>(start?.ratings ?? {});
  const [verdict, setVerdict] = useState<Verdict | "">(start?.verdict ?? "");
  const [strengths, setStrengths] = useState(start?.strengths ?? "");
  const [improve, setImprove] = useState(start?.improve ?? "");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const complete = SCORE_AREAS.every((a) => ratings[a.id]) && verdict;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!complete) {
      setNote({ ok: false, text: "Rate all four areas and pick an overall call." });
      return;
    }
    const score = readScore({ ratings, verdict, strengths, improve }) as PeerScore;
    setBusy(true);
    const result = await scorePeer(mock.id, score);
    setBusy(false);
    if (!result.ok) setNote({ ok: false, text: result.error });
    else if (result.value !== "saved") setNote({ ok: false, text: "The scorecard could not be saved yet." });
    else {
      setNote({ ok: true, text: `Sent. ${first} gets a notification.` });
      onSaved();
    }
  }

  return (
    <section className={people.card} aria-labelledby="room-score">
      <h2 id="room-score" className={people.title}>
        Scorecard for {first}
      </h2>
      <form className={styles.form} noValidate onSubmit={(e) => void save(e)}>
        {SCORE_AREAS.map((area) => (
          <fieldset key={area.id} className={styles.rating}>
            <legend className={styles.label}>{area.label}</legend>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className={styles.star} data-on={(ratings[area.id] ?? 0) >= n || undefined}>
                  <input
                    type="radio"
                    name={`rate-${area.id}`}
                    value={n}
                    checked={ratings[area.id] === n}
                    onChange={() => setRatings((r) => ({ ...r, [area.id]: n }))}
                    aria-label={`${n} of 5`}
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <fieldset className={styles.choices}>
          <legend className={styles.label}>Would you hire on this?</legend>
          {VERDICTS.map((v) => (
            <label key={v.id} className={styles.pill} data-on={verdict === v.id || undefined}>
              <input type="radio" name="verdict" checked={verdict === v.id} onChange={() => setVerdict(v.id)} />
              {v.label}
            </label>
          ))}
        </fieldset>
        <label className={styles.label} htmlFor="score-good">
          What went well
        </label>
        <textarea
          id="score-good"
          className={`${styles.input} ${styles.area}`}
          rows={3}
          maxLength={600}
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
        />
        <label className={styles.label} htmlFor="score-next">
          What to work on
        </label>
        <textarea
          id="score-next"
          className={`${styles.input} ${styles.area}`}
          rows={3}
          maxLength={600}
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
        />
        <button type="submit" className={people.btnPrimary} disabled={busy}>
          {busy ? "Sending…" : mock.scored ? "Update scorecard" : "Send scorecard"}
        </button>
        {note && (
          <p className={note.ok ? people.ok : people.error} role={note.ok ? "status" : "alert"}>
            {note.text}
          </p>
        )}
      </form>
    </section>
  );
}

function ScoreSummary({ score, title }: { score: PeerScore; title: string }) {
  const verdict = VERDICTS.find((v) => v.id === score.verdict)?.label ?? "";
  return (
    <section className={people.card} aria-labelledby="room-feedback">
      <div className={people.cardHead}>
        <h2 id="room-feedback" className={people.title}>
          {title}
        </h2>
        <span className={people.tag}>{verdict}</span>
      </div>
      <dl className={styles.summary}>
        {SCORE_AREAS.map((area) => (
          <div key={area.id}>
            <dt>{area.label}</dt>
            <dd>
              <span className={styles.meter} aria-hidden="true">
                <span style={{ width: `${score.ratings[area.id] * 20}%` }} />
              </span>
              {score.ratings[area.id]} / 5
            </dd>
          </div>
        ))}
      </dl>
      {score.strengths && (
        <>
          <p className={people.sub}>What went well</p>
          <p className={styles.feedback}>{score.strengths}</p>
        </>
      )}
      {score.improve && (
        <>
          <p className={people.sub}>What to work on</p>
          <p className={styles.feedback}>{score.improve}</p>
        </>
      )}
    </section>
  );
}
