"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "@/components/menu/MenuIcon";
import { accentVar } from "@/lib/accent";
import { groupByCategory, isReadable } from "@/lib/topicCategories";
import { navHref, type GuideNav } from "@/lib/topicNav";
import type { TopicNav } from "@/content/types";
import styles from "../SiteDrawer.module.css";

export interface Hit {
  href: string;
  label: string;
  mark: string;
  accent: string;
  meta: string;
}

export function topicHit(t: TopicNav): Hit {
  return {
    href: navHref(t, null),
    label: t.name,
    mark: t.mark,
    accent: t.accent,
    meta: isReadable(t) ? `${t.written} ${t.written === 1 ? "chapter" : "chapters"}` : "Soon",
  };
}

export function HitLink({ hit, here, onClose }: { hit: Hit; here: boolean; onClose: () => void }) {
  return (
    <Link
      href={hit.href}
      className={styles.hit}
      aria-current={here ? "page" : undefined}
      onClick={onClose}
      prefetch={false}
      style={{ "--accent": accentVar(hit.accent) } as React.CSSProperties}
    >
      <span className={styles.chip} aria-hidden="true">
        {hit.mark}
      </span>
      <span className={styles.hitLabel}>{hit.label}</span>
      <span className={styles.hitMeta}>{hit.meta}</span>
    </Link>
  );
}

const CATEGORY_ACCENT: Record<string, string> = {
  languages: "blue",
  web: "orange",
  backend: "teal",
  data: "green",
  cs: "purple",
  devops: "red",
  engineering: "yellow",
  ai: "purple",
};

const MINI_RADIUS = 11;
const MINI_LENGTH = 2 * Math.PI * MINI_RADIUS;

function MiniRing({ ready, total }: { ready: number; total: number }) {
  return (
    <span className={styles.miniRing} aria-hidden="true">
      <svg viewBox="0 0 28 28" width="28" height="28">
        <circle className={styles.ringTrack} cx="14" cy="14" r={MINI_RADIUS} />
        <circle
          className={styles.ringFill}
          cx="14"
          cy="14"
          r={MINI_RADIUS}
          strokeDasharray={MINI_LENGTH}
          strokeDashoffset={MINI_LENGTH * (1 - ready / total)}
        />
      </svg>
      <span>{ready}</span>
    </span>
  );
}

export function TopicList({
  topics,
  current,
  onClose,
}: {
  topics: TopicNav[];
  current: string | null;
  onClose: () => void;
}) {
  const groups = groupByCategory(topics);
  const categoryOf = (topicId: string | null) => groups.find((group) => group.topics.some((t) => t.id === topicId));
  const [openId, setOpenId] = useState<string | null>(() => (categoryOf(current) ?? groups[0])?.id ?? null);
  const [seenCurrent, setSeenCurrent] = useState(current);
  if (seenCurrent !== current) {
    setSeenCurrent(current);
    const here = categoryOf(current);
    if (here) setOpenId(here.id);
  }
  return (
    <nav aria-label="Topics" className={styles.topicNav}>
      {groups.map((group) => {
        const open = group.id === openId;
        return (
          <section
            key={group.id}
            className={styles.topicGroup}
            data-open={open || undefined}
            data-here={group.id === categoryOf(current)?.id || undefined}
            style={{ "--accent": accentVar(CATEGORY_ACCENT[group.id] ?? "ink") } as React.CSSProperties}
          >
            <h3 className={styles.categoryLabel}>
              <button
                type="button"
                id={`topic-group-${group.id}`}
                className={styles.categoryHead}
                aria-expanded={open}
                aria-controls={`topic-panel-${group.id}`}
                onClick={() => setOpenId(open ? null : group.id)}
              >
                <span className={styles.categoryIcon} aria-hidden="true">
                  <MenuIcon name={group.id} size={17} />
                </span>
                <span className={styles.categoryName}>
                  {group.label} · {group.topics.length}
                </span>
                <MiniRing ready={group.topics.filter(isReadable).length} total={group.topics.length} />
                <span className={styles.chevron} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`topic-panel-${group.id}`}
              role="region"
              aria-labelledby={`topic-group-${group.id}`}
              hidden={!open}
              inert={!open}
              className={styles.topicPanel}
            >
              <ul className={styles.hits}>
                {group.topics.map((t) => (
                  <li key={t.id} className={isReadable(t) ? undefined : styles.soon}>
                    <HitLink hit={topicHit(t)} here={t.id === current} onClose={onClose} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </nav>
  );
}

export function GuideList({ guide, pathname, onClose }: { guide: GuideNav; pathname: string; onClose: () => void }) {
  const style = { "--accent": accentVar(guide.accent) } as React.CSSProperties;
  return (
    <nav aria-label={guide.name} className={styles.guideNav}>
      <Link
        href={guide.href}
        className={styles.overview}
        aria-current={pathname === guide.href ? "page" : undefined}
        onClick={onClose}
        prefetch={false}
        style={style}
      >
        <span className={styles.chip} aria-hidden="true">
          {guide.mark}
        </span>
        <span className={styles.hitLabel}>Start page</span>
        <span aria-hidden="true">→</span>
      </Link>
      {guide.groups.map((g) => (
        <div key={g.title} className={styles.group}>
          <p className={styles.groupLabel}>
            {g.title} · {g.chapters.length}
          </p>
          <ul className={styles.hits}>
            {g.chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className={styles.hit}
                  aria-current={pathname === c.href ? "page" : undefined}
                  onClick={onClose}
                  prefetch={false}
                  style={style}
                >
                  <span className={styles.num} aria-hidden="true">
                    {c.num}
                  </span>
                  <span className={styles.hitLabel}>{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
