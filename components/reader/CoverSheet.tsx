import Link from "next/link";
import { CoverMap, type RouteGroup, type Station } from "@/components/reader/CoverMap";
import { readTime } from "@/lib/content";
import { levels as levelsFor } from "@/lib/topics";
import type { Chapter, NotesFile } from "@/content/types";

function toStation(ch: Chapter): Station {
  return {
    id: ch.id,
    num: ch.num,
    short: ch.short,
    subtitle: ch.subtitle,
    minutes: readTime(ch),
    exercises: (ch.practice || []).length,
    ready: ch.ready,
  };
}

function routeGroups(data: NotesFile, topicId: string): RouteGroup[] {
  const claimed = new Set<string>();
  const groups: RouteGroup[] = [];

  for (const level of levelsFor(topicId)) {
    const stations = data.chapters
      .filter((ch) => (ch.levels || []).indexOf(level.id) !== -1 && !claimed.has(ch.id))
      .map((ch) => {
        claimed.add(ch.id);
        return toStation(ch);
      });
    if (stations.length) groups.push({ id: level.id, name: level.name, stations });
  }

  const rest = data.chapters.filter((ch) => !claimed.has(ch.id)).map(toStation);
  if (rest.length) groups.push({ id: "rest", name: groups.length ? "Also here" : "Chapters", stations: rest });

  return groups;
}

export function CoverSheet({ data, basePath, topicId }: { data: NotesFile; basePath: string; topicId: string }) {
  const written = data.chapters.filter((c) => c.ready).length;
  const groups = routeGroups(data, topicId);

  return (
    <section className="sheet cover" id="top">
      <h1>{data.meta.title}</h1>
      <p className="sub">{data.meta.subtitle}</p>
      <p className="lead">{data.meta.lead}</p>
      <div className="cover__meta">
        <span className="chip">
          {written} / {data.chapters.length} chapters written
        </span>
        <span className="chip">by {data.meta.author}</span>
        <span className="chip">updated {data.meta.updated}</span>
      </div>
      {data.hero?.figure && <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: data.hero.figure }} />}

      <CoverMap groups={groups} basePath={basePath} />

      <noscript>
        <nav className="toc" aria-label="Chapters">
          {data.chapters.map((ch) => (
            <Link key={ch.id} href={`${basePath}/${ch.id}`}>
              <b>{ch.num}</b>
              {ch.short}
            </Link>
          ))}
        </nav>
      </noscript>
    </section>
  );
}
