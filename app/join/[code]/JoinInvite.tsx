"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarArt } from "@/components/account/AvatarArt";
import { avatarStyle } from "@/lib/account/avatar";
import { openAuth } from "@/lib/account/config";
import { loadOverview } from "@/lib/account/network";
import { isAvatarArt } from "@/lib/account/profileExtras";
import { useAccount } from "@/lib/account/session";
import { INVITE_CODE, INVITE_KEY, previewInvite, redeemInvite } from "@/lib/account/social";
import { store } from "@/lib/storage";
import people from "@/app/people/people.module.css";
import styles from "@/app/groups/groups.module.css";

type Inviter = { name: string; color: "blue" | "purple" | "green" | "orange" | "red"; art: string; level: number };

export function JoinInvite({ code }: { code: string }) {
  const account = useAccount();
  const valid = INVITE_CODE.test(code);
  const [inviter, setInviter] = useState<Inviter | null | undefined>(undefined);
  const [state, setState] = useState<"idle" | "connected" | "need-join" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const userId = account.status === "in" ? (account.user?.id ?? "") : "";

  useEffect(() => {
    if (!valid) return;
    store.set(INVITE_KEY, { code, at: Date.now() });
    let live = true;
    void previewInvite(code).then((r) => {
      if (live) setInviter(r.ok ? r.value : null);
    });
    return () => {
      live = false;
    };
  }, [code, valid]);

  useEffect(() => {
    if (!userId || !valid || !inviter) return;
    let live = true;
    void loadOverview().then(async (o) => {
      if (!live) return;
      if (!o.ok || !o.value.me.on) {
        setState("need-join");
        return;
      }
      const r = await redeemInvite(code);
      if (!live) return;
      if (r.ok && r.value.status === "connected") {
        store.remove(INVITE_KEY);
        setState("connected");
      } else if (r.ok && r.value.status === "self") {
        store.remove(INVITE_KEY);
        setError("That is your own invite link. Share it with a friend.");
        setState("error");
      } else {
        setError(r.ok ? "This invite link does not work any more." : r.error);
        setState("error");
      }
    });
    return () => {
      live = false;
    };
  }, [userId, valid, inviter, code]);

  if (!valid || inviter === null) {
    return (
      <div className={people.page}>
        <section className={`${people.card} ${styles.joinCard}`}>
          <h1 className={people.title}>This invite link does not work</h1>
          <p className={people.hint}>It may have been replaced by a new one. Ask your friend for the latest link.</p>
          <Link href="/" className={people.btn}>
            Go to Groundwork
          </Link>
        </section>
      </div>
    );
  }
  if (inviter === undefined) return <div className={people.wait} aria-busy="true" aria-label="Loading the invite" />;

  const first = inviter.name.split(" ")[0];
  return (
    <div className={people.page}>
      <section className={`${people.card} ${styles.joinCard}`} aria-labelledby="invite-title">
        <span
          className={people.mini}
          style={avatarStyle(inviter.color) as CSSProperties | undefined}
          aria-hidden="true"
        >
          {isAvatarArt(inviter.art) ? <AvatarArt art={inviter.art} /> : inviter.name[0]?.toUpperCase()}
        </span>
        <p className={people.kicker}>Invite</p>
        <h1 id="invite-title" className={people.joinTitle}>
          {first} wants to study with you
        </h1>
        <p className={people.hint}>
          Groundwork is free notes, practice problems and mock interviews for developers. Join with this link and you
          and {first} are connected straight away: you see each other&apos;s streaks and can cheer each other on.
        </p>
        {state === "connected" ? (
          <>
            <p className={people.ok} role="status">
              You and {first} are connected.
            </p>
            <Link href="/people" className={people.btnPrimary}>
              Open People
            </Link>
          </>
        ) : state === "need-join" ? (
          <div className={people.callout}>
            <p>One more step: join connections on the People page. You are linked to {first} as soon as you do.</p>
            <Link href="/people" className={people.btnPrimary}>
              Go to People
            </Link>
          </div>
        ) : state === "error" ? (
          <p className={people.error} role="alert">
            {error}
          </p>
        ) : account.status === "out" ? (
          <div className={people.row}>
            <button
              type="button"
              className={`${people.btnPrimary} ${people.btnLarge}`}
              onClick={() => openAuth("sign-up", `/join/${code}`)}
            >
              Create a free account
            </button>
            <button type="button" className={people.btn} onClick={() => openAuth("sign-in", `/join/${code}`)}>
              Sign in
            </button>
          </div>
        ) : (
          <p className={people.hint} aria-busy="true">
            Linking you up…
          </p>
        )}
      </section>
    </div>
  );
}
