"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { avatarStyle } from "@/lib/account/avatar";
import { useLiveNetworkCard } from "@/lib/account/liveCard";
import { connectAccount, useAccount } from "@/lib/account/session";
import { loadNotes, noteHref, noteText, readAllNotes, type NoteList } from "@/lib/account/social";
import { useClientValue } from "@/lib/hooks";
import { AvatarArt } from "./AvatarArt";
import { isAvatarArt } from "@/lib/account/profileExtras";
import styles from "./bell.module.css";

const POLL_MS = 3 * 60_000;
const EMPTY: NoteList = { unread: 0, items: [] };

let notes: NoteList = EMPTY;
let off = false;
let loadedFor: string | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function refresh(userId: string): Promise<void> {
  if (off) return Promise.resolve();
  if (loading) return loading;
  loading = loadNotes()
    .then((result) => {
      if (result.ok) {
        notes = result.value;
        loadedFor = userId;
      } else if (result.code === "not_ready" || result.code === "second_step" || result.code === "unconfirmed") {
        off = true;
        notes = EMPTY;
      }
      emit();
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function nowMinute(): number {
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function ago(iso: string, now: number): string {
  if (!now) return "";
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function NotificationBell() {
  const account = useAccount();
  const userId = account.status === "in" ? (account.user?.id ?? "") : "";
  const list = useSyncExternalStore(
    subscribe,
    () => notes,
    () => EMPTY
  );
  const now = useClientValue(nowMinute, 0);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useLiveNetworkCard(userId ? account.user : null, account.profile);

  useEffect(() => {
    if (!userId) {
      notes = EMPTY;
      loadedFor = null;
      off = false;
      emit();
      return;
    }
    if (loadedFor !== userId) void refresh(userId);
    const tick = () => {
      if (document.visibilityState === "visible") void refresh(userId);
    };
    const timer = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    let gone = false;
    let stop: (() => void) | null = null;
    void connectAccount().then((db) => {
      if (!db || gone) return;
      const channel = db
        .channel(`notes:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => void refresh(userId)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          () => void refresh(userId)
        )
        .subscribe();
      stop = () => void db.removeChannel(channel);
    });
    return () => {
      gone = true;
      stop?.();
      window.clearInterval(timer);
      window.removeEventListener("focus", tick);
    };
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!userId || off) return null;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && list.unread > 0) {
      void readAllNotes().then(() => {
        notes = { unread: 0, items: notes.items };
        emit();
      });
    }
    if (next) void refresh(userId);
  }

  const shownUnread = list.unread;
  return (
    <div className={styles.root} ref={root}>
      <button
        ref={button}
        type="button"
        className={styles.bell}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={shownUnread > 0 ? `Notifications, ${shownUnread} new` : "Notifications"}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" />
          <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
        </svg>
        {shownUnread > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {shownUnread > 9 ? "9+" : shownUnread}
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} className={styles.panel} role="region" aria-label="Notifications">
          <div className={styles.head}>
            <p className={styles.title}>Notifications</p>
            <Link href="/people" className={styles.headLink} prefetch={false} onClick={() => setOpen(false)}>
              People
            </Link>
          </div>
          {list.items.length === 0 ? (
            <p className={styles.empty}>Nothing yet. Requests, cheers, group and mock interview news show up here.</p>
          ) : (
            <ul className={styles.list}>
              {list.items.map((note) => (
                <li key={note.id}>
                  <Link
                    href={noteHref(note)}
                    className={styles.item}
                    data-new={!note.read || undefined}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className={styles.face}
                      style={avatarStyle(note.actor?.color ?? "blue") as CSSProperties | undefined}
                      aria-hidden="true"
                    >
                      {note.actor && isAvatarArt(note.actor.art) ? (
                        <AvatarArt art={note.actor.art} />
                      ) : (
                        (note.actor?.name[0] ?? "?").toUpperCase()
                      )}
                    </span>
                    <span className={styles.text}>{noteText(note)}</span>
                    <span className={styles.when}>{ago(note.at, now)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
