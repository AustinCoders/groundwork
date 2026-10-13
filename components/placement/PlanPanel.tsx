"use client";

import Link from "next/link";
import { levelWords, placementPath, planSummary, planView, type PlanData } from "@/lib/placementPlan";
import type { PlacementStatus } from "@/lib/usePlacementState";
import { plural } from "@/lib/format";
import { ResetPlan } from "./ResetPlan";
import styles from "./placement.module.css";

export function PlanPanel({
  data,
  state,
  readCount,
  onReset,
}: {
  data: PlanData;
  state: PlacementStatus;
  readCount: number;
  onReset: () => void;
}) {
  if (!state.mounted || state.firstTime) return null;

  if (state.placement) {
    const view = planView(state.placement, data.chapters);
    return (
      <section className={styles.panelBlock} aria-labelledby="plan-title" data-plan>
        <p className={styles.cardKicker}>Your plan</p>
        <h3 className={styles.cardTitle} id="plan-title">
          {levelWords(view.level, data.levelNames)}
        </h3>
        <p className={styles.cardText}>{planSummary(view)}. Nothing is locked.</p>
        <div className={styles.cardActions}>
          <Link className={styles.cardLink} href={placementPath(data.topicId)} prefetch={false}>
            See the plan
          </Link>
          <Link className={styles.cardLink} href={placementPath(data.topicId, true)} prefetch={false} data-recheck="">
            {state.marks ? "Re-check my level" : "Retake the placement"}
          </Link>
          <ResetPlan onReset={onReset} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panelBlock} aria-labelledby="recheck-title">
      <p className={styles.cardKicker}>Your level</p>
      <h3 className={styles.cardTitle} id="recheck-title">
        Where are you now?
      </h3>
      <p className={styles.cardText}>
        You have {plural(readCount, "chapter")} ticked. A short placement gives you a plan, and it never changes a tick.
      </p>
      <div className={styles.cardActions}>
        <Link className={styles.cardLink} href={placementPath(data.topicId, true)} prefetch={false} data-recheck="">
          Re-check my level
        </Link>
      </div>
    </section>
  );
}
