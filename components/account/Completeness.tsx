"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { useAccount } from "@/lib/account/session";
import { completeness } from "@/lib/profile/completeness";
import { usePlan } from "@/lib/profile/plan";
import styles from "./completeness.module.css";

export function Completeness({ compact = false }: { compact?: boolean }) {
  const { user, profile, photo } = useAccount();
  const studyPlan = usePlan();
  if (!user) return null;
  const result = completeness({
    name: profile?.displayName || user.name,
    emailName: user.email.split("@")[0] ?? "",
    hasPicture: Boolean(photo) || Boolean(user.extras.avatarArt),
    headline: user.extras.headline,
    location: user.extras.location,
    github: user.extras.github,
    linkedin: user.extras.linkedin,
    website: user.extras.website,
    role: profile?.targetRole ?? null,
    goal: profile?.goal ?? null,
    experience: profile?.experience ?? null,
    planned: Boolean(studyPlan.date) || studyPlan.companies.length > 0,
    skills: Object.keys(studyPlan.skills).length,
  });
  const missing = result.items.filter((item) => !item.done);
  const complete = missing.length === 0;

  return (
    <div className={styles.box} data-compact={compact || undefined} data-complete={complete || undefined}>
      <div className={styles.head}>
        <p className={styles.title}>
          {complete ? "Your profile is complete" : `Your profile is ${result.percent}% complete`}
        </p>
        <span className={styles.count}>
          {result.done}/{result.total}
        </span>
      </div>
      <span
        className={styles.track}
        role="progressbar"
        aria-label="Profile complete"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={result.percent}
      >
        <span className={styles.fill} style={{ "--pct": `${result.percent}%` } as CSSProperties} />
      </span>
      {!complete && (
        <p className={styles.next}>
          <span>Add next:</span>
          {missing.slice(0, compact ? 3 : 5).map((item) => (
            <Link key={item.id} href={item.href} className={styles.chip} prefetch={false}>
              + {item.label}
            </Link>
          ))}
          {missing.length > (compact ? 3 : 5) && (
            <span className={styles.more}>and {missing.length - (compact ? 3 : 5)} more</span>
          )}
        </p>
      )}
    </div>
  );
}
