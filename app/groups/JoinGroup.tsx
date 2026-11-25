"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignInGate } from "@/components/account/SignInGate";
import { useAccount } from "@/lib/account/session";
import { GROUP_CODE, joinGroup, previewGroup, type GroupPreview } from "@/lib/account/social";
import people from "@/app/people/people.module.css";
import styles from "./groups.module.css";

const JOIN_TEXT: Record<string, string> = {
  full: "This group already has 20 people.",
  too_many: "You are in too many groups. Leave one first.",
  limit: "That is a lot of join requests for one day. Try tomorrow.",
  not_found: "This invite link does not work any more. Ask for a new one.",
};

export function JoinGroup({ code }: { code: string }) {
  return (
    <SignInGate feature="people">
      <Join code={code} />
    </SignInGate>
  );
}

function Join({ code }: { code: string }) {
  const account = useAccount();
  const router = useRouter();
  const userId = account.user?.id ?? "";
  const valid = GROUP_CODE.test(code);
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (!userId || !valid) return;
    let live = true;
    void previewGroup(code).then((result) => {
      if (!live) return;
      if (result.ok) setPreview(result.value);
      else setError(result.error);
    });
    return () => {
      live = false;
    };
  }, [userId, code, valid]);

  async function join() {
    setBusy(true);
    setError(null);
    const result = await joinGroup(code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.value === "member") {
      router.push(`/groups#group-${preview?.id ?? ""}`);
      return;
    }
    if (result.value === "requested") {
      setAsked(true);
      return;
    }
    setError(JOIN_TEXT[result.value] ?? "Something went wrong. Try again.");
  }

  if (!valid || preview?.status === "not_found") {
    return (
      <div className={people.page}>
        <section className={`${people.card} ${styles.joinCard}`}>
          <h1 className={people.title}>This invite link does not work</h1>
          <p className={people.hint}>It may have been replaced by a new one. Ask your friend for the latest link.</p>
          <Link href="/groups" className={people.btn}>
            Your groups
          </Link>
        </section>
      </div>
    );
  }

  if (!preview) {
    return error ? (
      <div className={people.page}>
        <p className={people.error} role="alert">
          {error}
        </p>
      </div>
    ) : (
      <div className={people.wait} aria-busy="true" aria-label="Loading the invite" />
    );
  }

  if (preview.status === "limit") {
    return (
      <div className={people.page}>
        <p className={people.error} role="alert">
          Too many invite links opened today. Try again tomorrow.
        </p>
      </div>
    );
  }

  const already = preview.mine === "owner" || preview.mine === "member";
  const waiting = preview.mine === "pending" || asked;

  return (
    <div className={people.page}>
      <section className={`${people.card} ${styles.joinCard}`} aria-labelledby="join-title">
        <p className={people.kicker}>Study group invite</p>
        <h1 id="join-title" className={people.joinTitle}>
          {preview.name}
        </h1>
        {preview.about && <p className={styles.about}>{preview.about}</p>}
        <p className={people.hint}>
          Run by {preview.owner || "a Groundwork member"} · {preview.count} of 20 people
        </p>
        {already ? (
          <Link href={`/groups#group-${preview.id}`} className={people.btnPrimary}>
            Open the group
          </Link>
        ) : waiting ? (
          <p className={people.ok} role="status">
            Asked to join. You will get a notification when you are let in.
          </p>
        ) : !preview.member ? (
          <div className={people.callout}>
            <p>Join connections first, so the group can see your weekly numbers.</p>
            <Link href="/people" className={people.btnPrimary}>
              Go to People
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className={`${people.btnPrimary} ${people.btnLarge}`}
            disabled={busy}
            onClick={() => void join()}
          >
            {busy ? "Asking…" : "Ask to join"}
          </button>
        )}
        {error && (
          <p className={people.error} role="alert">
            {error}
          </p>
        )}
        <p className={people.hint}>
          Members see your name, avatar, level, streak and this week&apos;s chapter and problem count. Never your email.
        </p>
      </section>
    </div>
  );
}
