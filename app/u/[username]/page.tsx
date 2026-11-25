import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { AvatarArt } from "@/components/account/AvatarArt";
import { PageFrame } from "@/components/frame/PageFrame";
import { avatarStyle } from "@/lib/account/avatar";
import type { AvatarArt as Art, AvatarColor } from "@/lib/account/profileExtras";
import { BADGES } from "@/lib/gamification";
import { pageMetadata } from "@/lib/metadata";
import { fetchPublicProfile } from "@/lib/profile/fetchPublic";
import { HEAT_DAYS, safeGithub, safeLinkedin, safeWebsite } from "@/lib/profile/publicCard";
import { ROLE_TITLE } from "@/lib/profile/roles";
import type { RoleId } from "@/lib/profile/roleTracks";
import styles from "./public.module.css";

export const revalidate = 300;

type Params = { params: Promise<{ username: string }> };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "")).toUpperCase() || "?";
}

function heatLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function monthDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const found = await fetchPublicProfile(username);
  if (!found) return { title: "Profile not found", robots: { index: false, follow: false } };
  const { card } = found;
  const base = pageMetadata({
    title: `${card.name}, learning profile`,
    description:
      card.headline ||
      `Level ${card.level}, ${card.chapters} chapters read and ${card.exercises} exercises solved on Groundwork.`,
    path: `/u/${found.username}`,
    index: false,
  });
  const image = {
    url: `/u/${found.username}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: `${card.name} on Groundwork`,
  };
  return {
    ...base,
    openGraph: { ...base.openGraph, images: [image] },
    twitter: { ...base.twitter, card: "summary_large_image", images: [image.url] },
  };
}

export default async function PublicProfilePage({ params }: Params) {
  const { username } = await params;
  const found = await fetchPublicProfile(username);
  if (!found) notFound();
  const { card } = found;
  const github = card.github ? safeGithub(card.github) : null;
  const linkedin = card.linkedin ? safeLinkedin(card.linkedin) : null;
  const website = card.website ? safeWebsite(card.website) : null;
  const badges = BADGES.filter((b) => card.badges.includes(b.id));
  const heat = [...Array(Math.max(0, HEAT_DAYS - card.heat.length)).fill(0), ...card.heat] as number[];
  const weeks = Array.from({ length: Math.ceil(heat.length / 7) }, (_, w) => heat.slice(w * 7, w * 7 + 7));
  const activeDays = card.heat.filter((n) => n > 0).length;
  const stats = [
    { label: "Level", value: card.level },
    { label: "XP", value: card.xp },
    { label: "Day streak", value: card.streak },
    { label: "Best streak", value: card.bestStreak },
    { label: "Chapters read", value: card.chapters },
    { label: "Exercises solved", value: card.exercises },
  ];

  return (
    <PageFrame title="Profile" mark="◉" accent="blue" layout="reader" skipLabel="Skip to the profile">
      <article className={styles.page}>
        <header className={styles.hero}>
          <span
            className={styles.avatar}
            style={avatarStyle(card.color as AvatarColor) as CSSProperties | undefined}
            aria-hidden="true"
          >
            {card.art ? <AvatarArt art={card.art as Art} /> : initials(card.name)}
          </span>
          <div className={styles.who}>
            <h1 className={styles.name}>{card.name}</h1>
            {card.headline && <p className={styles.headline}>{card.headline}</p>}
            <p className={styles.meta}>
              {card.role && <span className={styles.chip}>{ROLE_TITLE[card.role as RoleId]}</span>}
              {card.location && <span>📍 {card.location}</span>}
              <span className={styles.handle}>@{found.username}</span>
            </p>
            {(github || linkedin || website) && (
              <ul className={styles.links} aria-label="Links">
                {github && (
                  <li>
                    <a href={github} rel="nofollow noopener ugc" target="_blank">
                      GitHub
                    </a>
                  </li>
                )}
                {linkedin && (
                  <li>
                    <a href={linkedin} rel="nofollow noopener ugc" target="_blank">
                      LinkedIn
                    </a>
                  </li>
                )}
                {website && (
                  <li>
                    <a href={website} rel="nofollow noopener ugc" target="_blank">
                      Website
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>
        </header>

        <section aria-labelledby="public-stats" className={styles.section}>
          <h2 id="public-stats" className={styles.h2}>
            On Groundwork
          </h2>
          <dl className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <dt>{s.label}</dt>
                <dd>{s.value.toLocaleString("en-IN")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="public-heat" className={styles.section}>
          <h2 id="public-heat" className={styles.h2}>
            The last six months
          </h2>
          <p className={styles.sub}>
            Studied on {activeDays} {activeDays === 1 ? "day" : "days"}
            {card.heatEnd ? ` up to ${monthDay(card.heatEnd)}` : ""}.
          </p>
          <div className={styles.heatScroll}>
            <div className={styles.heat} role="img" aria-label={`Studied on ${activeDays} days in the last six months`}>
              {weeks.map((week, w) => (
                <span key={w} className={styles.week}>
                  {week.map((n, d) => (
                    <span key={d} className={styles.cell} data-level={heatLevel(n)} />
                  ))}
                </span>
              ))}
            </div>
          </div>
        </section>

        {card.topics.length > 0 && (
          <section aria-labelledby="public-topics" className={styles.section}>
            <h2 id="public-topics" className={styles.h2}>
              Topics
            </h2>
            <ul className={styles.topics}>
              {card.topics.slice(0, 10).map((topic) => (
                <li key={topic.id} className={styles.topic}>
                  <span className={styles.topicMark} aria-hidden="true">
                    {topic.mark}
                  </span>
                  <span className={styles.topicName}>{topic.name}</span>
                  <span className={styles.bar} aria-hidden="true">
                    <span style={{ width: `${topic.pct}%` }} />
                  </span>
                  <span className={styles.pct}>{topic.pct}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {badges.length > 0 && (
          <section aria-labelledby="public-badges" className={styles.section}>
            <h2 id="public-badges" className={styles.h2}>
              Badges
            </h2>
            <ul className={styles.badges}>
              {badges.map((b) => (
                <li key={b.id} className={styles.badge} title={b.description}>
                  <span aria-hidden="true">{b.icon}</span>
                  {b.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className={styles.foot}>
          <p>
            {card.name} chose to share this. The numbers come from their own progress on Groundwork
            {found.at
              ? `, last updated ${new Date(found.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
            .
          </p>
          <Link href="/" className={styles.cta}>
            Learn with Groundwork, free →
          </Link>
        </footer>
      </article>
    </PageFrame>
  );
}
