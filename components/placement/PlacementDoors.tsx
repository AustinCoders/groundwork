"use client";

import Link from "next/link";
import { beginningPlacement } from "@/lib/placementRecord";
import { savePlacement } from "@/lib/placementStore";
import { placementPath, type PlanData } from "@/lib/placementPlan";
import styles from "./placement.module.css";

export function PlacementDoors({
  data,
  basePath,
  pickHref,
  label,
}: {
  data: PlanData;
  basePath: string;
  pickHref: string;
  label: string;
}) {
  const first = data.chapters.find((chapter) => chapter.ready);
  const beginningHref = first ? `${basePath}/${first.id}` : basePath;

  return (
    <ul className={styles.doors} aria-label={label}>
      <li>
        <Link
          className={styles.door}
          data-door="beginning"
          href={beginningHref}
          prefetch={false}
          onClick={() => savePlacement(beginningPlacement(data.chapters, Date.now()))}
        >
          <span className={styles.doorName}>Start from the beginning</span>
          <span className={styles.doorQuote}>No test. Every chapter, in order.</span>
        </Link>
      </li>
      <li>
        <Link className={styles.door} data-door="placement" href={placementPath(data.topicId)} prefetch={false}>
          <span className={styles.doorName}>Find my level</span>
          <span className={styles.doorQuote}>A short set of questions, no timer, then a plan.</span>
        </Link>
      </li>
      <li>
        <Link className={styles.door} data-door="pick" href={pickHref} prefetch={false}>
          <span className={styles.doorName}>I&apos;ll pick a level</span>
          <span className={styles.doorQuote}>Choose beginner, intermediate or advanced yourself.</span>
        </Link>
      </li>
    </ul>
  );
}
