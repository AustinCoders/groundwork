"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { TopicTrack } from "@/app/progress/progressModel";
import { SignInGate } from "@/components/account/SignInGate";
import { ConfirmDialog } from "@/components/Modal";
import { leaderboard, loadOverview, weekCount, type NetResult } from "@/lib/account/network";
import { useAccount } from "@/lib/account/session";
import {
  answerGroup,
  createGroup,
  deleteGroup,
  editGroup,
  leaveGroup,
  loadGroups,
  newGroupCode,
  removeFromGroup,
  type StudyGroup,
} from "@/lib/account/social";
import { currentCard } from "@/lib/profile/cardNow";
import { useToday } from "@/lib/profile/useStudy";
import { SITE_URL } from "@/lib/site";
import people from "@/app/people/people.module.css";
import styles from "./groups.module.css";

type Note = { ok: boolean; text: string } | null;
type Pending = {
  kind: "leave" | "delete" | "remove" | "code";
  group: StudyGroup;
  name?: string;
  label?: string;
} | null;

const STATUS: Record<string, { ok: boolean; text: string }> = {
  created: { ok: true, text: "Group made. Share the invite link with your friends." },
  added: { ok: true, text: "Added to the group." },
  declined: { ok: true, text: "Request declined." },
  left: { ok: true, text: "You left the group." },
  deleted: { ok: true, text: "Group deleted." },
  removed: { ok: true, text: "Removed from the group." },
  saved: { ok: true, text: "Saved." },
  full: { ok: false, text: "The group already has 20 people." },
  too_many: { ok: false, text: "You can run 3 groups and be in 10 at most." },
  bad_name: { ok: false, text: "Give the group a name of 3 to 60 characters." },
  not_owner: { ok: false, text: "Only the person who runs the group can do that." },
  not_found: { ok: false, text: "That is not there any more." },
};

export function GroupsView({ tracks }: { tracks: TopicTrack[] }) {
  return (
    <SignInGate feature="people">
      <Groups tracks={tracks} />
    </SignInGate>
  );
}

function Groups({ tracks }: { tracks: TopicTrack[] }) {
  const account = useAccount();
  const user = account.user;
  const userId = user?.id ?? "";
  const today = useToday();
  const [groups, setGroups] = useState<StudyGroup[] | null>(null);
  const [member, setMember] = useState<boolean | null>(null);
  const [problem, setProblem] = useState<{ text: string; code?: string } | null>(null);
  const [note, setNote] = useState<Note>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [pending, setPending] = useState<Pending>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await loadGroups();
    if (result.ok) {
      setGroups(result.value);
      setProblem(null);
    } else setProblem({ text: result.error, code: result.code });
  }, []);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    void Promise.all([loadGroups(), loadOverview()]).then(([g, o]) => {
      if (!live) return;
      if (g.ok) setGroups(g.value);
      else setProblem({ text: g.error, code: g.code });
      setMember(o.ok ? o.value.me.on : false);
    });
    return () => {
      live = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!groups) return;
    const id = window.location.hash.slice(1);
    if (id.startsWith("group-")) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, [groups]);

  const mine = useMemo(
    () => (user && today ? currentCard(user, account.profile, tracks) : null),
    [user, account.profile, tracks, today]
  );

  if (!user) return null;

  async function act(task: () => Promise<NetResult<string>>, text?: string) {
    setBusy(true);
    setNote(null);
    const result = await task();
    setBusy(false);
    if (!result.ok) {
      setNote({ ok: false, text: result.error });
      return false;
    }
    const known = STATUS[result.value];
    setNote(known && !known.ok ? known : { ok: true, text: text ?? known?.text ?? "Done." });
    await reload();
    return known ? known.ok : true;
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) {
      setNote(STATUS.bad_name);
      return;
    }
    const done = await act(async () => {
      const result = await createGroup(name, about);
      return result.ok ? { ok: true as const, value: result.value.status } : result;
    });
    if (done) {
      setName("");
      setAbout("");
    }
  }

  async function copy(group: StudyGroup) {
    if (!group.code) return;
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/groups/join/${group.code}`);
      setCopied(group.id);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  async function confirm() {
    const p = pending;
    setPending(null);
    if (!p) return;
    if (p.kind === "leave") await act(() => leaveGroup(p.group.id));
    else if (p.kind === "delete") await act(() => deleteGroup(p.group.id));
    else if (p.kind === "code")
      await act(() => newGroupCode(p.group.id), "New invite link made. The old one stopped working.");
    else if (p.name) await act(() => removeFromGroup(p.group.id, p.name!), `${p.label} was removed.`);
  }

  if (problem && !groups) {
    return (
      <div className={people.page}>
        <section className={people.card}>
          <h1 className={people.title}>Study groups</h1>
          <p className={problem.code === "not_ready" ? people.soon : people.error}>{problem.text}</p>
        </section>
      </div>
    );
  }

  if (!groups || member === null) return <div className={people.wait} aria-busy="true" aria-label="Loading groups" />;

  const status = note && (
    <p className={note.ok ? people.ok : people.error} role={note.ok ? "status" : "alert"}>
      {note.text}
    </p>
  );

  return (
    <div className={people.page}>
      <header className={people.head}>
        <h1 className={people.h1}>Study groups</h1>
        <p className={people.headMeta}>
          Up to 20 people. Join by invite link, and the person who runs the group lets you in.
        </p>
      </header>
      {status && <div className={people.toast}>{status}</div>}

      <div className={people.columns}>
        <div className={people.main}>
          {groups.length === 0 && (
            <section className={people.card}>
              <p className={people.empty}>
                You are not in a group yet. Make one below, or open an invite link a friend sent you.
              </p>
            </section>
          )}
          {groups.map((group) => {
            const others = group.members.filter((m) => !m.me);
            const meRow =
              group.role !== "pending" && mine && today
                ? {
                    username: "",
                    name: "You",
                    week: weekCount(mine, today),
                    streak: mine.streak,
                    level: mine.level,
                    me: true,
                  }
                : null;
            const board = today ? leaderboard(meRow, others, today) : [];
            const link = group.code ? `${SITE_URL}/groups/join/${group.code}` : null;
            return (
              <section
                key={group.id}
                id={`group-${group.id}`}
                className={people.card}
                aria-labelledby={`g-${group.id}`}
              >
                <div className={people.cardHead}>
                  <h2 id={`g-${group.id}`} className={people.title}>
                    {group.name}
                  </h2>
                  <span className={people.tag}>
                    {group.role === "owner" ? "You run it" : group.role === "pending" ? "Waiting" : "Member"} ·{" "}
                    {group.count}/20
                  </span>
                </div>
                {group.about && <p className={styles.about}>{group.about}</p>}

                {group.role === "pending" ? (
                  <div className={styles.waiting}>
                    <p>You asked to join. The person who runs the group will let you in.</p>
                    <button
                      type="button"
                      className={people.btnQuiet}
                      disabled={busy}
                      onClick={() => void act(() => leaveGroup(group.id), "Request withdrawn.")}
                    >
                      Withdraw
                    </button>
                  </div>
                ) : (
                  <>
                    {group.pending.length > 0 && (
                      <div className={styles.requests}>
                        <p className={people.sub}>Want to join</p>
                        {group.pending.map((face) => (
                          <div key={face.username} className={styles.requestRow}>
                            <span>
                              <strong>{face.name}</strong> <span className={people.handle}>@{face.username}</span>
                            </span>
                            <button
                              type="button"
                              className={people.btnPrimary}
                              disabled={busy}
                              onClick={() =>
                                void act(() => answerGroup(group.id, face.username, true), `${face.name} is in.`)
                              }
                            >
                              Let in
                            </button>
                            <button
                              type="button"
                              className={people.btnQuiet}
                              disabled={busy}
                              onClick={() => void act(() => answerGroup(group.id, face.username, false))}
                            >
                              Decline
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className={people.sub}>This week</p>
                    <ol className={people.board}>
                      {board.map((row, i) => (
                        <li
                          key={row.me ? "me" : row.username}
                          className={`${people.boardRow}${group.role === "owner" ? ` ${styles.ownerRow}` : ""}`}
                          data-me={row.me || undefined}
                        >
                          <span className={people.rank}>{i === 0 && row.week > 0 ? "🏆" : i + 1}</span>
                          <span className={people.boardName}>{row.name}</span>
                          <span className={people.boardStreak} title="Day streak">
                            🔥 {row.streak}
                          </span>
                          <span className={people.boardWeek}>
                            <strong>{row.week}</strong> done
                          </span>
                          {group.role === "owner" && !row.me && (
                            <button
                              type="button"
                              className={styles.remove}
                              aria-label={`Remove ${row.name} from ${group.name}`}
                              disabled={busy}
                              onClick={() => setPending({ kind: "remove", group, name: row.username, label: row.name })}
                            >
                              ✕
                            </button>
                          )}
                        </li>
                      ))}
                    </ol>

                    {link && (
                      <div className={styles.invite}>
                        <p className={people.sub}>Invite link</p>
                        <code className={styles.link}>{link.replace(/^https?:\/\//, "")}</code>
                        <div className={people.row}>
                          <button type="button" className={people.btn} onClick={() => void copy(group)}>
                            {copied === group.id ? "Copied" : "Copy link"}
                          </button>
                          <button
                            type="button"
                            className={people.btnQuiet}
                            disabled={busy}
                            onClick={() => setPending({ kind: "code", group })}
                          >
                            New link
                          </button>
                        </div>
                      </div>
                    )}

                    {editing === group.id ? (
                      <EditGroup
                        group={group}
                        busy={busy}
                        onCancel={() => setEditing(null)}
                        onSave={async (n, a) => {
                          if (await act(() => editGroup(group.id, n, a))) setEditing(null);
                        }}
                      />
                    ) : (
                      <div className={people.row}>
                        {group.role === "owner" && (
                          <button type="button" className={people.btnQuiet} onClick={() => setEditing(group.id)}>
                            Rename
                          </button>
                        )}
                        <button
                          type="button"
                          className={people.btnQuiet}
                          disabled={busy}
                          onClick={() => setPending({ kind: "leave", group })}
                        >
                          Leave
                        </button>
                        {group.role === "owner" && (
                          <button
                            type="button"
                            className={people.btnDanger}
                            disabled={busy}
                            onClick={() => setPending({ kind: "delete", group })}
                          >
                            Delete group
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>

        <aside className={people.side}>
          <section className={people.card} aria-labelledby="groups-new">
            <h2 id="groups-new" className={people.title}>
              Start a group
            </h2>
            {member ? (
              <form className={styles.form} onSubmit={(e) => void create(e)} noValidate>
                <label className={styles.label} htmlFor="group-name">
                  Name
                </label>
                <input
                  id="group-name"
                  className={styles.input}
                  value={name}
                  maxLength={60}
                  placeholder="Amazon SDE-2 prep"
                  onChange={(e) => setName(e.target.value)}
                />
                <label className={styles.label} htmlFor="group-about">
                  What is it for? <span className={people.hint}>(optional)</span>
                </label>
                <textarea
                  id="group-about"
                  className={`${styles.input} ${styles.area}`}
                  value={about}
                  maxLength={200}
                  rows={3}
                  placeholder="Two chapters a day until the interview in March"
                  onChange={(e) => setAbout(e.target.value)}
                />
                <button type="submit" className={people.btnPrimary} disabled={busy || name.trim().length < 3}>
                  Make the group
                </button>
                <p className={people.hint}>You get an invite link to share. You decide who gets in.</p>
              </form>
            ) : (
              <div className={people.callout}>
                <p>Join connections first, so group members can see your weekly numbers.</p>
                <Link href="/people" className={people.btnPrimary}>
                  Go to People
                </Link>
              </div>
            )}
          </section>
        </aside>
      </div>

      {pending && (
        <ConfirmDialog
          title={
            pending.kind === "leave"
              ? `Leave ${pending.group.name}?`
              : pending.kind === "delete"
                ? `Delete ${pending.group.name}?`
                : pending.kind === "code"
                  ? "Make a new invite link?"
                  : `Remove ${pending.label}?`
          }
          body={
            <p>
              {pending.kind === "leave"
                ? pending.group.role === "owner"
                  ? "The longest-standing member will run the group after you. If nobody else is in it, it is deleted."
                  : "You can ask to join again with the invite link."
                : pending.kind === "delete"
                  ? "Everyone is removed and the invite link stops working. This cannot be undone."
                  : pending.kind === "code"
                    ? "The old link stops working at once. People already in the group stay."
                    : "They can ask to join again if they still have the link."}
            </p>
          }
          confirmLabel={
            pending.kind === "leave"
              ? "Leave"
              : pending.kind === "delete"
                ? "Delete"
                : pending.kind === "code"
                  ? "Make new link"
                  : "Remove"
          }
          danger={pending.kind !== "code"}
          onConfirm={() => void confirm()}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}

function EditGroup({
  group,
  busy,
  onSave,
  onCancel,
}: {
  group: StudyGroup;
  busy: boolean;
  onSave: (name: string, about: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(group.name);
  const [about, setAbout] = useState(group.about);
  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSave(name, about);
      }}
    >
      <label className={styles.label} htmlFor={`edit-name-${group.id}`}>
        Name
      </label>
      <input
        id={`edit-name-${group.id}`}
        className={styles.input}
        value={name}
        maxLength={60}
        onChange={(e) => setName(e.target.value)}
      />
      <label className={styles.label} htmlFor={`edit-about-${group.id}`}>
        What is it for?
      </label>
      <textarea
        id={`edit-about-${group.id}`}
        className={`${styles.input} ${styles.area}`}
        value={about}
        maxLength={200}
        rows={2}
        onChange={(e) => setAbout(e.target.value)}
      />
      <div className={people.row}>
        <button type="submit" className={people.btnPrimary} disabled={busy || name.trim().length < 3}>
          Save
        </button>
        <button type="button" className={people.btnQuiet} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
