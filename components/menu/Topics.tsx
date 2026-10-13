"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon, type MenuIconName } from "@/components/menu/MenuIcon";
import { Eyebrow, kit } from "@/components/ui/MenuKit";
import { groupByCategory, isReadable, topicTally } from "@/lib/topicCategories";
import { navHref, type GuideNav } from "@/lib/topicNav";
import type { TopicNav } from "@/content/types";
import styles from "../SiteDrawer.module.css";

export interface Hit {
  href: string;
  label: string;
  mark: string;
  meta: string;
}

export function topicHit(t: TopicNav): Hit {
  return {
    href: navHref(t, null),
    label: t.name,
    mark: t.mark,
    meta: isReadable(t) ? `${t.written} ${t.written === 1 ? "chapter" : "chapters"}` : "Soon",
  };
}

export function HitLink({ hit, here, onClose }: { hit: Hit; here: boolean; onClose: () => void }) {
  return (
    <Link
      href={hit.href}
      className={kit.row}
      aria-current={here ? "page" : undefined}
      onClick={onClose}
      prefetch={false}
    >
      <span className={kit.code} aria-hidden="true">
        {hit.mark}
      </span>
      <span className={kit.title}>{hit.label}</span>
      <span className={kit.meta}>{hit.meta}</span>
    </Link>
  );
}

function Panel({
  id,
  labelledBy,
  open,
  children,
}: {
  id: string;
  labelledBy: string;
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      hidden={!open}
      inert={!open}
      className={styles.accordionPanel}
    >
      {children}
    </div>
  );
}

function AccordionHead({
  id,
  panelId,
  icon,
  name,
  meta,
  open,
  onToggle,
}: {
  id: string;
  panelId: string;
  icon: MenuIconName;
  name: string;
  meta: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <h3 className={styles.accordionLabel}>
      <button
        type="button"
        id={id}
        className={styles.accordionHead}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={styles.rowIcon} aria-hidden="true">
          <MenuIcon name={icon} size={22} />
        </span>
        <span className={kit.title}>{name}</span>
        <span className={kit.meta} aria-hidden="true">
          {meta}
        </span>
        <span className={kit.chevron} aria-hidden="true" />
      </button>
    </h3>
  );
}

function GuidePanel({ guide, pathname, onClose }: { guide: GuideNav; pathname: string; onClose: () => void }) {
  return (
    <nav aria-label={guide.name} className={styles.guideNav}>
      <Link
        href={guide.href}
        className={kit.row}
        aria-current={pathname === guide.href ? "page" : undefined}
        onClick={onClose}
        prefetch={false}
      >
        <span className={kit.code} aria-hidden="true">
          {guide.mark}
        </span>
        <span className={kit.title}>Start page</span>
        <span className={kit.meta} aria-hidden="true">
          →
        </span>
      </Link>
      {guide.groups.map((g) => (
        <div key={g.title} className={styles.group}>
          <p className={styles.groupLabel}>
            {g.title} · {g.chapters.length}
          </p>
          <ul className={kit.rows}>
            {g.chapters.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className={kit.row}
                  aria-current={pathname === c.href ? "page" : undefined}
                  onClick={onClose}
                  prefetch={false}
                >
                  <span className={kit.code} aria-hidden="true">
                    {c.num}
                  </span>
                  <span className={kit.title}>{c.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function TopicsSection({
  topics,
  guides,
  current,
  pathname,
  onClose,
}: {
  topics: TopicNav[];
  guides: GuideNav[];
  current: string | null;
  pathname: string;
  onClose: () => void;
}) {
  const groups = groupByCategory(topics);
  const category = groups.find((group) => group.topics.some((t) => t.id === current));
  const guide = guides.find(
    (g) => g.href === pathname || g.groups.some((grp) => grp.chapters.some((c) => c.href === pathname))
  );
  const here = category?.id ?? guide?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(here ?? groups[0]?.id ?? null);
  const [seen, setSeen] = useState(here);
  if (seen !== here) {
    setSeen(here);
    if (here) setOpenId(here);
  }
  const toggle = (id: string) => setOpenId(openId === id ? null : id);
  const tally = topicTally(topics);

  return (
    <section className={styles.block} aria-labelledby="menu-topics">
      <Eyebrow no="03" id="menu-topics" count={`${tally.written} of ${tally.total} written`}>
        Topics
      </Eyebrow>
      <nav aria-label="Topics" className={styles.accordion}>
        {groups.map((group) => {
          const open = group.id === openId;
          return (
            <section key={group.id} className={styles.accordionItem} data-open={open || undefined}>
              <AccordionHead
                id={`topic-group-${group.id}`}
                panelId={`topic-panel-${group.id}`}
                icon={group.id}
                name={`${group.label} · ${group.topics.length}`}
                meta={`${group.topics.filter(isReadable).length}/${group.topics.length}`}
                open={open}
                onToggle={() => toggle(group.id)}
              />
              <Panel id={`topic-panel-${group.id}`} labelledBy={`topic-group-${group.id}`} open={open}>
                <ul className={kit.rows}>
                  {group.topics.map((t) => (
                    <li key={t.id} className={isReadable(t) ? undefined : styles.soon}>
                      <HitLink hit={topicHit(t)} here={t.id === current} onClose={onClose} />
                    </li>
                  ))}
                </ul>
              </Panel>
            </section>
          );
        })}
      </nav>
      <div className={styles.accordion}>
        {guides.map((g) => {
          const open = g.id === openId;
          const hereChapter = g.groups.flatMap((grp) => grp.chapters).find((c) => c.href === pathname);
          return (
            <section key={g.id} className={styles.accordionItem} data-open={open || undefined}>
              <AccordionHead
                id={`guide-${g.id}`}
                panelId={`guide-panel-${g.id}`}
                icon={g.id === "interview" ? "interview" : "architecture"}
                name={g.name}
                meta={hereChapter ? hereChapter.num : `${g.total} chapters`}
                open={open}
                onToggle={() => toggle(g.id)}
              />
              <Panel id={`guide-panel-${g.id}`} labelledBy={`guide-${g.id}`} open={open}>
                <GuidePanel guide={g} pathname={pathname} onClose={onClose} />
              </Panel>
            </section>
          );
        })}
      </div>
    </section>
  );
}
