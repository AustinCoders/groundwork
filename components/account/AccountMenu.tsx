"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { avatarStyle } from "@/lib/account/avatar";
import { openAuth } from "@/lib/account/config";
import { signOut, syncAccountNow, useAccount, useSyncStatus } from "@/lib/account/session";
import { computeStats, type Stats } from "@/lib/gamification";
import { useProgressValue } from "@/lib/hooks";
import { progress } from "@/lib/storage";
import { AvatarFace } from "./AccountChip";
import styles from "./menu.module.css";

type Overlay = "look" | null;

const SYNC_TEXT: Record<string, string> = {
  idle: "Synced",
  syncing: "Syncing…",
  error: "Sync failed",
  offline: "Offline",
  off: "Not syncing",
};

const LookDialog = lazy(() => import("@/components/tour/LookDialog").then((m) => ({ default: m.LookDialog })));

export function AccountMenu({ compact }: { compact?: boolean }) {
  const account = useAccount();
  const sync = useSyncStatus();
  const router = useRouter();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const statsKey = useProgressValue(() => JSON.stringify(computeStats()), "");
  const due = useProgressValue(() => progress.dueForReview(Object.keys(progress.all().chapters)).length, 0);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    root.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  if (account.status === "off") return null;
  if (account.status === "loading") return <span className={styles.pending} aria-hidden="true" />;
  if (account.status === "out" || !account.user) {
    return (
      <button
        type="button"
        className={styles.signIn}
        data-compact={compact || undefined}
        onClick={() => openAuth("sign-in")}
        aria-label="Sign in"
      >
        <span className={styles.signInIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
        </span>
        <span className={styles.label}>Sign in</span>
      </button>
    );
  }

  const user = account.user;
  const name = account.profile?.displayName || user.name;
  const stats: Stats | null = statsKey ? (JSON.parse(statsKey) as Stats) : null;

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    const items = [...(root.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const at = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(at + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(at - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function pick(next: Overlay) {
    setOpen(false);
    setOverlay(next);
  }

  async function leave() {
    setBusy(true);
    await signOut();
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className={styles.root} ref={root}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        data-compact={compact || undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((now) => !now)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={styles.avatar} style={avatarStyle(user.extras.avatarColor, account.photo)} aria-hidden="true">
          <AvatarFace name={name} art={user.extras.avatarArt} photo={account.photo} />
          <span className={styles.status} data-state={sync.state} />
        </span>
        <span className={styles.label}>{name}</span>
        <svg className={styles.caret} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {open && (
        <div id={menuId} className={styles.menu} role="menu" aria-label="Account" onKeyDown={onMenuKey}>
          <div className={styles.head}>
            <span
              className={styles.bigAvatar}
              style={avatarStyle(user.extras.avatarColor, account.photo)}
              aria-hidden="true"
            >
              <AvatarFace name={name} art={user.extras.avatarArt} photo={account.photo} />
            </span>
            <div className={styles.who}>
              <strong>{name}</strong>
              <span>{user.email}</span>
              <span className={styles.syncLine}>
                <i data-state={sync.state} aria-hidden="true" /> {SYNC_TEXT[sync.state] ?? "Synced"}
                {account.profile?.plan === "pro" ? " · Pro" : " · Free plan"}
              </span>
            </div>
          </div>
          <div className={styles.stats}>
            <span>
              <b>Lv {stats?.level ?? 1}</b>
              <small>level</small>
            </span>
            <span>
              <b>{stats?.xp ?? 0}</b>
              <small>XP</small>
            </span>
            <span>
              <b>🔥 {stats?.streak ?? 0}</b>
              <small>day streak</small>
            </span>
          </div>

          <div className={styles.group} role="group" aria-label="You">
            <Link
              href="/account/profile"
              role="menuitem"
              className={styles.item}
              prefetch={false}
              onClick={() => close(false)}
            >
              <span className={styles.icon} aria-hidden="true">
                ✎
              </span>
              <span className={styles.itemText}>
                Edit profile
                <small>Name, headline, links and goals</small>
              </span>
            </Link>
            <Link href="/account" role="menuitem" className={styles.item} prefetch={false} onClick={() => close(false)}>
              <span className={styles.icon} aria-hidden="true">
                ⚙
              </span>
              <span className={styles.itemText}>
                Account settings
                <small>Sign-in, two-step, data</small>
              </span>
            </Link>
            <button type="button" role="menuitem" className={styles.item} onClick={() => pick("look")}>
              <span className={styles.icon} aria-hidden="true">
                🎨
              </span>
              <span className={styles.itemText}>
                Theme and handwriting
                <small>How the notebook looks</small>
              </span>
            </button>
          </div>

          <div className={styles.group} role="group" aria-label="Learning">
            <Link
              href="/progress"
              role="menuitem"
              className={styles.item}
              prefetch={false}
              onClick={() => close(false)}
            >
              <span className={styles.icon} aria-hidden="true">
                ▤
              </span>
              <span className={styles.itemText}>Your progress</span>
            </Link>
            <Link href="/review" role="menuitem" className={styles.item} prefetch={false} onClick={() => close(false)}>
              <span className={styles.icon} aria-hidden="true">
                ↻
              </span>
              <span className={styles.itemText}>Review queue</span>
              {due > 0 && <span className={styles.badge}>{due} due</span>}
            </Link>
            <button
              type="button"
              role="menuitem"
              className={styles.item}
              disabled={sync.state === "syncing"}
              onClick={() => void syncAccountNow()}
            >
              <span className={styles.icon} aria-hidden="true">
                ⟳
              </span>
              <span className={styles.itemText}>{sync.state === "syncing" ? "Syncing…" : "Sync now"}</span>
            </button>
          </div>

          <div className={styles.group} role="group" aria-label="Session">
            <button
              type="button"
              role="menuitem"
              className={`${styles.item} ${styles.danger}`}
              disabled={busy}
              onClick={() => void leave()}
            >
              <span className={styles.icon} aria-hidden="true">
                ⏻
              </span>
              <span className={styles.itemText}>{busy ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}

      {overlay && (
        <Suspense fallback={null}>
          <LookDialog onClose={closeOverlay} />
        </Suspense>
      )}
    </div>
  );
}
