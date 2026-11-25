"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { AvatarArt } from "@/components/account/AvatarArt";
import { avatarStyle } from "@/lib/account/avatar";
import { cheer, type NetResult, type NetworkFace } from "@/lib/account/network";
import { isAvatarArt } from "@/lib/account/profileExtras";
import { answerBuddy, askBuddy, endBuddy, type BuddyView } from "@/lib/account/social";
import { useProgressValue } from "@/lib/hooks";
import { heatOn, pairStreak } from "@/lib/profile/buddy";
import { usePlan } from "@/lib/profile/plan";
import { useChallenge, useDaily } from "@/lib/profile/useStudy";
import { readCardChallenge } from "@/lib/profile/weekly";
import { activity } from "@/lib/storage";
import styles from "./people.module.css";

type Act = (key: string, task: () => Promise<NetResult<string | null>>, text?: string) => Promise<void>;

const BUDDY_STATUS: Record<string, string> = {
  busy: "They already have a study buddy.",
  you_busy: "You already have a study buddy. End it first.",
  not_connected: "You can only ask people you are connected with.",
  limit: "That is a lot of asks for one day. Try tomorrow.",
};

function Mini({ face }: { face: Pick<NetworkFace, "name" | "color" | "art"> }) {
  return (
    <span className={styles.mini} style={avatarStyle(face.color) as CSSProperties | undefined} aria-hidden="true">
      {isAvatarArt(face.art) ? <AvatarArt art={face.art} /> : (face.name[0] ?? "?").toUpperCase()}
    </span>
  );
}

export function BuddyPanel({
  buddy,
  connections,
  today,
  busy,
  act,
}: {
  buddy: BuddyView;
  connections: NetworkFace[];
  today: string;
  busy: boolean;
  act: Act;
}) {
  const [choice, setChoice] = useState("");
  const [ending, setEnding] = useState(false);
  const plan = usePlan();
  const mineKey = useProgressValue(() => JSON.stringify(activity.all()), "");
  const mine = mineKey ? (JSON.parse(mineKey) as Record<string, number>) : {};
  const active = buddy.active;

  async function ask(name: string) {
    await act(`buddy:${name}`, async () => {
      const result = await askBuddy(name);
      if (!result.ok) return result;
      if (BUDDY_STATUS[result.value]) return { ok: false, error: BUDDY_STATUS[result.value] };
      return { ok: true, value: result.value === "active" ? "buddy_active" : "buddy_sent" };
    });
  }

  return (
    <section id="people-buddy" className={styles.card} aria-labelledby="people-buddy-title">
      <h2 id="people-buddy-title" className={styles.title}>
        Study buddy
      </h2>
      {active ? (
        <>
          <div className={styles.buddyPair}>
            <Mini face={active} />
            <div className={styles.buddyWho}>
              <p className={styles.name}>{active.name}</p>
              <p className={styles.hint}>@{active.username}</p>
            </div>
            <div className={styles.pairStreak} title="Days in a row you both studied">
              <strong>{today ? pairStreak(mine, active, today) : 0}</strong>
              <span>day pair streak</span>
            </div>
          </div>
          <div className={styles.todayRow}>
            <div>
              <span className={styles.todayLabel}>You today</span>
              <strong>
                {mine[today] ?? 0} / {plan.goal}
              </strong>
            </div>
            <div>
              <span className={styles.todayLabel}>{active.name.split(" ")[0]} today</span>
              <strong>
                {today ? heatOn(active, today) : 0} / {active.goal ?? "?"}
              </strong>
            </div>
          </div>
          <div className={styles.row}>
            <button
              type="button"
              className={styles.btn}
              disabled={busy}
              onClick={() =>
                void act(
                  `nudge:${active.username}`,
                  () => cheer(active.username, "nudge"),
                  `You nudged ${active.name}.`
                )
              }
            >
              ⏰ Nudge
            </button>
            {ending ? (
              <>
                <button
                  type="button"
                  className={styles.btnDanger}
                  disabled={busy}
                  onClick={() => {
                    setEnding(false);
                    void act("buddy-end", () => endBuddy(), "You are no longer study buddies.");
                  }}
                >
                  Yes, end it
                </button>
                <button type="button" className={styles.btnQuiet} onClick={() => setEnding(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button type="button" className={styles.btnQuiet} disabled={busy} onClick={() => setEnding(true)}>
                End
              </button>
            )}
          </div>
          <p className={styles.hint}>Their numbers update when they open their progress page.</p>
        </>
      ) : (
        <>
          {buddy.incoming.map((face) => (
            <div key={face.username} className={styles.buddyAsk}>
              <Mini face={face} />
              <p>
                <strong>{face.name}</strong> asked you to be study buddies.
              </p>
              <div className={styles.row}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={busy}
                  onClick={() =>
                    void act(
                      `buddy-yes:${face.username}`,
                      async () => {
                        const result = await answerBuddy(face.username, true);
                        if (result.ok && BUDDY_STATUS[result.value])
                          return { ok: false, error: BUDDY_STATUS[result.value] };
                        return result;
                      },
                      `You and ${face.name} are study buddies now.`
                    )
                  }
                >
                  Accept
                </button>
                <button
                  type="button"
                  className={styles.btnQuiet}
                  disabled={busy}
                  onClick={() =>
                    void act(`buddy-no:${face.username}`, () => answerBuddy(face.username, false), "Declined.")
                  }
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
          {buddy.outgoing ? (
            <div className={styles.buddyAsk}>
              <p>
                Waiting for <strong>{buddy.outgoing.name}</strong> to say yes.
              </p>
              <button
                type="button"
                className={styles.btnQuiet}
                disabled={busy}
                onClick={() => void act("buddy-cancel", () => endBuddy(), "Ask cancelled.")}
              >
                Cancel
              </button>
            </div>
          ) : connections.length === 0 ? (
            <p className={styles.hint}>Connect with a friend first, then pick one of them as your study buddy.</p>
          ) : (
            <>
              <p className={styles.hint}>
                One friend, one daily goal each. You see each other&apos;s day and build a streak together.
              </p>
              <div className={styles.buddyPick}>
                <label className={styles.srOnly} htmlFor="buddy-choice">
                  Choose a connection
                </label>
                <select
                  id="buddy-choice"
                  className={styles.select}
                  value={choice}
                  onChange={(e) => setChoice(e.target.value)}
                >
                  <option value="">Choose a connection</option>
                  {connections.map((c) => (
                    <option key={c.username} value={c.username}>
                      {c.name} (@{c.username})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={busy || !choice}
                  onClick={() => {
                    const face = connections.find((c) => c.username === choice);
                    if (face) void ask(face.username);
                  }}
                >
                  Ask
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

export function ChallengePanel({ connections }: { connections: NetworkFace[] }) {
  const state = useChallenge();
  if (!state) return null;
  const pct = Math.min(100, Math.round((state.count / state.challenge.target) * 100));
  const friends = connections
    .map((f) => ({ face: f, c: readCardChallenge(f.challenge, state.week) }))
    .filter((x) => x.c !== null);
  const finished = friends.filter((x) => x.c && x.c.count >= x.c.target);
  return (
    <section className={styles.card} aria-labelledby="people-challenge">
      <div className={styles.cardHead}>
        <h2 id="people-challenge" className={styles.title}>
          This week&apos;s challenge
        </h2>
        <span className={styles.tag}>{state.daysLeft === 1 ? "Last day" : `${state.daysLeft} days left`}</span>
      </div>
      <p className={styles.challengeName}>{state.challenge.title}</p>
      <p className={styles.hint}>{state.challenge.blurb}</p>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Challenge progress"
        aria-valuemin={0}
        aria-valuemax={state.challenge.target}
        aria-valuenow={Math.min(state.count, state.challenge.target)}
      >
        <span style={{ width: `${pct}%` }} data-done={state.done || undefined} />
      </div>
      <p className={styles.challengeCount}>
        {state.done ? "Done! 🎉" : `${Math.min(state.count, state.challenge.target)} of ${state.challenge.target}`}
        {state.wins ? <span className={styles.hint}> · {state.wins} won so far</span> : null}
      </p>
      {friends.length > 0 && (
        <p className={styles.hint}>
          {finished.length} of {friends.length} {friends.length === 1 ? "friend has" : "friends have"} finished it
          {finished.length > 0 &&
            `: ${finished
              .map((x) => x.face.name.split(" ")[0])
              .slice(0, 4)
              .join(", ")}`}
          .
        </p>
      )}
    </section>
  );
}

export function DailyPanel({ connections }: { connections: NetworkFace[] }) {
  const { pick, done, today } = useDaily();
  if (!pick) return null;
  const friendsDone = connections.filter((f) => f.daily?.day === today && f.daily.done);
  return (
    <section className={styles.card} aria-labelledby="people-daily">
      <div className={styles.cardHead}>
        <h2 id="people-daily" className={styles.title}>
          Today&apos;s problem
        </h2>
        <span className={styles.tag} data-level={pick.level}>
          {pick.level}
        </span>
      </div>
      <p className={styles.challengeName}>{pick.title}</p>
      <p className={styles.hint}>Same problem for everyone today.</p>
      {done ? (
        <p className={styles.ok}>Solved today ✓</p>
      ) : (
        <div className={styles.row}>
          <Link href={pick.href} className={styles.btnPrimary} prefetch={false}>
            Solve it
          </Link>
        </div>
      )}
      {connections.length > 0 && (
        <p className={styles.hint}>
          {friendsDone.length === 0
            ? "None of your friends has solved it yet."
            : `Solved by ${friendsDone
                .map((f) => f.name.split(" ")[0])
                .slice(0, 4)
                .join(", ")}${friendsDone.length > 4 ? ` and ${friendsDone.length - 4} more` : ""}.`}
        </p>
      )}
    </section>
  );
}
