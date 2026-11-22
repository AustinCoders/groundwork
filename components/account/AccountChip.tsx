"use client";

import Link from "next/link";
import { avatarStyle } from "@/lib/account/avatar";
import { openAuth } from "@/lib/account/config";
import type { AvatarArt as Art } from "@/lib/account/profileExtras";
import { useAccount, useSyncStatus } from "@/lib/account/session";
import { AvatarArt } from "./AvatarArt";
import styles from "./account.module.css";

const SYNC_LABEL: Record<string, string> = {
  idle: "synced",
  syncing: "syncing",
  error: "sync failed",
  offline: "offline",
  off: "not syncing",
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function AvatarFace({ name, art, photo }: { name: string; art: Art | ""; photo?: string | null }) {
  if (photo) return null;
  if (art) return <AvatarArt art={art} />;
  return <>{initials(name)}</>;
}

export function AccountChip({ onNavigate }: { onNavigate?: () => void }) {
  const account = useAccount();
  const sync = useSyncStatus();

  if (account.status === "off") return null;
  if (account.status === "loading") return <span className={styles.chipPending} aria-hidden="true" />;
  if (account.status === "out" || !account.user) {
    return (
      <button
        type="button"
        className={`${styles.chip} ${styles.chipOut}`}
        onClick={() => {
          onNavigate?.();
          openAuth("sign-in");
        }}
      >
        Sign in
      </button>
    );
  }
  const name = account.profile?.displayName || account.user.name;
  return (
    <Link
      href="/account"
      className={styles.chip}
      prefetch={false}
      onClick={onNavigate}
      aria-label={`Your account, ${name}, ${SYNC_LABEL[sync.state] ?? "synced"}`}
    >
      <span
        className={styles.avatar}
        style={avatarStyle(account.user.extras.avatarColor, account.photo)}
        aria-hidden="true"
      >
        <AvatarFace name={name} art={account.user.extras.avatarArt} photo={account.photo} />
      </span>
      <span className={styles.chipName}>{name}</span>
      <span className={styles.dot} data-state={sync.state} aria-hidden="true" />
    </Link>
  );
}
