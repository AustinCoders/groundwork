"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { beginningPlacement } from "@/lib/placementRecord";
import { savePlacement } from "@/lib/placementStore";
import { placementPath, type PlanData } from "@/lib/placementPlan";
import styles from "./placement.module.css";

export function PlacementDoors({
  data,
  basePath,
  pickHref,
  row = false,
  labelledBy,
}: {
  data: PlanData;
  basePath: string;
  pickHref: string;
  row?: boolean;
  labelledBy?: string;
}) {
  const router = useRouter();
  const first = data.chapters.find((chapter) => chapter.ready);

  function startFromTheBeginning() {
    savePlacement(beginningPlacement(data.chapters, Date.now()));
    if (first) router.push(`${basePath}/${first.id}`);
  }

  return (
    <ul className={row ? `${styles.doors} ${styles.doorsRow}` : styles.doors} aria-labelledby={labelledBy}>
      <li>
        <button type="button" className={styles.door} data-door="beginning" onClick={startFromTheBeginning}>
          <span className={styles.doorNo} aria-hidden="true">
            01
          </span>
          <span className={styles.doorName}>Start from the beginning</span>
          <span className={styles.doorQuote}>No test. Every chapter, in order.</span>
        </button>
      </li>
      <li>
        <Link className={styles.door} data-door="placement" href={placementPath(data.topicId)} prefetch={false}>
          <span className={styles.doorNo} aria-hidden="true">
            02
          </span>
          <span className={styles.doorName}>Find my level</span>
          <span className={styles.doorQuote}>About 10 minutes, no timer, then a plan.</span>
        </Link>
      </li>
      <li>
        <Link className={styles.door} data-door="pick" href={pickHref} prefetch={false}>
          <span className={styles.doorNo} aria-hidden="true">
            03
          </span>
          <span className={styles.doorName}>I&apos;ll pick a level</span>
          <span className={styles.doorQuote}>Choose beginner, intermediate or advanced yourself.</span>
        </Link>
      </li>
    </ul>
  );
}
