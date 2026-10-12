"use client";

import { Copy, Scene } from "@/components/home/Stage";
import { Card, Compose, Remark, Tag } from "@/components/topic/Compose";
import {
  Actions,
  Button,
  CardKicker,
  Chips,
  Facts,
  Heading,
  Kicker,
  Lead,
  ProgressMeter,
  Underlined,
  topicKit,
} from "@/components/topic/TopicKit";
import { BADGES, type Badge, type Stats } from "@/lib/gamification";
import { plural } from "@/lib/format";
import { badgeStanding, XP_PER, xpToGo } from "./progressModel";
import kit from "@/app/mock/mockKit.module.css";
import styles from "./progress.module.css";

export interface HeroAction {
  href: string;
  label: string;
}

function pendingClass(loaded: boolean, className?: string): string | undefined {
  return [className, loaded ? undefined : topicKit.pending].filter(Boolean).join(" ") || undefined;
}

function LevelCard({ loaded, stats, leveledUp }: { loaded: boolean; stats: Stats; leveledUp: boolean }) {
  return (
    <Card as="aside" aria-label="Your level" at="a" tilt={-1} taped className={pendingClass(loaded, styles.level)}>
      {leveledUp && (
        <>
          <span className={`${kit.stamp} ${styles.levelUp}`} aria-hidden="true">
            <b>Level up</b>
            <small>now level {stats.level}</small>
          </span>
          <span className={topicKit.sr} role="status">
            Level up. You are now level {stats.level}.
          </span>
        </>
      )}
      <CardKicker>Your level</CardKicker>
      <div className={styles.levelRow}>
        <span className={styles.levelNo}>{stats.level}</span>
        <span className={styles.levelSide}>
          <b>{xpToGo(stats)} XP to go</b>
          <small>to reach level {stats.level + 1}</small>
        </span>
      </div>
      <ProgressMeter
        done={stats.xpIntoLevel}
        total={stats.xpForNextLevel}
        label={`${stats.xpIntoLevel} / ${stats.xpForNextLevel} XP`}
      />
    </Card>
  );
}

function NumbersCard({ loaded, stats }: { loaded: boolean; stats: Stats }) {
  const sticker = stickerFor(stats);
  return (
    <Card as="aside" aria-label="Your numbers" at="b" tilt={1} className={pendingClass(loaded)}>
      <Tag tone={sticker.tone}>{sticker.text}</Tag>
      <CardKicker>Your numbers</CardKicker>
      <Facts
        items={[
          { value: stats.streak, label: "day streak" },
          { value: stats.chaptersRead, label: "chapters read" },
          { value: stats.exercisesSolved, label: "exercises solved" },
          { value: stats.totalReviews, label: "reviews done" },
        ]}
      />
      <Remark>{stats.streak > 0 ? "keep it going" : "start with one"}</Remark>
    </Card>
  );
}

function NextBadgeCard({
  loaded,
  stats,
  badge,
  earned,
}: {
  loaded: boolean;
  stats: Stats;
  badge: Badge | null;
  earned: number;
}) {
  const standing = badge ? badgeStanding(badge, stats) : null;
  return (
    <Card decor extra at="c" tone="note" tilt={-1} className={pendingClass(loaded)}>
      <CardKicker>{badge ? "Next badge" : "Badge wall"}</CardKicker>
      {badge && standing ? (
        <>
          <div className={styles.badgeHead}>
            <span className={styles.badgeIcon}>{badge.icon}</span>
            <span className={styles.badgeText}>
              <b>{badge.name}</b>
              <small>{badge.description}</small>
            </span>
          </div>
          <div className={styles.badgeMeter}>
            <span className={styles.badgeTrack}>
              <span style={{ width: `${standing.ratio * 100}%` }} />
            </span>
            <span className={styles.badgeCount}>{standing.label}</span>
          </div>
        </>
      ) : (
        <p className={styles.badgeAll}>All {earned} earned. Nothing left on the wall.</p>
      )}
    </Card>
  );
}

function stickerFor(stats: Stats): { text: string; tone: "success" | "caution" | "info" } {
  if (stats.streak > 0) return { text: `✓ ${plural(stats.streak, "day")} in a row`, tone: "success" };
  if (stats.activeDays > 0) return { text: "▤ streak is off", tone: "caution" };
  return { text: "▤ day one", tone: "info" };
}

export function ProgressHero({
  loaded,
  stats,
  leveledUp,
  earned,
  badge,
  primary,
  secondary,
}: {
  loaded: boolean;
  stats: Stats;
  leveledUp: boolean;
  earned: number;
  badge: Badge | null;
  primary: HeroAction | null;
  secondary: HeroAction;
}) {
  const fresh = stats.xp === 0;
  return (
    <Scene className={topicKit.hero}>
      <Copy>
        <Kicker mark="▤">Your progress · saved in this browser</Kicker>
        <div className={loaded ? undefined : topicKit.pending}>
          <Heading id="progress-title">
            Level {stats.level}, <Underlined>{xpToGo(stats)} XP to go.</Underlined>
          </Heading>
          <Lead>
            {fresh
              ? `Read a chapter and it starts here: ${XP_PER.chapter} XP for a chapter, ${XP_PER.exercise} for an exercise, ${XP_PER.review} for a review.`
              : `${stats.xp} XP so far: ${plural(stats.chaptersRead, "chapter")} read, ${plural(stats.exercisesSolved, "exercise")} solved and ${plural(stats.totalReviews, "review")} done.`}
          </Lead>
          <Actions>
            {primary && <Button href={primary.href}>{primary.label}</Button>}
            <Button href={secondary.href} ghost>
              {secondary.label}
            </Button>
          </Actions>
          <Chips>
            <span className={topicKit.chip}>best streak {stats.bestStreak}</span>
            <span className={topicKit.chip}>{plural(stats.activeDays, "active day")}</span>
            <span className={topicKit.chip}>
              {earned} of {BADGES.length} badges
            </span>
          </Chips>
        </div>
      </Copy>
      <Compose live layout="trio">
        <LevelCard loaded={loaded} stats={stats} leveledUp={leveledUp} />
        <NumbersCard loaded={loaded} stats={stats} />
        <NextBadgeCard loaded={loaded} stats={stats} badge={badge} earned={earned} />
      </Compose>
    </Scene>
  );
}
