"use client";

import { useEffect, useState } from "react";
import { weekCount, type NetResult } from "@/lib/account/network";
import {
  answerRace,
  GROUP_CODE,
  inviteRace,
  loadRaces,
  setGroupGoal,
  type Race,
  type StudyGroup,
} from "@/lib/account/social";
import { heatOn } from "@/lib/profile/buddy";
import { useChallenge, useDaily } from "@/lib/profile/useStudy";
import { readCardChallenge, weekDays, weekEnds } from "@/lib/profile/weekly";
import people from "@/app/people/people.module.css";
import styles from "./groups.module.css";

type Act = (task: () => Promise<NetResult<string>>, text?: string) => Promise<boolean>;

const RACE_TEXT: Record<string, string> = {
  sent: "Challenge sent. The other group's owner gets a notification.",
  busy: "One of the groups already has a race this week.",
  not_found: "No group has that invite code.",
  accepted: "Race on! It ends on Sunday night.",
  declined: "Race declined.",
  limit: "That is a lot of challenges for one day.",
};

export function weekTotal(member: { heat: number[]; heatEnd: string }, week: string): number {
  return weekDays(week).reduce((sum, day) => sum + heatOn(member, day), 0);
}

export function sideAverage(members: { heat: number[]; heatEnd: string }[], week: string): number {
  if (members.length === 0) return 0;
  const total = members.reduce((sum, m) => sum + weekTotal(m, week), 0);
  return Math.round((total / members.length) * 10) / 10;
}

const SEGMENT_COLORS = ["--c-blue", "--c-green", "--c-orange", "--c-purple", "--c-red", "--c-teal"];

export function GroupGoal({
  group,
  myWeek,
  today,
  busy,
  act,
}: {
  group: StudyGroup;
  myWeek: number;
  today: string;
  busy: boolean;
  act: Act;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(group.goal || 50));
  const parts = [
    { name: "You", n: myWeek },
    ...group.members
      .filter((m) => !m.me)
      .map((m) => ({ name: m.name.split(" ")[0], n: today ? weekCount(m, today) : 0 })),
  ]
    .filter((p) => p.n > 0)
    .sort((a, b) => b.n - a.n);
  const total = parts.reduce((sum, p) => sum + p.n, 0);
  const owner = group.role === "owner";
  if (!group.goal && !owner) return null;

  return (
    <div className={styles.goal}>
      <div className={people.cardHead}>
        <p className={people.sub}>Group goal this week</p>
        {owner && !editing && (
          <button type="button" className={people.btnQuiet} onClick={() => setEditing(true)}>
            {group.goal ? "Change" : "Set a goal"}
          </button>
        )}
      </div>
      {editing ? (
        <form
          className={styles.goalForm}
          onSubmit={(e) => {
            e.preventDefault();
            const n = Math.max(0, Math.min(5000, Math.floor(Number(value) || 0)));
            void act(() => setGroupGoal(group.id, n), n ? `Goal set: ${n} this week.` : "Goal removed.").then(
              (ok) => ok && setEditing(false)
            );
          }}
        >
          <label className={styles.label} htmlFor={`goal-${group.id}`}>
            Chapters and problems together
          </label>
          <input
            id={`goal-${group.id}`}
            className={styles.input}
            type="number"
            min={0}
            max={5000}
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <div className={people.row}>
            <button type="submit" className={people.btnPrimary} disabled={busy}>
              Save
            </button>
            <button type="button" className={people.btnQuiet} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : group.goal ? (
        <>
          <div className={styles.goalBar} role="img" aria-label={`${total} of ${group.goal} done`}>
            {parts.map((p, i) => (
              <span
                key={p.name + i}
                title={`${p.name}: ${p.n}`}
                style={{
                  width: `${Math.min(100, (p.n / group.goal) * 100)}%`,
                  background: `var(${SEGMENT_COLORS[i % SEGMENT_COLORS.length]})`,
                }}
              />
            ))}
          </div>
          <p className={people.hint}>
            <strong>
              {total} of {group.goal}
            </strong>
            {total >= group.goal ? " — done! 🎉" : ""}
            {parts.length > 0 &&
              ` · ${parts
                .slice(0, 4)
                .map((p) => `${p.name} ${p.n}`)
                .join(", ")}`}
          </p>
        </>
      ) : (
        <p className={people.hint}>Set a number the whole group works towards this week.</p>
      )}
    </div>
  );
}

export function GroupToday({ group }: { group: StudyGroup }) {
  const { pick, done, today } = useDaily();
  const challenge = useChallenge();
  const others = group.members.filter((m) => !m.me);
  const dailyDone = others.filter((m) => m.daily?.day === today && m.daily.done).length + (done ? 1 : 0);
  const challengeDone =
    (challenge
      ? others.filter((m) => {
          const c = readCardChallenge(m.challenge, challenge.week);
          return c && c.count >= c.target;
        }).length
      : 0) + (challenge?.done ? 1 : 0);
  const size = others.length + 1;
  if (!pick && !challenge) return null;
  return (
    <div className={styles.today}>
      {pick && (
        <p>
          <span aria-hidden="true">🧩</span> Today&apos;s problem:{" "}
          <strong>
            {dailyDone} of {size}
          </strong>{" "}
          solved
        </p>
      )}
      {challenge && (
        <p>
          <span aria-hidden="true">🏁</span> {challenge.challenge.title}:{" "}
          <strong>
            {challengeDone} of {size}
          </strong>{" "}
          done
        </p>
      )}
    </div>
  );
}

export function GroupRace({ group, busy, act }: { group: StudyGroup; busy: boolean; act: Act }) {
  const [races, setRaces] = useState<Race[] | null>(null);
  const [code, setCode] = useState("");
  const [tick, setTick] = useState(0);
  const owner = group.role === "owner";

  useEffect(() => {
    let live = true;
    void loadRaces(group.id).then((r) => {
      if (live) setRaces(r.ok ? r.value : []);
    });
    return () => {
      live = false;
    };
  }, [group.id, tick]);

  async function run(task: () => Promise<NetResult<string>>) {
    await act(async () => {
      const r = await task();
      if (r.ok && RACE_TEXT[r.value] && !["sent", "accepted", "declined"].includes(r.value)) {
        return { ok: false, error: RACE_TEXT[r.value] };
      }
      return r;
    });
    setTick((t) => t + 1);
  }

  if (races === null) return null;
  const current = races[0];
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (!current && !owner) return null;

  return (
    <div className={styles.race}>
      <p className={people.sub}>Group race</p>
      {current?.status === "accepted" ? (
        (() => {
          const us = sideAverage(current.us.members, current.week);
          const them = sideAverage(current.them.members, current.week);
          const top = Math.max(us, them, 1);
          const left = weekEnds(current.week, todayKey);
          return (
            <>
              <div className={styles.raceRow} data-lead={us >= them || undefined}>
                <span>{group.name}</span>
                <span className={styles.raceBar}>
                  <span style={{ width: `${(us / top) * 100}%` }} />
                </span>
                <strong>{us}</strong>
              </div>
              <div className={styles.raceRow} data-lead={them > us || undefined}>
                <span>{current.them.name}</span>
                <span className={styles.raceBar} data-them>
                  <span style={{ width: `${(them / top) * 100}%` }} />
                </span>
                <strong>{them}</strong>
              </div>
              <p className={people.hint}>
                Average per member this week.{" "}
                {left > 7 || left <= 0
                  ? "Finished."
                  : `${left === 1 ? "Last day" : `${left} days left`} · ${us === them ? "Level." : us > them ? "You lead." : "Catch up!"}`}
              </p>
            </>
          );
        })()
      ) : current?.status === "pending" ? (
        current.incoming ? (
          <div className={styles.waiting}>
            <p>
              <strong>{current.them.name}</strong> challenged your group to a race this week.
            </p>
            {owner && (
              <div className={people.row}>
                <button
                  type="button"
                  className={people.btnPrimary}
                  disabled={busy}
                  onClick={() => void run(() => answerRace(current.id, true))}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className={people.btnQuiet}
                  disabled={busy}
                  onClick={() => void run(() => answerRace(current.id, false))}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className={people.hint}>Waiting for {current.them.name} to accept your challenge.</p>
        )
      ) : (
        <form
          className={styles.raceForm}
          onSubmit={(e) => {
            e.preventDefault();
            const clean = code.trim().toLowerCase().split("/").pop() ?? "";
            if (!GROUP_CODE.test(clean)) return;
            void run(() => inviteRace(group.id, clean)).then(() => setCode(""));
          }}
        >
          <label className={styles.label} htmlFor={`race-${group.id}`}>
            Race another group this week
          </label>
          <div className={styles.raceInput}>
            <input
              id={`race-${group.id}`}
              className={styles.input}
              value={code}
              placeholder="Their invite link or code"
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              className={people.btn}
              disabled={busy || !GROUP_CODE.test(code.trim().toLowerCase().split("/").pop() ?? "")}
            >
              Challenge
            </button>
          </div>
          <p className={people.hint}>The group with the higher average per member by Sunday wins.</p>
        </form>
      )}
    </div>
  );
}
