"use client";

import Link from "next/link";
import { Card } from "@/components/topic/Compose";
import { Button, topicKit } from "@/components/topic/TopicKit";
import { levelWords, placementPath, planSummary, planView, type PlanData } from "@/lib/placementPlan";
import type { PlacementStatus } from "@/lib/usePlacementState";
import { plural } from "@/lib/format";
import { PlacementDoors } from "./PlacementDoors";
import styles from "./placement.module.css";

export function PlacementAside({
  data,
  basePath,
  state,
  next,
  readCount,
}: {
  data: PlanData;
  basePath: string;
  state: PlacementStatus;
  next: { id: string } | null;
  readCount: number;
}) {
  if (!state.mounted) return null;

  if (state.firstTime) {
    return (
      <Card at="c" tilt={1} aria-labelledby="doors-title">
        <p className={styles.cardKicker} id="doors-title">
          Where do you start?
        </p>
        <PlacementDoors data={data} basePath={basePath} pickHref={`/level/${data.topicId}`} />
      </Card>
    );
  }

  if (state.placement) {
    const view = planView(state.placement, data.chapters);
    return (
      <Card at="c" tilt={1} aria-labelledby="plan-title" className={styles.afterBudget} data-plan>
        <p className={styles.cardKicker}>Your plan</p>
        <h2 className={styles.cardTitle} id="plan-title">
          {levelWords(view.level, data.levelNames)}
        </h2>
        <p className={styles.cardText}>{planSummary(view)}. Nothing is locked.</p>
        <div className={styles.cardActions}>
          {next ? (
            <Button href={`${basePath}/${next.id}`}>
              Continue <span aria-hidden="true">→</span>
            </Button>
          ) : (
            <Button href="/review">
              Review <span aria-hidden="true">→</span>
            </Button>
          )}
          <Link className={styles.cardLink} href={placementPath(data.topicId)} prefetch={false}>
            See the plan
          </Link>
          <Link className={styles.cardLink} href={placementPath(data.topicId, true)} prefetch={false} data-recheck="">
            {state.marks ? "Re-check my level" : "Retake the placement"}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card at="c" tilt={1} aria-labelledby="recheck-title" className={styles.afterBudget}>
      <p className={styles.cardKicker}>Your level</p>
      <h2 className={styles.cardTitle} id="recheck-title">
        Where are you now?
      </h2>
      <p className={styles.cardText}>
        You have {plural(readCount, "chapter")} ticked. A short placement gives you a plan, and it never changes a tick.
      </p>
      <div className={styles.cardActions}>
        <Link className={topicKit.btnGhost} href={placementPath(data.topicId, true)} prefetch={false} data-recheck="">
          Re-check my level
        </Link>
      </div>
    </Card>
  );
}
