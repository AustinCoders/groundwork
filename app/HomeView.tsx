"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Shell } from "@/components/Shell";
import { topicHref } from "@/lib/topics";
import { escapeHtml, plural } from "@/lib/format";
import type { SiteStats, TopicStat } from "@/lib/topicStats";
import { prefersMotion } from "@/lib/dom";
import { useClientValue, useLastLevel, useMounted } from "@/lib/hooks";
import type { Topic } from "@/content/types";

export interface HomeViewProps {
  topicsList: Topic[];
  stats: SiteStats;
  perTopic: Record<string, TopicStat>;
}

function raw(html: string) {
  return { __html: html };
}

function StatCounter({
  target,
  suffix,
  label,
  start,
}: {
  target: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const [animatedDisplay, setAnimatedDisplay] = useState(0);
  const motion = useClientValue(prefersMotion, false);
  const display = start && !motion ? target : animatedDisplay;

  useEffect(() => {
    if (!start || !motion) return;
    let raf = 0;
    let startTime: number | null = null;
    const duration = 700;
    function frame(now: number) {
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [start, target, motion]);

  return (
    <div className="stat">
      {/* Reserve the final width up front — counting up from 0 changes the
          digit count, and without a fixed box that reflows the stats row
          on every frame (this was the biggest source of layout shift). */}
      <span className="stat__num" style={{ minWidth: `${String(target).length + suffix.length}ch` }}>
        {display}
        {suffix}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  );
}

function HeroStats({ stats }: { stats: [number, string, string?][] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [observedStart, setObservedStart] = useState(false);
  const hasIO = useClientValue(() => "IntersectionObserver" in window, false);
  const start = hasIO ? observedStart : true;

  useEffect(() => {
    if (!hostRef.current || !hasIO) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setObservedStart(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(hostRef.current);
    return () => io.disconnect();
  }, [hasIO]);

  return (
    <div className="hero__stats" id="hero-stats" ref={hostRef}>
      {stats.map(([target, label, suffix]) => (
        <StatCounter key={label} target={target} suffix={suffix || ""} label={label} start={start} />
      ))}
    </div>
  );
}

function FeaturedTopic({ topic, href, stat }: { topic: Topic; href: string; stat: TopicStat }) {
  const { written, exercises: exerciseCount, minutes } = stat;

  return (
    <Link href={href} className={`featured t-${topic.accent}`}>
      <span className="featured__badge">ready to read</span>
      <div className="featured__body">
        <span className="featured__mark" aria-hidden="true" dangerouslySetInnerHTML={raw(escapeHtml(topic.mark))} />
        <div className="featured__text">
          <h2 className="featured__name" dangerouslySetInnerHTML={raw(topic.name)} />
          <p className="featured__tagline" dangerouslySetInnerHTML={raw(topic.tagline)} />
          <p className="featured__blurb" dangerouslySetInnerHTML={raw(topic.blurb)} />
          <div className="featured__meta">
            <span>{plural(written, "chapter")} written</span>
            {exerciseCount > 0 && <span>{plural(exerciseCount, "exercise")}</span>}
            <span>{minutes} min read</span>
          </div>
        </div>
      </div>
      <span className="btn btn--primary featured__cta">Start reading →</span>
    </Link>
  );
}

function TopicRow({
  topic,
  href,
  visible,
  plannedCount,
}: {
  topic: Topic;
  href: string;
  visible: boolean;
  plannedCount: number;
}) {
  return (
    <Link href={href} className={`topic-row t-${topic.accent}${visible ? "" : " is-filtered-out"}`}>
      <span className="topic-row__top">
        <span className="topic-row__mark" aria-hidden="true" dangerouslySetInnerHTML={raw(escapeHtml(topic.mark))} />
        <span className="topic-row__name" dangerouslySetInnerHTML={raw(topic.name)} />
        <span className="topic-row__go" aria-hidden="true">
          →
        </span>
      </span>
      <span className="topic-row__tagline" dangerouslySetInnerHTML={raw(topic.tagline)} />
      <span className="topic-row__meta">{plural(plannedCount, "chapter")} planned</span>
    </Link>
  );
}

export function HomeView({ topicsList, stats: site, perTopic }: HomeViewProps) {
  const mounted = useMounted();
  const savedLevel = useLastLevel();
  const [search, setSearch] = useState("");

  const stats: [number, string, string?][] = [
    [site.writtenChapters, "chapters written"],
    [site.exercises, "runnable exercises"],
    [site.minutes, "of reading", " min"],
    [site.topics, "topics on the shelf"],
  ];

  // "Featured" means the topic actually has written chapters, not just a
  // route (topic.status "ready" just means the page exists — most topics
  // have that with zero written chapters, so it's not a useful signal here).
  const readyTopics = useMemo(
    () => topicsList.filter((t) => (perTopic[t.id]?.written ?? 0) > 0),
    [topicsList, perTopic]
  );
  const soonTopics = useMemo(
    () => topicsList.filter((t) => (perTopic[t.id]?.written ?? 0) === 0),
    [topicsList, perTopic]
  );

  const q = search.trim().toLowerCase();
  const visibility = useMemo(() => {
    const map = new Map<string, boolean>();
    soonTopics.forEach((t) => {
      const name = `${t.name} ${t.tagline} ${t.blurb}`.toLowerCase();
      map.set(t.id, !q || name.indexOf(q) !== -1);
    });
    return map;
  }, [soonTopics, q]);

  const visibleCount = Array.from(visibility.values()).filter(Boolean).length;

  return (
    <Shell skipLabel="Skip to the topics">
      <section className="sheet hero">
        <svg className="hero__doodle hero__doodle--clip" viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M16 20 L16 34 a8 8 0 0 0 16 0 L32 12 a5 5 0 0 0-10 0 L22 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
        <svg className="hero__doodle hero__doodle--spark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="currentColor" />
        </svg>

        <span className="hero__kicker">my notes, in public</span>
        <h1>
          Everything I know, on <span className="hero__mark">paper</span>
        </h1>
        <p className="hero__lead">
          Notes I actually wrote while learning — layered bottom to top, so nothing uses a word that hasn&apos;t been
          explained yet. Pick a topic, tell it where you are, and it hands you a reading path with code you can run
          right here.
        </p>

        <div className="hero__actions">
          <Link className="btn btn--primary btn--big" href="/level?topic=js">
            Start with JavaScript →
          </Link>
          <Link className="hero__secondary" href="/practice?id=free">
            or open the playground
          </Link>
        </div>

        <HeroStats stats={stats} />
      </section>

      <ol className="howto-strip" aria-label="How this works">
        <li>
          <span className="howto-strip__num">1</span>
          <div>
            <h3>Pick a topic</h3>
            <p>One is finished — the rest show what&apos;s planned.</p>
          </div>
        </li>
        <li>
          <span className="howto-strip__num">2</span>
          <div>
            <h3>Say where you&apos;re at</h3>
            <p>Beginner, intermediate or advanced — it only changes the order.</p>
          </div>
        </li>
        <li>
          <span className="howto-strip__num">3</span>
          <div>
            <h3>Read, then run it</h3>
            <p>Every layer that needs practice links to a code editor with real tests.</p>
          </div>
        </li>
      </ol>

      {readyTopics.length > 0 && (
        <>
          <h2 className="section-title">Ready to read</h2>
          <p className="section-note">Written, with a path through it — pick one up.</p>
          {readyTopics.map((topic) => (
            <FeaturedTopic
              key={topic.id}
              topic={topic}
              href={mounted ? topicHref(topic, savedLevel) : topicHref(topic, null)}
              stat={perTopic[topic.id]}
            />
          ))}
        </>
      )}

      <div className="topics-head">
        <div>
          <h2 className="section-title">More topics</h2>
          <p className="section-note">
            Still just an outline — the shelf they&apos;ll land on once they&apos;re written.
          </p>
        </div>
        <div className="shelf-search">
          <span className="shelf-search__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="topic-search"
            type="search"
            placeholder="Search topics…"
            aria-label="Search topics"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="topics-compact" id="topic-grid">
        {soonTopics.map((topic) => (
          <TopicRow
            key={topic.id}
            topic={topic}
            href={mounted ? topicHref(topic, savedLevel) : topicHref(topic, null)}
            visible={visibility.get(topic.id) ?? true}
            plannedCount={perTopic[topic.id]?.planned ?? 0}
          />
        ))}
      </div>
      <p className={`shelf-empty${visibleCount === 0 ? " is-visible" : ""}`} id="shelf-empty">
        No topic matches that search — try a different word.
      </p>

      <footer className="site-foot">
        <span>Written by hand, rendered by a browser.</span>
        <Link href="/notes">JS notes</Link>
        <Link href="/practice?id=free">Playground</Link>
      </footer>
    </Shell>
  );
}
